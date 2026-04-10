import json
import re

import pandas as pd
import requests

LOT_PATTERN = re.compile(r"dommages aux biens", re.IGNORECASE)


def _text(val):
    if isinstance(val, dict):
        return val.get("#text", "")
    return str(val or "")


def search_boamp_collectivites(url):
    # Liste des codes CPV cibles pour Dommages aux biens / CatNat
    # 66515000: Dommages, 66515200: Biens, 66515400: Climatique

    where_clause = (
        '"66515000" OR "66515200" OR "66515400" OR "66515410"'
        #'AND dc="20" '
        'AND type_avis="10" '  # Avis clôturés (Attribution)
        'AND (datelimitereponse < "2026-04-03" OR datefindiffusion < "2026-04-03")'
    )

    params = {
        "where": where_clause,
        "order_by": "dateparution DESC",
        "limit": 100,
        "offset": 0,  # offset is limited to 10'000
    }
    all_records = []
    limit, offset = 100, 0
    total_count = 1
    while params["offset"] < total_count:
        try:
            params["offset"] = offset
            response = requests.get(url, params=params)
            response.raise_for_status()
            records = response.json().get("results", [])
            total_count = response.json().get("total_count", 0)

            """
            mots_clefs_collectivites = (
                r"(mairie|commune|ville|agglo|metropole|communaute)"
            )
            """

            for record in records:
                """
                nom_acheteur = record.get("nomacheteur", "")

                if not (
                    nom_acheteur
                    and re.search(mots_clefs_collectivites, nom_acheteur, re.IGNORECASE)
                ):
                    continue
                """

                donnees_dict = json.loads(record.get("donnees", "{}"))
                notice = donnees_dict.get("EFORMS", {}).get("ContractAwardNotice", {})
                ext = (
                    notice.get("ext:UBLExtensions", {})
                    .get("ext:UBLExtension", {})
                    .get("ext:ExtensionContent", {})
                    .get("efext:EformsExtension", {})
                )
                notice_result = ext.get("efac:NoticeResult", {})

                # --- EXTRACTION ACHETEUR ---
                org_data = ext.get("efac:Organizations", {}).get(
                    "efac:Organization", []
                )
                org_data = [org_data] if isinstance(org_data, dict) else org_data
                ext.get("efac:Organizations", {}).get("efac:Organization", [])
                orgs = {
                    _text(
                        o.get("efac:Company", {})
                        .get("cac:PartyIdentification", {})
                        .get("cbc:ID")
                    ): o.get("efac:Company", {})
                    for o in org_data
                }

                buyers_list = notice.get("cac:ContractingParty", [])
                if isinstance(buyers_list, dict):
                    buyers_list = [buyers_list]

                if buyers_list:
                    leader = buyers_list[0]
                    buyer_id_raw = (
                        leader.get("cac:Party", {})
                        .get("cac:PartyIdentification", {})
                        .get("cbc:ID", "")
                    )
                    buyer_id = _text(buyer_id_raw)
                else:
                    buyer_id = "ORG-0001"

                buyer = orgs.get(buyer_id, orgs.get("ORG-0001", {}))
                adresse_bloc = buyer.get("cac:PostalAddress", {})

                # --- MAPPING DES GAGNANTS ET MONTANTS ---
                org_map = {
                    k: _text(v.get("cac:PartyName", {}).get("cbc:Name"))
                    for k, v in orgs.items()
                }

                # Qui a déposé quelle offre ? (TenderingParty -> Entreprises)
                party_to_org = {}
                parties = notice_result.get("efac:TenderingParty", [])
                if isinstance(parties, dict):
                    parties = [parties]
                for p in parties:
                    tp_id = _text(p.get("cbc:ID"))
                    tenderers = p.get("efac:Tenderer", [])
                    if isinstance(tenderers, dict):
                        tenderers = [tenderers]
                    party_to_org[tp_id] = [
                        org_map.get(_text(t.get("cbc:ID")), "Inconnu")
                        for t in tenderers
                    ]

                # Offre -> Montant + Entreprises
                tenders = notice_result.get("efac:LotTender", [])
                if isinstance(tenders, dict):
                    tenders = [tenders]
                tender_details = {
                    _text(t.get("cbc:ID")): {
                        "montant": _text(
                            t.get("cac:LegalMonetaryTotal", {}).get("cbc:PayableAmount")
                        ),
                        "entreprises": party_to_org.get(
                            _text(t.get("efac:TenderingParty", {}).get("cbc:ID")), []
                        ),
                    }
                    for t in tenders
                }

                # LotResult -> Fusionner en dictionnaire par Lot (ex: {"LOT-0001": {...}})
                resultats_par_lot = {}
                lot_results = notice_result.get("efac:LotResult", [])
                if isinstance(lot_results, dict):
                    lot_results = [lot_results]
                for lr in lot_results:
                    if _text(lr.get("cbc:TenderResultCode")) == "selec-w":
                        lot_id = _text(lr.get("efac:TenderLot", {}).get("cbc:ID"))

                        lot_tenders = lr.get("efac:LotTender", [])
                        if isinstance(lot_tenders, dict):
                            lot_tenders = [lot_tenders]

                        tous_les_titulaires = []
                        tous_les_montants = []

                        for lt in lot_tenders:
                            t_ref = _text(lt.get("cbc:ID"))
                            details = tender_details.get(t_ref, {})

                            if details.get("entreprises"):
                                tous_les_titulaires.extend(details["entreprises"])
                            if details.get("montant"):
                                tous_les_montants.append(details["montant"])

                        resultats_par_lot[lot_id] = {
                            "entreprises": list(set(tous_les_titulaires)),
                            "montant": " / ".join(tous_les_montants)
                            if tous_les_montants
                            else None,
                        }

                # --- RECHERCHE DU LOT CIBLE ---
                lots = notice.get("cac:ProcurementProjectLot", [])
                if isinstance(lots, dict):
                    lots = [lots]

                lot_cible_extrait = None

                for lot in lots:
                    proj = lot.get("cac:ProcurementProject", {})
                    nom = _text(proj.get("cbc:Name"))
                    desc = _text(proj.get("cbc:Description"))

                    if LOT_PATTERN.search(nom) or LOT_PATTERN.search(desc):
                        lot_id = _text(lot.get("cbc:ID"))
                        period = proj.get("cac:PlannedPeriod", {})

                        # On récupère le résultat (gagnant/prix) pour ce lot précis
                        resultat_gagnant = resultats_par_lot.get(lot_id, {})

                        lot_cible_extrait = {
                            "lot_id": lot_id,
                            "lot_nom": nom,
                            "lot_description": desc,
                            "cpv": _text(
                                proj.get("cac:MainCommodityClassification", {}).get(
                                    "cbc:ItemClassificationCode"
                                )
                            ),
                            "duree_mois": _text(proj.get("cbc:DurationMeasure")),
                            "date_debut": _text(period.get("cbc:StartDate")),
                            "date_fin": _text(period.get("cbc:EndDate")),
                            "montant_estime": _text(
                                proj.get("cac:RequestedTenderTotal", {}).get(
                                    "cbc:EstimatedOverallContractAmount"
                                )
                            ),
                            "assureur": ", ".join(
                                resultat_gagnant.get("entreprises", [])
                            ),
                            "montant_attribue": resultat_gagnant.get("montant"),
                        }
                        break  # On a trouvé le lot cible, on arrête de chercher

                all_records.append(
                    {
                        "idweb": record.get("idweb"),
                        "objet_global": record.get("objet"),
                        "date_parution": record.get("dateparution"),
                        "acheteur": {
                            "nom": _text(
                                buyer.get("cac:PartyName", {}).get("cbc:Name")
                            ),
                            "siret": _text(
                                buyer.get("cac:PartyLegalEntity", {}).get(
                                    "cbc:CompanyID"
                                )
                            ),
                            "contact_email": _text(
                                buyer.get("cac:Contact", {}).get("cbc:ElectronicMail")
                            ),
                            "ville": _text(adresse_bloc.get("cbc:CityName")),
                        },
                        "lot_cible": lot_cible_extrait,
                    }
                )

        except requests.exceptions.RequestException as e:
            print(f"Erreur API : {e}")
            break
        offset += limit

    return all_records


url = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records"
marches = search_boamp_collectivites(url)
print(json.dumps(marches[0], indent=2, ensure_ascii=False))

df = pd.json_normalize(marches)
df.columns = [
    col.replace("acheteur.", "").replace("lot_cible.", "") for col in df.columns
]
df = df.dropna(subset="lot_id")
df.to_csv("marches_dommages_biens.csv", index=False, encoding="utf-8-sig")
