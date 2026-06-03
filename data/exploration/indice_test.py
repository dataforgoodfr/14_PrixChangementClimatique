import marimo

__generated_with = "0.23.8"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Indice de vulnérabilité climatique des communes françaises

    Ce notebook calcule un **indice composite de vulnérabilité** par commune, combinant trois dimensions :

    | # | Dimension | Variables clés | Poids final |
    |---|-----------|----------------|-------------|
    | 1 | **Exposition climatique** | Sécheresse (SWI × RGA, arrêtés sec), Inondation (pluies intenses, TRI, arrêtés ino), autres aléas | 50 % |
    | 2 | **Fragilité assurantielle** | Évolution de la prime, ratio prime/budget, franchises, taux non-reconnaissance | 40 % |
    | 3 | **Fragilité économique** | Ratio dettes/dépenses, dépenses par habitant | 10 % |

    ---

    ## Plan

    1. [Chargement des données](#chargement)
    2. [Fonctions utilitaires](#utilitaires)
    3. [Score d'exposition climatique](#exposition)
       - 3a. Score sécheresse
       - 3b. Score inondation
       - 3c. Agrégation exposition + correction prévention (PPRN)
    4. [Score assurantiel](#assurance)
    5. [Score économique](#economique)
    6. [Indice de vulnérabilité final](#final)
    7. [Export Parquet](#export)

    > **Convention de normalisation** : tous les indices intermédiaires sont dans **[0, 1]**.
    > Le score final est agrégé par norme euclidienne pondérée puis normalisé en [0, 1].
    > Les niveaux discrets (0 → 4) sont obtenus par `floor(score × 5).clip(0, 4)`.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 1. Chargement des données

    Connexion à la base DuckDB issue du pipeline dbt.
    La table `resultats_website_par_commune` contient toutes les variables nécessaires au calcul
    des scores, ainsi que la géométrie (WKT) de chaque commune.

    La géométrie est reprojetée en **Lambert-93 (EPSG:2154)** pour les cartes métropolisées,
    puis simplifiée à 100 m pour alléger le rendu.
    """)
    return


@app.cell
def _():
    import duckdb
    import pandas as pd
    import geopandas as gpd
    from shapely import wkt
    import matplotlib.pyplot as plt
    import marimo as mo
    import numpy as np
    from datetime import datetime

    return datetime, duckdb, gpd, mo, np, pd, plt, wkt


@app.cell
def _(duckdb, wkt):
    PCC_DUCKDB_FILE = "dev.duckdb"
    con = duckdb.connect(database=PCC_DUCKDB_FILE, read_only=True)
    resultats_website_par_commune = con.sql("""SELECT * FROM dev.main_serving.resultats_website_par_commune""").df()
    con.close()
    resultats_website_par_commune["geometry"] = resultats_website_par_commune["geometry"].apply(wkt.loads)
    return (resultats_website_par_commune,)


@app.cell
def _(gpd, resultats_website_par_commune):
    gdf = gpd.GeoDataFrame(resultats_website_par_commune, geometry="geometry")
    gdf = gdf.set_crs(4326).to_crs(2154)
    gdf["code_insee"] = gdf["code_insee"].astype(str)
    gdf["geometry"] = gdf["geometry"].simplify(100)
    return (gdf,)


@app.cell
def _(gdf):
    # Les colonnes d'arrêtés sont nulles pour les communes sans événement : on les passe à 0.
    gdf[["nb_total_arretes_recon", "nb_total_arretes", "nb_total_arretes_ino",
         "nb_total_arretes_sec", "nb_total_arretes_autre"]] = gdf[[
        "nb_total_arretes_recon", "nb_total_arretes", "nb_total_arretes_ino",
        "nb_total_arretes_sec", "nb_total_arretes_autre"
    ]].fillna(0)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 2. Fonctions utilitaires

    ### `clip_minmax(s, q_low, q_high)`
    Normalisation MinMax avec écrêtage aux quantiles `q_low` / `q_high`.
    Permet de limiter l'influence des valeurs extrêmes sans les supprimer.

    ### `carte_continue(df, col_color)`
    Carte choroplèthe continue (colormap viridis) pour la métropole + 5 DROM.
    Les valeurs sont bornées aux percentiles 1 % – 99 % pour éviter que quelques
    communes extrêmes n'écrasent la palette.

    ### `carte_discret(df, col_color)`
    Variante pour une variable discrète (niveaux 0 → 4).
    La palette de 5 couleurs va du vert foncé au rouge bordeaux.

    ### `plot_variable(df, col_brut, col_indice, score_color, scores_ref)`
    Histogramme de distribution de l'indice normalisé, coloré par niveau de score final.
    L'axe supérieur affiche les valeurs brutes correspondant aux seuils de référence,
    ce qui permet de lire l'indice dans l'unité métier.
    """)
    return


@app.function
def clip_minmax(s, q_low, q_high):
    lo, hi = s.quantile(q_low), s.quantile(q_high)
    return (s.clip(lo, hi) - lo) / (hi - lo)


@app.cell(hide_code=True)
def _(plt):
    def carte_continue(df, col_color):
        fig = plt.figure(figsize=(20, 10))
        ax_metro = fig.add_axes([0.0, 0.0, 0.65, 1.0])
        vmin = df[col_color].quantile(0.01)
        vmax = df[col_color].quantile(0.99)
        metro = df[~df["code_insee"].str.startswith(("97", "98"))]
        metro.plot(column=col_color, cmap="viridis", ax=ax_metro, linewidth=0.1,
                   legend=True, rasterized=True, vmin=vmin, vmax=vmax)
        ax_metro.set_title(col_color, fontsize=14)
        ax_metro.set_aspect("equal")
        ax_metro.axis("off")
        droms = {
            "Guadeloupe": ("971", [0.66, 0.75, 0.16, 0.22]),
            "Martinique":  ("972", [0.83, 0.75, 0.16, 0.22]),
            "Guyane":      ("973", [0.66, 0.50, 0.16, 0.22]),
            "Réunion":     ("974", [0.83, 0.50, 0.16, 0.22]),
            "Mayotte":     ("976", [0.74, 0.25, 0.16, 0.22]),
        }
        for name, (code, pos) in droms.items():
            ax = fig.add_axes(pos)
            drom = df[df["code_insee"].str.startswith(code)]
            drom.plot(column=col_color, cmap="viridis", ax=ax, linewidth=0.1,
                      rasterized=True, vmin=vmin, vmax=vmax)
            ax.set_title(name, fontsize=9)
            ax.axis("off")
        plt.tight_layout()
        plt.show()

    return (carte_continue,)


@app.cell(hide_code=True)
def _(pd, plt):
    def carte_discret(df, col_color):
        fig = plt.figure(figsize=(20, 10))
        ax_metro = fig.add_axes([0.0, 0.0, 0.65, 1.0])
        metro = df[~df["code_insee"].str.startswith(("97", "98"))]
        colors = ['#608D83', '#AFA15D', '#F4BA5F', '#D9622C', '#AA2E26']
        vals = sorted(df[col_color].dropna().unique())
        color_map = {val: col for val, col in zip(vals, colors)}
        metro.plot(
            color=metro[col_color].map(lambda x: color_map.get(x, color_map.get(int(x) if pd.notna(x) else x, '#D3D3D3'))),
            ax=ax_metro, linewidth=0.1, rasterized=True,
        )
        ax_metro.set_title(col_color, fontsize=14)
        ax_metro.set_aspect("equal")
        ax_metro.axis("off")
        droms = {
            "Guadeloupe": ("971", [0.66, 0.75, 0.16, 0.22]),
            "Martinique":  ("972", [0.83, 0.75, 0.16, 0.22]),
            "Guyane":      ("973", [0.66, 0.50, 0.16, 0.22]),
            "Réunion":     ("974", [0.83, 0.50, 0.16, 0.22]),
            "Mayotte":     ("976", [0.74, 0.25, 0.16, 0.22]),
        }
        for name, (code, pos) in droms.items():
            ax = fig.add_axes(pos)
            drom = df[df["code_insee"].str.startswith(code)]
            drom.plot(
                color=drom[col_color].map(lambda x: color_map.get(x, color_map.get(int(x) if pd.notna(x) else x, '#D3D3D3'))),
                ax=ax, linewidth=0.1, rasterized=True,
            )
            ax.set_title(name, fontsize=9)
            ax.axis("off")
        plt.tight_layout()
        plt.show()

    return (carte_discret,)


@app.cell
def _(np, plt):
    def plot_variable(df, colonne_variable, colonne_var_stand, score_color, scores_ref):
        if score_color:
            df[score_color] = df[score_color].fillna(-1)
        score_colors = {-1: '#A9A9A9', 0: '#2ecc71', 1: '#a8d44b', 2: '#f1c40f', 3: '#e67e22', 4: '#e74c3c'}
        fig, ax = plt.subplots(figsize=(12, 6))
        mask = df[[colonne_variable, colonne_var_stand]].dropna().index
        data_stand = df.loc[mask, colonne_var_stand]
        data_brut = df.loc[mask, colonne_variable]
        if score_color is not None:
            score_data = df.loc[mask, score_color].fillna(-1).astype(int)
            counts_total, edges = np.histogram(data_stand, bins=50)
            bin_width = edges[1] - edges[0]
            bin_indices = np.clip(np.digitize(data_stand, edges[:-1]) - 1, 0, 49)
            bottom = np.zeros(50)
            for s in sorted(score_colors.keys()):
                counts = np.array([np.sum((bin_indices == i) & (score_data == s)) for i in range(50)])
                ax.bar(edges[:-1], counts, width=bin_width, bottom=bottom,
                       color=score_colors[s], edgecolor='white', alpha=0.9,
                       align='edge', label=f'score {s}')
                bottom += counts
        else:
            ax.hist(data_stand, bins=50, color='lightsteelblue', edgecolor='white', alpha=0.8)
        ax.axvline(data_stand.median(), color='orange', linewidth=2,
                   label=f'Médiane indice ({data_stand.median():.2f})')
        ax.axvline(np.mean(data_stand), color='red', linewidth=2, linestyle='--', label='Moyenne')
        ax.set_xlabel(f"Indice {colonne_var_stand}")
        ax.set_ylabel("Fréquence")
        ax.set_title(f"Distribution de l'indice {colonne_var_stand}")
        ax.legend(fontsize=8)
        ax.set_ylim((0, 8000))
        ax2 = ax.twiny()
        ax2.set_xlim(ax.get_xlim())
        valeurs_brutes = [
            data_brut[(data_stand >= s - 0.001) & (data_stand <= s + 0.001)].median()
            for s in scores_ref
        ]
        ax2.set_xticks(scores_ref)
        ax2.set_xticklabels([f"{r:.2f}" for r in valeurs_brutes], fontsize=8, rotation=30)
        ax2.set_xlabel(f" {colonne_variable} correspondant", fontsize=9)
        plt.tight_layout()
        plt.show()

    return (plot_variable,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 3. Score d'exposition climatique

    Le score d'exposition agrège deux sous-scores (sécheresse et inondation) et une composante
    « autres aléas », puis applique une **décote de prévention** pour les communes couvertes
    par un PPRN approuvé récemment.

    ### 3a. Score sécheresse

    Construit à partir de deux composantes :

    - **`swi_x_rga`** : produit de l'indice SWI (stress hydrique climatique, écrêté p99) et de
      l'indicateur RGA (retrait-gonflement des argiles). Ce produit capture à la fois l'intensité
      du signal climatique et la sensibilité du sol.
    - **`nb_total_arretes_sec_indice`** : nombre d'arrêtés CatNat sécheresse normalisé p99,
      proxy de la sinistralité historique.

    Formule : `score_secheresse = MinMax( √(0.5 × swi_x_rga² + 0.5 × arretes_sec²) )`

    ### 3b. Score inondation

    Trois composantes :

    - **`rr_50_d_abs_indice`** (30 %) : nombre de jours avec précipitations > 50 mm/j — signal climatique.
    - **`indicateur_tri_indice`** (20 %) : présence dans un Territoire à Risque Important d'inondation.
    - **`nb_total_arretes_ino_indice`** (50 %) : arrêtés CatNat inondation, sinistralité historique.

    Formule : `score_inondation = MinMax( √(0.2×tri² + 0.3×rr50² + 0.5×arretes_ino²) )`

    > Le score inondation couvre aussi les DROM (hors COM, code 98).

    ### 3c. Agrégation et correction prévention

    La **décote PPRN** réduit le score brut en fonction de l'existence et de la récence
    du Plan de Prévention des Risques Naturels :
    - PPRN approuvé depuis < 10 ans → décote pleine (`poids_prevention`)
    - PPRN approuvé depuis ≥ 10 ans → décote réduite de moitié

    Le score d'exposition final est le **maximum** entre :
    - la norme euclidienne pondérée (40 % sec + 40 % ino + 20 % autres)
    - le maximum des deux scores nets (plancher pour éviter de diluer un risque dominant)
    """)
    return


@app.cell
def _(mo):
    col_selector_secheresse = mo.ui.multiselect(
        options=['swi_04_d_abs', 'tx_35_d_abs', 'nb_total_arretes_sec', 'nb_total_arretes_recon', 'indicateur_rga'],
        value=['swi_04_d_abs', 'nb_total_arretes_sec', "indicateur_rga"],
        label="Variables score sécheresse"
    )
    col_selector_inondation = mo.ui.multiselect(
        options=['pxcwd_abs', 'rr_50_d_abs', 'nb_total_arretes_ino', 'nb_total_arretes_recon', 'indicateur_tri'],
        value=['rr_50_d_abs', 'nb_total_arretes_ino', "indicateur_tri"],
        label="Variables score inondation"
    )
    poids_prevention = mo.ui.slider(0, 1, step=0.1, value=0.2, label="Poids prévention PPRN")
    mo.hstack([col_selector_secheresse, col_selector_inondation, poids_prevention])
    return col_selector_inondation, col_selector_secheresse, poids_prevention


@app.cell
def _(col_selector_secheresse, gdf, np):
    from sklearn.preprocessing import MinMaxScaler

    selected_cols = col_selector_secheresse.value
    metropole_datas = gdf[~gdf["code_insee"].str.startswith(("97", "98"))].copy()
    metropole_datas[selected_cols] = metropole_datas[selected_cols].fillna(0)

    # Normalisation individuelle des deux composantes
    metropole_datas['swi_04_d_abs_indice'] = clip_minmax(metropole_datas['swi_04_d_abs'], q_low=0, q_high=0.99)
    metropole_datas['indicateur_rga_indice'] = clip_minmax(metropole_datas['indicateur_rga'], q_low=0, q_high=0.99)

    # Interaction climatique × sensibilité sol
    metropole_datas['swi_x_rga'] = metropole_datas['swi_04_d_abs_indice'] * metropole_datas['indicateur_rga_indice']
    metropole_datas['swi_x_rga_indice'] = clip_minmax(metropole_datas['swi_x_rga'], q_low=0, q_high=0.99)

    metropole_datas['nb_total_arretes_sec_indice'] = clip_minmax(metropole_datas['nb_total_arretes_sec'], q_low=0, q_high=0.99)

    w_swi_rga = 0.5
    w_arretes = 0.5

    metropole_datas['score_secheresse_brut'] = np.sqrt(
        w_swi_rga * metropole_datas['swi_x_rga_indice'] ** 2 +
        w_arretes * metropole_datas['nb_total_arretes_sec_indice'] ** 2
    )
    metropole_datas['score_secheresse'] = MinMaxScaler().fit_transform(
        metropole_datas[['score_secheresse_brut']]
    )
    metropole_datas['score_secheresse_int'] = (
        np.floor(metropole_datas['score_secheresse'] * 5).clip(0, 4).astype('Int64')
    )
    return (metropole_datas,)


@app.cell
def _(carte_continue, carte_discret, metropole_datas, np, plot_variable):
    plot_variable(metropole_datas, 'nb_total_arretes_sec', 'nb_total_arretes_sec_indice', 'score_secheresse_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(metropole_datas, 'indicateur_rga', 'indicateur_rga_indice', 'score_secheresse_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(metropole_datas, 'swi_04_d_abs', 'swi_04_d_abs_indice', 'score_secheresse_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    carte_continue(metropole_datas, 'score_secheresse')
    carte_discret(metropole_datas, 'score_secheresse_int')
    return


@app.cell
def _(col_selector_inondation, gdf, np):
    from sklearn.preprocessing import MinMaxScaler as MMS2

    selected_cols_inondation = col_selector_inondation.value
    datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))].copy()
    datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)

    datas_inondation['rr_50_d_abs_indice'] = clip_minmax(datas_inondation['rr_50_d_abs'], q_low=0, q_high=0.99)
    datas_inondation['indicateur_tri_indice'] = clip_minmax(datas_inondation['indicateur_tri'], q_low=0, q_high=0.99)
    datas_inondation['nb_total_arretes_ino_indice'] = clip_minmax(datas_inondation['nb_total_arretes_ino'], q_low=0, q_high=0.99)

    w_rr50 = 0.3
    w_arretes_ino = 0.5
    w_indicateur_tri = 0.2

    datas_inondation['score_inondation_brut'] = np.sqrt(
        w_indicateur_tri * datas_inondation['indicateur_tri_indice'] ** 2 +
        w_rr50 * datas_inondation['rr_50_d_abs_indice'] ** 2 +
        w_arretes_ino * datas_inondation['nb_total_arretes_ino_indice'] ** 2
    )
    datas_inondation['score_inondation'] = MMS2().fit_transform(
        datas_inondation[['score_inondation_brut']]
    )
    datas_inondation['score_inondation_int'] = (
        np.floor(datas_inondation['score_inondation'] * 5).clip(0, 4).astype('Int64')
    )
    return (datas_inondation,)


@app.cell
def _(carte_continue, carte_discret, datas_inondation, np, plot_variable):
    plot_variable(datas_inondation, 'indicateur_tri', 'indicateur_tri_indice', 'score_inondation_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(datas_inondation, 'rr_50_d_abs', 'rr_50_d_abs_indice', 'score_inondation_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(datas_inondation, 'nb_total_arretes_ino', 'nb_total_arretes_ino_indice', 'score_inondation_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    carte_continue(datas_inondation, 'score_inondation')
    carte_discret(datas_inondation, 'score_inondation_int')
    return


@app.cell
def _(
    datas_inondation,
    datetime,
    gdf,
    metropole_datas,
    np,
    pd,
    poids_prevention,
):
    gdf_calc = gdf.copy()
    poid_pre = poids_prevention.value

    gdf_calc.loc[metropole_datas.index, "score_secheresse"] = metropole_datas["score_secheresse"]
    gdf_calc.loc[datas_inondation.index, "score_inondation"] = datas_inondation["score_inondation"].values

    current_year = datetime.now().year

    # Décote prévention : PPRN récent (< 10 ans) → décote pleine ; ancien → décote /2
    gdf_calc['score_secheresse_net'] = (
        gdf_calc['score_secheresse']
        - np.where(
            current_year - pd.to_datetime(gdf_calc['date_approbation_rga']).dt.year < 10,
            poid_pre, poid_pre / 2
        ) * gdf_calc['pprn_rga']
    ).clip(lower=0)

    gdf_calc['score_inondation_net'] = (
        gdf_calc['score_inondation']
        - np.where(
            current_year - pd.to_datetime(gdf_calc['date_approbation_ino']).dt.year < 10,
            poid_pre, poid_pre / 2
        ) * gdf_calc['pprn_ino']
    ).clip(lower=0)

    gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_total_arretes_autre'], q_low=0, q_high=0.999)

    # Norme euclidienne pondérée (fallback inondation seule si sécheresse absente)
    score_agrege = np.sqrt(
        0.4 * gdf_calc['score_secheresse_net'] ** 2 +
        0.4 * gdf_calc['score_inondation_net'] ** 2 +
        0.2 * gdf_calc['score_autres'] ** 2
    ).fillna(
        np.sqrt(0.8 * gdf_calc['score_inondation_net'] ** 2 + 0.2 * gdf_calc['score_autres'] ** 2)
    )

    # Plancher = max des deux scores nets pour ne pas diluer un risque dominant
    score_principal = np.maximum(
        gdf_calc['score_secheresse_net'].fillna(0),
        gdf_calc['score_inondation_net']
    )

    gdf_calc['score_global_lp'] = np.maximum(score_agrege, score_principal)
    gdf_calc['score_exposition'] = gdf_calc['score_global_lp']
    gdf_calc['score_exposition_int'] = (gdf_calc['score_exposition'] * 5).clip(0, 4).astype('Int64')
    gdf_calc['score_exposition_1d'] = (gdf_calc['score_exposition'] * 5).round(1)
    return (gdf_calc,)


@app.cell
def _(carte_discret, gdf_calc):
    carte_discret(gdf_calc, 'score_exposition_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 4. Score assurantiel

    Ce score mesure la **pression que le risque climatique fait peser sur l'assurance** des habitants.
    Quatre composantes, toutes normalisées en [0, 1] :

    | Variable | Indice | Poids | Logique |
    |----------|--------|-------|---------|
    | `evolution_prime_assurance` | `indice_prime` (log) | 50 % | Hausse de prime = signal de renchérissement du risque |
    | `part_prime_budget` | `part_prime_budget_standard` | 20 % | Effort financier relatif des ménages |
    | `part_arretes_non_reconnus` | `part_arretes_non_reconnus_clip` | 20 % | Sinistres non couverts → reste à charge |
    | `multiple_franchise_last` | `multiple_franchise_last_indice` | 10 % | Franchise × 5 max → sur-exposition aux petits sinistres |

    **Normalisation de la prime** : transformation log pour comprimer les hausses extrêmes,
    bornée à +150 % (`x_max = 1.5`). Une évolution nulle donne un indice de 0 ; +150 % donne 1.

    Formule : `score_assurance = √(0.5×prime² + 0.2×budget² + 0.2×non_reco² + 0.1×franchise²)`
    puis normalisation par le maximum observé.
    """)
    return


@app.cell
def _(gdf_calc, mo, np):
    poids_prevention_prime_budget = mo.ui.slider(0, 1, step=0.1, value=0.2, label='prime/budget')
    poids_prevention_evolution_prime = mo.ui.slider(0, 1, step=0.1, value=0.5, label='evolution prime')
    poids_prevention_franchise = mo.ui.slider(0, 1, step=0.05, value=0.1, label='franchise')
    mo.hstack([poids_prevention_prime_budget, poids_prevention_evolution_prime, poids_prevention_franchise])

    gdf_calc_assurance = gdf_calc.copy()
    gdf_calc_assurance['multiple_franchise_last_indice'] = (gdf_calc_assurance['multiple_franchise_last'].fillna(0)) / 5
    gdf_calc_assurance['part_prime_budget_standard'] = clip_minmax(gdf_calc_assurance['part_prime_budget'], q_low=0.01, q_high=0.99)
    gdf_calc_assurance['part_arretes_non_reconnus_clip'] = clip_minmax(gdf_calc_assurance['part_arretes_non_reconnus'], q_low=0.0, q_high=1)
    gdf_calc_assurance['evolution_prime_assurance_clip'] = gdf_calc_assurance['evolution_prime_assurance'].clip(-1)

    # Transformation log pour comprimer les hausses extrêmes, bornée à +150 %
    x_min_prime, x_max_prime = 0, 1.5
    gdf_calc_assurance['indice_prime'] = (
        (np.log1p(gdf_calc_assurance['evolution_prime_assurance_clip']) - np.log1p(x_min_prime)) /
        (np.log1p(x_max_prime) - np.log1p(x_min_prime))
    ).clip(0, 1)

    ppb_a = 0.2
    pep_a = 0.5
    pf_a = 0.1
    pna_a = 0.2

    gdf_calc_assurance['score_assurance'] = np.sqrt(
        pep_a * gdf_calc_assurance['indice_prime'] ** 2 +
        ppb_a * gdf_calc_assurance['part_prime_budget_standard'] ** 2 +
        pna_a * gdf_calc_assurance['part_arretes_non_reconnus_clip'].fillna(1) ** 2 +
        pf_a * gdf_calc_assurance['multiple_franchise_last_indice'] ** 2
    )
    gdf_calc_assurance['score_assurance_min_max'] = gdf_calc_assurance['score_assurance'] / gdf_calc_assurance['score_assurance'].max()
    gdf_calc_assurance['score_assurance_int'] = (gdf_calc_assurance['score_assurance_min_max'] * 5).astype('Int64').clip(0, 4)
    gdf_calc_assurance['score_assurance_1d'] = (gdf_calc_assurance['score_assurance_min_max'] * 5).round(1)
    return (gdf_calc_assurance,)


@app.cell
def _(carte_discret, gdf_calc_assurance, np, plot_variable):
    plot_variable(gdf_calc_assurance, 'evolution_prime_assurance', 'indice_prime', 'score_assurance_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(gdf_calc_assurance, 'part_prime_budget', 'part_prime_budget_standard', 'score_assurance_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(gdf_calc_assurance, 'part_arretes_non_reconnus', 'part_arretes_non_reconnus_clip', 'score_assurance_int', np.array([0, 0.2, 0.4, 0.6, 0.8, 1]))
    plot_variable(gdf_calc_assurance, 'multiple_franchise_last', 'multiple_franchise_last_indice', 'score_assurance_int', np.array([0, 0.2, 0.4, 0.6, 0.8, 1]))
    carte_discret(gdf_calc_assurance, 'score_assurance_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 5. Score économique

    Ce score mesure la **capacité financière de la commune** à faire face aux impacts climatiques.
    Deux composantes :

    | Variable | Indice | Logique |
    |----------|--------|---------|
    | `ratio_dettes_depenses` | `debt_indice` | Ratio négatif → plus il est bas (commune endettée), plus l'indice est haut |
    | `depenses_per_pop` | `depenses_per_pop_indice` | Transformation log inversée : faibles dépenses → vulnérabilité forte |

    **Normalisation des dépenses** : transformation log centrée sur la médiane.
    La médiane correspond à un indice de 0.2 (les communes à dépenses médianes sont peu vulnérables).
    Les communes en dessous du 1er percentile atteignent un indice de 1.

    **Normalisation des dettes** : linéaire, bornée à 5× la médiane absolue du ratio.
    Un ratio nul → indice 0 ; un ratio très négatif (forte dette) → indice proche de 1.

    Formule : `score_eco = √(poids_dettes × debt² + (1 - poids_dettes) × depenses²)`
    """)
    return


@app.cell
def _(mo):
    poids_prevention_dettes = mo.ui.slider(0, 1, step=0.1, value=0.5, label='poids dettes')

    mo.hstack([poids_prevention_dettes])

    return (poids_prevention_dettes,)


@app.cell
def _(gdf_calc_assurance, np, poids_prevention_dettes):
    ppd = poids_prevention_dettes.value
    ppbh = 1 - ppd

    gdf_calc_eco = gdf_calc_assurance.copy()

    # Indice dettes : ratio négatif → vulnérabilité, borné à 5× la médiane
    xmin_dette, xmax_dette = 0, -gdf_calc_eco['ratio_dettes_depenses'].median() / 0.2
    gdf_calc_eco['debt_indice'] = (
        (-gdf_calc_eco['ratio_dettes_depenses'] - xmin_dette) / (xmax_dette - xmin_dette)
    ).clip(0, 1)

    # Indice dépenses : log inversé — faibles dépenses = commune fragilisée
    x_min_depenses = gdf_calc_eco['depenses_per_pop'].quantile(0.01)
    xmax_depenses = np.expm1(
        np.log1p(x_min_depenses) +
        (np.log1p(gdf_calc_eco['depenses_per_pop'].median()) - np.log1p(x_min_depenses)) / 0.8
    )
    gdf_calc_eco['depenses_per_pop_indice'] = (
        1 - (np.log1p(gdf_calc_eco['depenses_per_pop']) - np.log1p(x_min_depenses)) /
        (np.log1p(xmax_depenses) - np.log1p(x_min_depenses))
    ).clip(0, 1)

    gdf_calc_eco['score_eco'] = np.sqrt(
        ppbh * gdf_calc_eco['depenses_per_pop_indice'] ** 2 +
        ppd * gdf_calc_eco['debt_indice'] ** 2
    )
    gdf_calc_eco['score_eco_minmax'] = gdf_calc_eco['score_eco'] / gdf_calc_eco['score_eco'].max()
    gdf_calc_eco['score_eco_int'] = np.floor(gdf_calc_eco['score_eco_minmax'] * 5).clip(0, 4).astype('Int64')
    gdf_calc_eco['score_eco_1d'] = (gdf_calc_eco['score_eco_minmax'] * 5).round(1)
    return (gdf_calc_eco,)


@app.cell
def _(carte_discret, gdf_calc_eco, np, plot_variable):
    plot_variable(gdf_calc_eco, 'depenses_per_pop', 'depenses_per_pop_indice', 'score_eco_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    plot_variable(gdf_calc_eco, 'ratio_dettes_depenses', 'debt_indice', 'score_eco_int', np.array([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]))
    carte_discret(gdf_calc_eco, 'score_eco_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 6. Indice de vulnérabilité final

    L'indice composite combine les trois scores par **norme euclidienne pondérée** :

    ```
    score_final_brut = √( w_eco × eco² + w_assurance × assurance² + w_expo × exposition² )
    ```

    avec `w_expo = 1 − w_eco − w_assurance` (les poids somment à 1).

    Le score brut est ensuite normalisé par `clip_minmax(q_low=0, q_high=1)`
    pour obtenir l'**indice de vulnérabilité** dans [0, 1].

    Le **niveau discret** (0 → 4) est calculé par `floor(indice × 5).clip(0, 4)`.

    > **Poids par défaut** : exposition 50 %, assurance 40 %, économique 10 %.
    > Ces poids peuvent être ajustés via les sliders ci-dessous.
    """)
    return


@app.cell
def _(mo):
    poids_prevention_eco = mo.ui.slider(0, 1, step=0.05, value=0.1, label='poids eco')
    poids_prevention_assurance = mo.ui.slider(0, 1, step=0.05, value=0.4, label='poids assurance')

    mo.hstack([poids_prevention_eco, poids_prevention_assurance])
    return poids_prevention_assurance, poids_prevention_eco


@app.cell
def _(poids_prevention_assurance, poids_prevention_eco):

    ppeco = poids_prevention_eco.value
    ppa = poids_prevention_assurance.value
    ppexpo = 1 - ppeco - ppa
    ppexpo
    return ppa, ppeco, ppexpo


@app.cell
def _(gdf_calc_eco, np, ppa, ppeco, ppexpo):
    gdf_calc_eco['score_final_brut'] = (
        ppeco * gdf_calc_eco['score_eco_minmax'] ** 2 +
        ppa * gdf_calc_eco['score_assurance_min_max'] ** 2 +
        ppexpo * gdf_calc_eco['score_exposition'] ** 2
    ) ** (1 / 2)

    gdf_calc_eco['score_final'] = clip_minmax(gdf_calc_eco['score_final_brut'], q_low=0, q_high=1)
    gdf_calc_eco['score_final_int'] = np.floor(gdf_calc_eco['score_final'] * 5).clip(0, 4).astype('Int64')
    gdf_calc_eco['score_final_1d'] = (gdf_calc_eco['score_final'] * 5).round(1)

    # Alias sémantiques pour l'export
    gdf_calc_eco['indice_vulnerabilite'] = gdf_calc_eco['score_final']
    gdf_calc_eco['indice_vulnerabilite_niveau'] = gdf_calc_eco['score_final_int']
    return


@app.cell
def _(gdf_calc_eco, np, ppa, ppeco, ppexpo):

    gdf_calc_eco['score_final_brut'] = (
        ppeco * gdf_calc_eco['score_eco_minmax'] ** 2 +
        ppa * gdf_calc_eco['score_assurance_min_max'] ** 2 +
        ppexpo * gdf_calc_eco['score_exposition'] ** 2
    ) ** (1 / 2)

    gdf_calc_eco['score_final'] = clip_minmax(gdf_calc_eco['score_final_brut'], q_low=0, q_high=1)
    gdf_calc_eco['score_final_int'] = np.floor(gdf_calc_eco['score_final'] * 5).clip(0, 4).astype('Int64')
    gdf_calc_eco['score_final_1d'] = (gdf_calc_eco['score_final'] * 5).round(1)

    # Alias sémantiques pour l'export
    gdf_calc_eco['indice_vulnerabilite'] = gdf_calc_eco['score_final']
    gdf_calc_eco['indice_vulnerabilite_niveau'] = gdf_calc_eco['score_final_int']
    return


@app.cell
def _(carte_discret, gdf_calc_eco):
    carte_discret(gdf_calc_eco, 'score_final_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 7. Export Parquet

    Export du fichier final avec les colonnes sémantiques :

    | Colonne | Description | Plage |
    |---------|-------------|-------|
    | `code_insee` | Identifiant commune | — |
    | `indice_vulnerabilite` | Score composite continu | [0, 1] |
    | `indice_vulnerabilite_niveau` | Niveau discret | 0 → 4 |
    | `score_economique` | Dimension fragilité financière commune | [0, 1] |
    | `score_exposition` | Dimension exposition aux aléas climatiques | [0, 1] |
    | `score_assurance` | Dimension pression assurantielle | [0, 1] |
    """)
    return


@app.cell
def _(gdf_calc_eco):
    export_df = gdf_calc_eco[[
        "code_insee",
        "indice_vulnerabilite",
        "indice_vulnerabilite_niveau",
        "score_eco_minmax",
        "score_exposition",
        "score_assurance_min_max",
    ]].rename(columns={
        "score_eco_minmax": "score_economique",
        "score_assurance_min_max": "score_assurance",
    }).copy()

    export_df.to_parquet("score_vulnerabilite.parquet", index=False)
    print(f"Export terminé — {len(export_df)} communes")
    export_df
    return


if __name__ == "__main__":
    app.run()
