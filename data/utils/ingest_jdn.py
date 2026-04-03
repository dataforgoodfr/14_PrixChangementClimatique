import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.firefox import GeckoDriverManager
"""


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
    page = 1

    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(base_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")

    last_page = get_last_page_number(soup)

    extracted_records = []
    for page in range(1, last_page + 1):
        current_url = base_url if page == 1 else f"{base_url}?page={page}"

        try:
            response = requests.get(current_url, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Connection error on page {page}: {e}")
            break

        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table")

        if not table:
            print(f"No table found on page {page}")
            break

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

                extracted_records.append(
                    {
                        "code_geo": code_insee,
                        "commune": ville,
                        "pourcentage": float(
                            raw_pourcentage.replace(" %", "").replace(",", ".")
                        )
                        / 100,
                    }
                )

        # time.sleep(1)

    df = pd.DataFrame(extracted_records)
    return df


def main():

    tax_sources = {
        "habitation": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-habitation",
        "fonciere_bati": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-fonciere-bati",
        "fonciere_non_bati": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-fonciere-non-bati",
        "ordures_menageres": "https://www.journaldunet.com/economie/impots/classement/villes/taxe-ordures-menageres",
    }
    all_dfs = []

    tax_metadata = []
    for name, url in tax_sources.items():
        tax_metadata.append((name, 2024, url))
        tax_metadata.append((name, 2020, f"{url}/2020"))

    all_dfs = []

    with ThreadPoolExecutor(max_workers=len(tax_metadata)) as executor:
        futures = {
            executor.submit(scrape_jdn_impots, url): (tax_type, year)
            for tax_type, year, url in tax_metadata
        }

        for future in tqdm(
            as_completed(futures), total=len(futures), desc="Tax Extraction Completed"
        ):
            tax_type, year = futures[future]
            try:
                result_df = future.result()
                if not result_df.empty:
                    result_df["libelle_taxe"] = tax_type
                    result_df["annee"] = year
                    all_dfs.append(result_df)
            except Exception as e:
                print(f"Error scraping {tax_type} {year}: {e}")

    df_final = pd.concat(all_dfs, ignore_index=True)
    df_final.to_csv("impots_jdn.csv", index=False)


if __name__ == "__main__":
    main()
