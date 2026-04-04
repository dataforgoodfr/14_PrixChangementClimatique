import random
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from tqdm import tqdm
from urllib3.util.retry import Retry


def get_session():
    session = requests.Session()
    retry_strategy = Retry(
        total=3,  # Nombre total de tentatives
        backoff_factor=2,  # Attente (2s, 4s, 8s...)
        status_forcelist=[429, 500, 502, 503, 504],  # Retenter sur ces codes d'erreur
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def get_last_page_number(soup):
    pagination_links = soup.select("ul.p-pagination a")
    if not pagination_links:
        pagination_links = soup.find_all("a", href=re.compile(r"\?page=\d+"))
    pages = []
    for link in pagination_links:
        text = link.text.strip()
        if text.isdigit():
            pages.append(int(text))
    return max(pages) if pages else 1


def scrape_jdn_impots(base_url):
    extracted_records = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    session = get_session()

    try:
        response = session.get(base_url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        last_page = get_last_page_number(soup)
    except Exception as e:
        print(f"Impossible d'accéder à l'URL de base {base_url}: {e}")
        return pd.DataFrame()

    for page in range(1, last_page + 1):
        current_url = base_url if page == 1 else f"{base_url}?page={page}"

        time.sleep(random.uniform(1.0, 2.5))

        try:
            response = session.get(current_url, headers=headers, timeout=20)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Erreur persistante sur page {page} ({current_url}): {e}")
            continue

        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table")
        if not table:
            continue

        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            if len(cells) >= 3:
                ville_cell = cells[1]
                pourcentage_cell = cells[2]

                ville = ville_cell.text.strip()
                raw_pourcentage = pourcentage_cell.text.strip()
                link = ville_cell.find("a")
                code_insee = None

                if link and "href" in link.attrs:
                    href_url = link["href"]
                    insee_match = re.search(r"/ville-([^/]+)", href_url)
                    if insee_match:
                        code_insee = insee_match.group(1)

                try:
                    if "impots-locaux" not in base_url:
                        valeur = (
                            float(raw_pourcentage.replace(" %", "").replace(",", "."))
                            / 100
                        )
                    else:
                        valeur = raw_pourcentage

                    extracted_records.append(
                        {
                            "code_geo": code_insee,
                            "commune": ville,
                            "pourcentage": valeur,
                        }
                    )
                except ValueError:
                    continue

    return pd.DataFrame(extracted_records)


def main():
    tax_sources = {
        "habitation": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-habitation",
        "fonciere_bati": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-fonciere-bati",
        "fonciere_non_bati": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-fonciere-non-bati",
        "ordures_menageres": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-ordures-menageres",
        "impots_locaux": "https://www.journaldunet.com/business/budget-ville/classement/villes/impots-locaux",
    }

    tax_metadata = []
    # Test sur 2020 (modifiable selon besoin)
    for year in range(2010, 2025):
        for name, url in tax_sources.items():
            final_url = url if year == 2024 else f"{url}/{year}"
            tax_metadata.append((name, year, final_url))

    all_dfs = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {
            executor.submit(scrape_jdn_impots, url): (tax_type, year)
            for tax_type, year, url in tax_metadata
        }

        for future in tqdm(
            as_completed(futures), total=len(futures), desc="Extraction Impôts JDN"
        ):
            tax_type, year = futures[future]
            try:
                result_df = future.result()
                if not result_df.empty:
                    result_df["libelle_taxe"] = tax_type
                    result_df["annee"] = year
                    all_dfs.append(result_df)
            except Exception as e:
                print(f"Échec critique sur {tax_type} {year}: {e}")

    if all_dfs:
        df_final = pd.concat(all_dfs, ignore_index=True)
        df_final.to_csv("impots_jdn_clean.csv", index=False, encoding="utf-8-sig")
        print(f"\n Extraction terminée : {len(df_final)} lignes enregistrées")
    else:
        print("\n Aucune donnée n'a pu être extraite")


if __name__ == "__main__":
    main()
