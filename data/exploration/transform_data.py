import duckdb
import pandas as pd
import numpy as np

# Connection
PCC_DUCKDB_FILE = "dev.duckdb"
con = duckdb.connect(database=PCC_DUCKDB_FILE, read_only=True)
con.sql("LOAD spatial;") # if geospatial data needed
check = """
SHOW TABLES;
"""

res = con.sql(check)
print(res)

def transform_ccr_details():

    query_ccr_details = """
                        SELECT
                            *
                        FROM dev.main.ccr_details
                        """

    ccr_details = con.sql(query_ccr_details)
    ccr_details_df = ccr_details.df()

    ccr_details_trans = ccr_details_df.copy()

    import pdb; pdb.set_trace()

    # ------ Data manipulation ------

    # Converting to datetime
    ccr_details_trans["dateArrete"] = pd.to_datetime(ccr_details_trans["dateArrete"])

    # Modify Reconnue(sans impact sur la modulation)
    ccr_details_trans["libelleAvis"] = ccr_details_trans["libelleAvis"].replace(
        {
            "Reconnue(sans impact sur la modulation)": "Reconnue"
        }
    )

    # Remove potential duplicated
    ccr_details_trans = ccr_details_trans[~ccr_details_trans.duplicated()] 

    # Segmentin by major perils
    ccr_details_trans["nomPeril"] = (
                            ccr_details_trans["nomPeril"]
                            .mask(ccr_details_trans["nomPeril"].str.contains("Inondations"), "Inondations")
                            .where(ccr_details_trans["nomPeril"].str.contains("Inondations|Sécheresse"), "Autre")
                        )

   

    # ------ Features Creation ------

    # Segment by decades
    decades = ["1990", "2000", "2010", "2020"]
    #for 
    ccr_details_trans = ccr_details_trans[(ccr_details_trans["dateArrete"].dt.year > 1983) & (ccr_details_trans["dateArrete"].dt.year < 2026)]
    ccr_details_trans['periode_2010'] = np.where(
        ccr_details_trans['dateArrete'].dt.year < 2010, 
        'Before 2010', 
        'After 2010'
    )

    return 

def main():

    transform_ccr_details()

    # Save dataset in silver or gold

    
if __name__ == "__main__":
    main()