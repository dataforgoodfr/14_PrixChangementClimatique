from functools import reduce
from pathlib import Path

import geopandas as gpd
import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from tqdm import tqdm
from urllib3.util.retry import Retry

current_dir = Path.cwd()
target_dir = current_dir / "data" / "utils" / "downloaded_files"
target_dir.mkdir(parents=True, exist_ok=True)


def helper_payload_catnat(length="10000", code=None):
    """
    Constructs the payload for the POST request to fetch data about "arretes".

    Parameters:
    - length (str): Number of records to fetch. Default is "10000".
    - code (str): Code parameter. If not present return main page payload.

    Returns:
    - dict: The constructed payload.
    """
    if code:
        payload = {
            "draw": "1",
            "columns[0][data]": "codeInsee",
            "columns[0][name]": "",
            "columns[0][searchable]": "true",
            "columns[0][orderable]": "true",
            "columns[0][search][value]": "",
            "columns[0][search][regex]": "false",
            "columns[1][data]": "nomCommune",
            "columns[1][name]": "",
            "columns[1][searchable]": "true",
            "columns[1][orderable]": "true",
            "columns[1][search][value]": "",
            "columns[1][search][regex]": "false",
            "columns[2][data]": "dateDebutEvenement",
            "columns[2][name]": "",
            "columns[2][searchable]": "true",
            "columns[2][orderable]": "true",
            "columns[2][search][value]": "",
            "columns[2][search][regex]": "false",
            "columns[3][data]": "dateFinEvenement",
            "columns[3][name]": "",
            "columns[3][searchable]": "true",
            "columns[3][orderable]": "true",
            "columns[3][search][value]": "",
            "columns[3][search][regex]": "false",
            "columns[4][data]": "dateArrete",
            "columns[4][name]": "",
            "columns[4][searchable]": "true",
            "columns[4][orderable]": "true",
            "columns[4][search][value]": "",
            "columns[4][search][regex]": "false",
            "columns[5][data]": "dateParutionJO",
            "columns[5][name]": "",
            "columns[5][searchable]": "true",
            "columns[5][orderable]": "true",
            "columns[5][search][value]": "",
            "columns[5][search][regex]": "false",
            "columns[6][data]": "nomPeril",
            "columns[6][name]": "",
            "columns[6][searchable]": "true",
            "columns[6][orderable]": "true",
            "columns[6][search][value]": "",
            "columns[6][search][regex]": "false",
            "columns[7][data]": "franchise",
            "columns[7][name]": "",
            "columns[7][searchable]": "true",
            "columns[7][orderable]": "true",
            "columns[7][search][value]": "",
            "columns[7][search][regex]": "false",
            "columns[8][data]": "libelleAvis",
            "columns[8][name]": "",
            "columns[8][searchable]": "true",
            "columns[8][orderable]": "true",
            "columns[8][search][value]": "",
            "columns[8][search][regex]": "false",
            "order[0][column]": "0",
            "order[0][dir]": "asc",
            "start": "0",
            "length": length,
            "search[value]": "",
            "search[regex]": "false",
            "action": "get_arrete_details",
            "codeArrete": code,
        }
    else:
        payload = {
            "draw": "1",
            "columns[0][data]": "nomPeril",
            "columns[0][name]": "",
            "columns[0][searchable]": "true",
            "columns[0][orderable]": "true",
            "columns[0][search][value]": "",
            "columns[0][search][regex]": "false",
            "columns[1][data]": "nomPeril",
            "columns[1][name]": "",
            "columns[1][searchable]": "true",
            "columns[1][orderable]": "true",
            "columns[1][search][value]": "",
            "columns[1][search][regex]": "false",
            "columns[2][data]": "dateArrete",
            "columns[2][name]": "",
            "columns[2][searchable]": "true",
            "columns[2][orderable]": "true",
            "columns[2][search][value]": "",
            "columns[2][search][regex]": "false",
            "columns[3][data]": "dateParutionJO",
            "columns[3][name]": "",
            "columns[3][searchable]": "true",
            "columns[3][orderable]": "true",
            "columns[3][search][value]": "",
            "columns[3][search][regex]": "false",
            "columns[4][data]": "codeNOR",
            "columns[4][name]": "",
            "columns[4][searchable]": "true",
            "columns[4][orderable]": "true",
            "columns[4][search][value]": "",
            "columns[4][search][regex]": "false",
            "columns[5][data]": "",
            "columns[5][name]": "",
            "columns[5][searchable]": "true",
            "columns[5][orderable]": "false",
            "columns[5][search][value]": "",
            "columns[5][search][regex]": "false",
            "order[0][column]": "0",
            "order[0][dir]": "asc",
            "start": "0",
            "length": length,
            "search[value]": "",
            "search[regex]": "false",
            "action": "get_arretes",
            "codePeril": "",
            "dateArrete": "",
            "nomCommune": "",
            "departement": "",
        }
    return payload


