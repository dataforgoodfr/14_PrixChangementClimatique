from concurrent.futures import ThreadPoolExecutor, as_completed

import geopandas as gpd
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from tqdm import tqdm
from webdriver_manager.firefox import GeckoDriverManager


def scrape_jdn(url, df, commune):
    firefox_options = Options()
    firefox_options.add_argument("--headless")

    service = Service(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=firefox_options)

    try:
        driver.get(url)

        # Wait until the chart SVG is visible in DOM
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CLASS_NAME, "highcharts-series-group"))
        )

        # Extracting data from dynamic graphs, chart series and yLabel or yticks
        charts_data = driver.execute_script("""
            return Highcharts.charts.map(chart => {
                if (!chart) return null;
                return {
                    title: chart.title.textStr,
                    unit: chart.yAxis[0].axisTitle ? chart.yAxis[0].axisTitle.textStr : chart.yAxis[0].ticks[Object.keys(chart.yAxis[0].ticks)[0]].label.element.textContent,
                    series: chart.series.map(s => ({
                        name: s.name,
                        data: s.yData
                    }))
                };
            }).filter(c => c !== null);
        """)

        chart_df = pd.DataFrame()
        for idx, chart in enumerate(charts_data):
            # print(f"\nCHART {idx}: {chart['title']}")

            # Detect scale from the unit text
            """
            unit_label = chart["unit"]
            scale = (
                "Millions"
                if "M" in unit_label or "millions" in unit_label.lower()
                else "Thousands"
            )
            print(f"Detected Scale: {scale} ({unit_label})")
            """

            s0 = chart["series"][0]
            s1 = (
                chart["series"][1]
                if len(chart["series"]) > 1
                else {"name": "N/A", "data": []}
            )

            start_year = 2000
            max_len = max(len(s0["data"]), len(s1["data"]))

            chart_data = {
                "year": range(start_year, start_year + max_len),
                s0["name"]: [
                    s0["data"][i] if i < len(s0["data"]) else 0.0
                    for i in range(max_len)
                ],
                s1["name"]: [
                    s1["data"][i] if i < len(s1["data"]) else 0.0
                    for i in range(max_len)
                ],
            }

            chart_data = pd.DataFrame(chart_data)
            chart_data = chart_data.set_index("year")
            chart_df = pd.concat([chart_df, chart_data], axis=1)

        chart_df["nom"] = commune
        df = pd.concat([df, chart_df.reset_index()])

    except Exception as e:
        print(f"An error occurred: {e}, pour commune {commune}")
    finally:
        driver.quit()

    return df


# MAIN
# regions_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson"
# dept_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson"
# communes_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes.geojson"


def main():
    communes_geojson_url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes.geojson"
    communes = gpd.read_file(communes_geojson_url)

    df = pd.DataFrame()
    urls = [
        f"https://www.journaldunet.com/business/budget-ville/{row['nom'].lower()}/ville-{row['code']}/budget"
        for _, row in communes.iterrows()
    ]
    communes_names = [row["nom"] for _, row in communes.iterrows()]

    # Use ThreadPoolExecutor to manage the threads
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(scrape_jdn, url, df, commune)
            for url, commune in zip(urls, communes_names)
        ]

        for future in tqdm(as_completed(futures), total=len(futures)):
            result = future.result()
            if not result.empty:
                df = pd.concat([df, result])

    print(df)


if __name__ == "__main__":
    main()
