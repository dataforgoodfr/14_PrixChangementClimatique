import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def payload_arrete(length="10000", code=None):
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
response_main = requests.post(url, data=payload_arrete(), headers=headers)

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
    df_main.to_csv("../seeds/ccr_main_page_data.csv", index=False)

    # Collect data for each record based on codeArrete (POST request)
    codes = df_main["codeArrete"].tolist()

    df_details = pd.DataFrame()

    for code in codes:
        response = session.post(
            url, data=payload_arrete(code=code), headers=headers, timeout=10
        )

        if response.status_code == 200:
            response_data = response.json()

            df_sub = pd.DataFrame(response_data["data"])
            df_sub["code_arrete"] = code
            df_details = pd.concat([df_details, df_sub], axis=0)
        else:
            print("Error for code:", code)

    # Saving details data as CSV and parquet
    df_details.to_csv("../seeds/ccr_details.csv", index=False)

else:
    print("Request failed with status code:", response_main.status_code)
    print("Response content:", response_main.content)