def reconnaissance_catnat():
    """
    Collecting data from website https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/

    Data collected:
    - ccr_main_page_data (main page informations, all arrete and arrete code to access details)
    - ccr_details (information of communes affected for the specific arrete)

    Data is saved in downloaded_files/geoportail_ccr
    """

    url = "https://www.ccr.fr/wp-admin/admin-ajax.php"

    headers = {
        "Host": "www.ccr.fr",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "1471",
        "Origin": "https://www.ccr.fr",
        "Connection": "keep-alive",
        "Referer": "https://www.ccr.fr/portail-catastrophes-naturelles/liste-arretes/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "TE": "trailers",
    }

    # Send the POST request with the payload data
    response_main = requests.post(url, data=helper_payload_catnat(), headers=headers)

    # For code_arrete loop
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    if response_main.status_code == 200:
        response_data_main = response_main.json()
        df_main = pd.DataFrame(response_data_main["data"])

        # Saving main data as CSV and parquet
        df_main.to_csv(target_dir / "ccr_main_page_data.csv", index=False)

        # Collect data for each record based on codeArrete (POST request)
        codes = df_main["codeArrete"].tolist()

        df_details = pd.DataFrame()

        for code in codes:
            response = session.post(
                url, data=helper_payload_catnat(code=code), headers=headers, timeout=10
            )

            if response.status_code == 200:
                response_data = response.json()

                df_sub = pd.DataFrame(response_data["data"])
                df_sub["code_arrete"] = code
                df_details = pd.concat([df_details, df_sub], axis=0)
            else:
                print("Error for code:", code)

        # Saving details data as CSV and parquet
        df_details.to_csv(target_dir / "ccr_details.csv", index=False)

    else:
        print("Request failed with status code:", response_main.status_code)
        print("Response content:", response_main.content)


def geoportail_ccr():
    """
    Collecting maps from geoportail_ccr: https://geoportail.ccr.fr/server/rest/services/CarteToutPublic

    This is the ArcGIS server of CCR, this data is visible on the website: https://www.ccr.fr/portail-catastrophes-naturelles/visualiser/

    Data is saved in downloaded_files/geoportail_ccr
    For the moment the layers related to "Georisques" are not collected

    cartes_info gives a description of the maps present in the CCR server

    In map NB_Risks are already present the info for VA and Primes
    """
    main_url = "https://geoportail.ccr.fr/server/rest/services/CarteToutPublic"

    cartes_info = {
        "COUT_CUMUL": "Coûts Cumulées par Département (1995 - 2022)",
        "COUT_CUMUL_COM": "Coûts Cumulées par Commune (1995 - 2022)",
        "COUT_MOY": "Coûts Moyen par Département (1995 - 2022)",
        "COUT_MOY_COM": "Coûts Moyen par Commune (1995 - 2022)",
        "FREQ_MOY": "Frequence Moyenne de CatNat par Département",
        "FREQ_MOY_COM": "Frequence Moyenne de CatNat par Commune",
        # "Georisques": "", GEORISQUE => Too many
        "NB_Risks": "Nombre Risques Assurés par Département (2024)",
        "NB_Risks_COM": "Nombre Risques Assurés par Commune (2024)",
        # "Primes_Catnat": "Primes par Département (2024)", NB_Risks contains the info for VA and Primes
        # "Primes_Catnat_COM": "Primes par Commune (2024)",
        "SP": "Sinitre et Prime Ratio par Département (1995 - 2022)",
        "SP_COM": "Sinitre et Prime Ratio par Commune (1995 - 2022)",
        # "VA": "Valeurs Assurées par Département (2024)",
        # "VA_COM": "Valeurs Assurées par Commune (2024)",
    }

    for carte_id, carte_info in tqdm(cartes_info.items()):
        output_path = target_dir / "geoportail_ccr"
        output_path.mkdir(parents=True, exist_ok=True)

        service_url = f"{main_url}/{carte_id}/MapServer"
        contents = requests.get(f"{service_url}?f=pjson").json()

        content = contents.get("layers", [])[0]  # change this for GEORISQUE
        layer_id = content["id"]
        layer_name = (
            content["name"]
            .lower()
            .replace(" ", "_")
            .replace("(", "")
            .replace(")", "")
            .replace("/", "_")
        )

        all_features = []
        offset = 0
        chunk_size = 2000  # Standard ArcGIS limit

        # Pagination Loop to bypass Transfer Limit
        while True:
            query_params = {
                "where": "1=1",
                "outFields": "*",
                "f": "geojson",
                "resultOffset": offset,
                "resultRecordCount": chunk_size,
            }

            response = requests.get(
                f"{service_url}/{layer_id}/query", params=query_params
            )

            if response.status_code != 200:
                print(f"Error {response.status_code} on layer {layer_name}")
                break

            data = response.json()
            features = data.get("features", [])
            all_features.extend(features)

            exceeded = data.get("properties", {}).get("exceededTransferLimit", False)
            if exceeded:
                offset += chunk_size
            else:
                break

        if all_features:
            try:
                geodata = gpd.GeoDataFrame.from_features(all_features)
                geodata.set_crs(epsg=4326, inplace=True)

                filename = f"{carte_id.lower()}_{layer_name}.geojson"
                geodata.to_file(output_path / filename, driver="GeoJSON")
            except Exception as e:
                print(f"Processing Error for layer {layer_name}: {e}")
        else:
            print(f"No features found for layer {layer_name}")


def merge_geoportail_ccr_data():
    """
    Merging all geoportail data in a single DataFrame (removing geometry [geopandas])"
    """

    sub_dir = target_dir / "geoportail_ccr"
    all_files = list(sub_dir.glob("*.geojson"))
    departements_list = [f for f in all_files if "_com_" not in f.name]
    communes_list = list(sub_dir.glob("*_com_*.geojson"))

    loop_dict = {"departements": departements_list, "communes": communes_list}

    for level, geojson_list in loop_dict.items():
        gdf_list = [gpd.read_file(f) for f in geojson_list]
        merge_on = [
            "INSEE_DEP",
            "Shape_Area",
            "NOM_DEP",
            "Shape_Length",
            "OBJECTID",
            "geometry",
        ]

        if level == "communes":
            merge_on.extend(["INSEE_COM", "NOM"])

        full_gdf = reduce(
            lambda left, right: left.merge(
                right,
                on=merge_on,
            ),
            gdf_list,
        )

        full_gdf.drop(columns="geometry").to_csv(
            target_dir / f"geoportail_ccr_{level}.csv", index=False
        )


def main():
    # reconnaissance_catnat()
    # geoportail_ccr()
    merge_geoportail_ccr_data()


if __name__ == "__main__":
    main()
