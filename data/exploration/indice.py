import marimo

__generated_with = "0.23.2"
app = marimo.App(width="medium")


@app.cell
def _():
    import duckdb
    import pandas as pd
    import geopandas as gpd
    from shapely import wkt
    import matplotlib.pyplot as plt
    from matplotlib.patches import Patch
    import marimo as mo
    import numpy as np
    import geopandas as gpd
    from sklearn.preprocessing import StandardScaler, MinMaxScaler,RobustScaler
    from sklearn.decomposition import PCA
    from sklearn.compose import ColumnTransformer
    import matplotlib.gridspec as gridspec
    from scipy import stats

    return (
        ColumnTransformer,
        MinMaxScaler,
        PCA,
        StandardScaler,
        duckdb,
        gpd,
        mo,
        np,
        pd,
        plt,
        stats,
        wkt,
    )


@app.cell
def _(duckdb, wkt):
    PCC_DUCKDB_FILE = "data/dbt_pipeline/dev.duckdb"
    con = duckdb.connect(database=PCC_DUCKDB_FILE, read_only=True)

    resultats_website_par_commune = con.sql("""SELECT	* FROM dev.main.resultats_website_par_commune""").df()

    resultats_website_par_commune["geometry"] = resultats_website_par_commune["geometry"].apply(wkt.loads)
    return con, resultats_website_par_commune


@app.cell
def _(con):

    ccr_stats = con.sql("""SELECT	* FROM dev.main.ccr_stats""").df()
    return (ccr_stats,)


@app.cell
def _(ccr_stats):
    ccr_stats['nb_arrete_autres'] = ccr_stats['nb_arrete_mvt'] + ccr_stats['nb_arrete_meteo'] +  ccr_stats['nb_arrete_marin'] + ccr_stats['nb_arrete_sism']+ ccr_stats['nb_arrete_autre']
    return


@app.cell
def _():
    # ccr_totals = ccr_stats.groupby('code_geo').agg(
    #     nb_total_arretes_recon=('nb_arrete_recon', 'sum'),
    #     nb_total_arretes=('nb_arrete', 'sum'),
    #     nb_total_arretes_ino=('nb_arrete_ino', 'sum'),
    #     nb_total_arretes_sec=('nb_arrete_sec', 'sum'),
    #     multiple_franchise_last=('multiple_franchise', 'last')  # approximation de MAX_BY
    # ).reset_index()

    # # puis compare
    # print(ccr_totals['nb_total_arretes'].sum())
    # print(resultats_website_par_commune['nb_total_arretes'].sum())
    return


@app.cell
def _(ccr_stats, resultats_website_par_commune):
    resultats_website_par_commune_ = resultats_website_par_commune.merge(ccr_stats[['nb_arrete_autres','code_geo']], left_on = 'code_insee', right_on = 'code_geo')
    return (resultats_website_par_commune_,)


@app.cell
def _(con):
    con.execute("""
    COPY (
        SELECT * FROM resultats_website_par_commune
    )
    TO 'resultats_website_par_commune.parquet'
    (FORMAT PARQUET);
    """)
    return


@app.cell
def _(gpd, resultats_website_par_commune_):
    gdf = gpd.GeoDataFrame(resultats_website_par_commune_, geometry="geometry")
    gdf = gdf.set_crs(4326).to_crs(2154)
    gdf["code_insee"] = gdf["code_insee"].astype(str)
    return (gdf,)


@app.cell
def _(gdf):
    gdf["geometry"] = gdf["geometry"].simplify(100)
    return


@app.cell
def _(gdf):
    gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec"]] = gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec","nb_arrete_autres"]].fillna(0)
    return


@app.cell(hide_code=True)
def _(plt):
    def carte_continue(df,col_color):
        fig = plt.figure(figsize=(20, 10))

        ax_metro = fig.add_axes([0.0, 0.0, 0.65, 1.0])
        vmin = df[col_color].quantile(0.01)
        vmax = df[col_color].quantile(0.99)
        metro = df[~df["code_insee"].str.startswith(("97","98"))]

        metro.plot(
            column=col_color,
            cmap="viridis",
            ax=ax_metro,
            linewidth=0.1,
            legend=True,rasterized=True,
            vmin=vmin,
            vmax=vmax
        )

        ax_metro.set_title(col_color, fontsize=14)
        ax_metro.set_aspect("equal")
        ax_metro.axis("off")

        droms = {
            "Guadeloupe": ("971", [0.66, 0.75, 0.16, 0.22]),
            "Martinique": ("972", [0.83, 0.75, 0.16, 0.22]),
            "Guyane": ("973", [0.66, 0.50, 0.16, 0.22]),
            "Réunion": ("974", [0.83, 0.50, 0.16, 0.22]),
            "Mayotte": ("976", [0.74, 0.25, 0.16, 0.22]),
        }

        for name, (code, pos) in droms.items():
            ax = fig.add_axes(pos)

            drom = df[df["code_insee"].str.startswith(code)]

            drom.plot(
                column=col_color,
                cmap="viridis",
                ax=ax,
                linewidth=0.1,rasterized=True,
                vmin=vmin,
                vmax=vmax
            )

            ax.set_title(name, fontsize=9)
            ax.axis("off")

        plt.tight_layout()
        plt.show()

    return (carte_continue,)


@app.cell
def _(plt):
    def carte_discret(df,col_color):
        fig = plt.figure(figsize=(20, 10))

        ax_metro = fig.add_axes([0.0, 0.0, 0.65, 1.0])
        # vmin = df[col_color].quantile(0.01)
        # vmax = df[col_color].quantile(0.99)
        metro = df[~df["code_insee"].str.startswith(("97","98"))]
        colors = ['#24AD46','#B4FF5E','#FFF45E','#F5A927','#F54927']
        metro.plot(
            column=col_color,
            # cmap="viridis",
            ax=ax_metro,
            linewidth=0.1,
            legend=True,rasterized=True,
            # vmin=vmin,
            # vmax=vmax
        )

        ax_metro.set_title(col_color, fontsize=14)
        ax_metro.set_aspect("equal")
        ax_metro.axis("off")

        droms = {
            "Guadeloupe": ("971", [0.66, 0.75, 0.16, 0.22]),
            "Martinique": ("972", [0.83, 0.75, 0.16, 0.22]),
            "Guyane": ("973", [0.66, 0.50, 0.16, 0.22]),
            "Réunion": ("974", [0.83, 0.50, 0.16, 0.22]),
            "Mayotte": ("976", [0.74, 0.25, 0.16, 0.22]),
        }

        for name, (code, pos) in droms.items():
            ax = fig.add_axes(pos)

            drom = df[df["code_insee"].str.startswith(code)]

            drom.plot(
                column=col_color,
                # cmap="viridis",
                ax=ax,
                linewidth=0.1,rasterized=True,
                # vmin=vmin,
                # vmax=vmax
            )

            ax.set_title(name, fontsize=9)
            ax.axis("off")

        plt.tight_layout()
        plt.show()

    return


@app.cell(hide_code=True)
def _(gdf, mo):
    colonnes = [
        col for col in gdf.columns
        if col not in ["geometry", "code_insee",'code_departement', 'code_region','geo_point_2_d',"departement","region","nom_commune","prime_assurance_2021","prime_assurance_2022","prime_assurance_2023",'indice_vulnerabilite', 'indice_vulnerabilite_niveau','date_approbation_rga', 'date_approbation_ino']
    ]

    col_selector = mo.ui.dropdown(
        options=colonnes,
        value=colonnes[0],
        label="Choisis la colonne"
    )
    return (col_selector,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Carte des variables
    """)
    return


@app.cell
def _(col_selector):
    col_selector
    return


@app.cell
def _(carte_continue, col_selector, gdf):
    col = col_selector.value
    carte_continue(gdf, col)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Creation des selecteurs
    """)
    return


@app.cell
def _(mo):
    poids_prevention = mo.ui.slider(0, 1, step=0.1,value=0.2)
    return (poids_prevention,)


@app.cell
def _(mo):
    col_selector_secheresse = mo.ui.multiselect(
        options=[
            'swi_04_d_abs',
            'tx_35_d_abs',
            'nb_total_arretes_sec',
            'nb_total_arretes_recon',
            'indicateur_rga'
        ],
        value=['swi_04_d_abs', 'nb_total_arretes_sec',"indicateur_rga"],  # sélection par défaut
        label="Choisis les variables pour la PCA"
    )
    return (col_selector_secheresse,)


@app.cell
def _(mo):
    col_selector_inondation = mo.ui.multiselect(
        options=[
            'pxcwd_abs',
            'rr_50_d_abs',
            'nb_total_arretes_ino',
            'nb_total_arretes_recon',
            'indicateur_tri'
        ],
        value=['rr_50_d_abs', 'nb_total_arretes_ino',"indicateur_tri"],  # sélection par défaut
        label="Choisis les variables pour la PCA Inondation"
    )
    return (col_selector_inondation,)


@app.cell
def _(mo):
    colonnes_score_expo = [
    'score_secheresse',
           'score_inondation', 'score_secheresse_norm', 'score_inondation_norm',
           'score_secheresse_net', 'score_inondation_net',
           'score_climatique_global'
    ]

    col_selector_score_expo = mo.ui.dropdown(
        options=colonnes_score_expo,
        value=colonnes_score_expo[0],
        label="Choisis la colonne"
    )
    return (col_selector_score_expo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score géorisque
    """)
    return


@app.cell
def _(col_selector_secheresse):
    col_selector_secheresse
    return


@app.cell(hide_code=True)
def _(PCA, StandardScaler, col_selector_secheresse, gdf):
    selected_cols = col_selector_secheresse.value
    metropole_datas = gdf[~gdf["code_insee"].str.startswith(("97","98"))]
    metropole_datas[selected_cols] = metropole_datas[selected_cols].fillna(0)
    scaler_sec = StandardScaler()
    X_sec_scaled = scaler_sec.fit_transform(metropole_datas[selected_cols])

    pca_sec = PCA(n_components=1)
    pca_sec.fit(X_sec_scaled)

    # w1, w2 = pca_sec.explained_variance_ratio_
    scores = pca_sec.transform(X_sec_scaled)
    # score_unique = w1 * scores[:,0] + w2 * scores[:,1]

    metropole_datas['score_secheresse'] = scores
    return metropole_datas, pca_sec, selected_cols


@app.cell(hide_code=True)
def _(metropole_datas, np, plt, selected_cols):
    corr = metropole_datas[selected_cols + ["score_secheresse"]].corr()

    fig, ax = plt.subplots(figsize=(6,4))

    cax = ax.imshow(corr, vmin=0, vmax=1)
    ax.set_xticks(np.arange(0, len(corr.columns)-0.5, 1))
    ax.set_yticks(np.arange(0, len(corr.index)-0.5, 1))

    ax.set_xticklabels(corr.columns, rotation=45, ha="right")
    ax.set_yticklabels(corr.index)
    cbar = fig.colorbar(cax, ax=ax)
    cbar.set_label("Corrélation")
    plt.show()
    return


@app.cell
def _(selected_cols):
    print(selected_cols)
    return


@app.cell
def _(pca_sec):
    print(pca_sec.components_)
    # print(pca_sec.feature_names_in_)
    return


@app.cell
def _(pca_sec):
    print(pca_sec.explained_variance_ratio_)
    print(f"Total : {pca_sec.explained_variance_ratio_.sum():.1%}")
    return


@app.cell
def _(col_selector_inondation):
    col_selector_inondation
    return


@app.cell(hide_code=True)
def _(ColumnTransformer, PCA, StandardScaler, col_selector_inondation, gdf):
    selected_cols_inondation = col_selector_inondation.value
    datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))]
    datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)
    # scaler_ino = MinMaxScaler()


    num_std = [c for c in ['rr_50_d_abs','pxcwd_abs','swi_04_d_abs','tx_35_d_abs'] if c in selected_cols_inondation]

    num_robust = [c for c in ['nb_total_arretes_reco','nb_total_arretes_ino','nb_total_arretes_sec'] if c in selected_cols_inondation]

    passthrough = [c for c in ['indicateur_rga','indicateur_tri'] if c in selected_cols_inondation]

    preprocessor = ColumnTransformer(
        transformers=[
            ("std", StandardScaler(), num_std),
            ("robust", StandardScaler(), num_robust),
            ("pass",  StandardScaler(), passthrough)
        ]
    )

    # preprocessor = ColumnTransformer(
    #     transformers=[
    #         ("std", StandardScaler(), ['rr_50_d_abs']),
    #         ("robust", RobustScaler(), ['nb_total_arretes_ino']),
    #         ("passthrough", 'passthrough', ['indicateur_tri'])
    #     ]
    # )
    X_ino_scaled = preprocessor.fit_transform(datas_inondation[selected_cols_inondation])
    # X_ino_scaled = scaler_ino.fit_transform(datas_inondation[selected_cols_inondation])


    pca_ino = PCA(n_components=2)
    pca_ino.fit(X_ino_scaled)

    # print(pca_sec.explained_variance_ratio_)
    # print(f"Total : {pca_sec.explained_variance_ratio_.sum():.1%}")

    w1_ino, w2_ino = pca_ino.explained_variance_ratio_
    scores_ino = pca_ino.transform(X_ino_scaled)
    score_unique_ino = w1_ino * scores_ino[:,0] + w2_ino * scores_ino[:,1]

    datas_inondation['score_inondation'] = score_unique_ino
    return datas_inondation, pca_ino, preprocessor, selected_cols_inondation


@app.cell(hide_code=True)
def _(pca_ino):
    print(pca_ino.explained_variance_ratio_)
    print(f"Total : {pca_ino.explained_variance_ratio_.sum():.1%}")
    return


@app.cell(hide_code=True)
def _(datas_inondation, np, plt, selected_cols_inondation):
    corr_ino = datas_inondation[selected_cols_inondation + ["score_inondation"]].corr()

    fig_ino, ax_ino = plt.subplots(figsize=(6,4))

    cax_ino = ax_ino.imshow(corr_ino, vmin=0, vmax=1)
    ax_ino.set_xticks(np.arange(0, len(corr_ino.columns)-0.5, 1))
    ax_ino.set_yticks(np.arange(0, len(corr_ino.index)-0.5, 1))

    ax_ino.set_xticklabels(corr_ino.columns, rotation=45, ha="right")
    ax_ino.set_yticklabels(corr_ino.index)
    cbar_ino = fig_ino.colorbar(cax_ino, ax=ax_ino)
    cbar_ino.set_label("Corrélation Inondation")
    plt.show()
    return


@app.cell
def _(preprocessor):
    print(preprocessor.get_feature_names_out())
    return


@app.cell
def _(pca_ino):
    print(pca_ino.components_)
    return


@app.cell
def _(pca_ino):
    print(pca_ino.explained_variance_ratio_)
    print(f"Total : {pca_ino.explained_variance_ratio_.sum():.1%}")
    return


@app.cell
def _(col_selector_score_expo, mo, poids_prevention):
    mo.hstack([poids_prevention, col_selector_score_expo])  # pour les afficher
    return


@app.cell
def _(col_selector_inondation, col_selector_secheresse, mo):
    mo.hstack([col_selector_inondation, col_selector_secheresse])  # pour les afficher
    return


@app.function(hide_code=True)
def clip_minmax(series, lower=1, upper=99):
    p_low  = series.quantile(lower / 100)
    p_high = series.quantile(upper / 100)
    clipped = series.clip(lower=p_low, upper=p_high)
    return (clipped - clipped.min()) / (clipped.max() - clipped.min())


@app.cell
def _(gdf_calc):
    gdf_calc.columns
    return


@app.cell
def _(gdf_calc, mo):
    col_selector_distrib = mo.ui.multiselect(
        options=list(gdf_calc.select_dtypes(include='number').columns),
        value=['score_secheresse', 'score_inondation','part_prime_budget','evolution_prime_assurance','nb_arrete_autres'],
        label='Colonnes à visualiser'
    )
    col_selector_distrib
    return (col_selector_distrib,)


@app.cell
def _(col_selector_distrib, gdf_calc, mo, plt, stats):
    colors_palette = [
        '#1D9E75', '#534AB7', '#E24B4A', '#BA7517',
        '#185FA5', '#993556', '#3B6D11', '#5F5E5A'
    ]
    colors = {col: colors_palette[i % len(colors_palette)] for i, col in enumerate(col_selector_distrib.value)}
    # scores_test = {
    #     'score_secheresse': gdf_ca|lc['score_secheresse'].dropna(),
    #     'score_inondation': gdf_calc['score_inondation'].dropna(),
    # }
    selected = col_selector_distrib.value
    # Sécurité : force en liste si marimo retourne une string
    if isinstance(selected, str):
        selected = [selected]

    scores_test = {
        col: gdf_calc[col].dropna()
        for col in selected
    }
    normalizations = {
        'Brut (PCA)':          lambda s: s,
        'StandardScaler':      lambda s: (s - s.mean()) / s.std(),
        'MinMaxScaler':        lambda s: (s - s.min()) / (s.max() - s.min()),
        'Clip p1–p99 + MinMax': clip_minmax,
        # 'QuantileTransformer': lambda s: s.rank(pct=True),
    }


    n_rows = len(scores_test)
    n_cols = len(normalizations)
    # fig_test = plt.figure(figsize=(18, 10))
    # fig_test.suptitle('Comparaison des normalisations — distributions des scores', fontsize=13, y=1.01)

    # gs = gridspec.GridSpec(2, len(normalizations), figure=fig_test, hspace=0.5, wspace=0.3)

    # for col_test, (norm_name, norm_fn) in enumerate(normalizations.items()):
    #     for row, (score_name, raw) in enumerate(scores_test.items()):
    #         ax_test = fig_test.add_subplot(gs[row, col_test])
    #         transformed = norm_fn(raw)

    #         ax_test.hist(transformed, bins=60, color=colors[score_name], alpha=0.75, edgecolor='none')

    #         sk = stats.skew(transformed)
    #         mn, mx = transformed.min(), transformed.max()

    #         ax_test.set_title(norm_name if row == 0 else '', fontsize=9, fontweight='bold')
    #         ax_test.set_ylabel(score_name.replace('score_', '') if col_test == 0 else '', fontsize=9)
    #         ax_test.tick_params(labelsize=7)

    #         ax_test.text(0.97, 0.95, f'skew={sk:.2f}\n[{mn:.2f}, {mx:.2f}]',
    #                 transform=ax_test.transAxes, fontsize=7,
    #                 verticalalignment='top', horizontalalignment='right',
    #                 color='#555')

    # plt.tight_layout()
    # plt.show()
    if n_rows == 0:
        mo.md("Sélectionne au moins une colonne.")
    else:
        fig_test, axes = plt.subplots(
            n_rows, n_cols,
            figsize=(4 * n_cols, 3 * n_rows),
            squeeze=False
        )
        for col_idx, (norm_name, norm_fn) in enumerate(normalizations.items()):
            for row_idx, (score_name, raw) in enumerate(scores_test.items()):

                ax_test = axes[row_idx][col_idx]
                transformed = norm_fn(raw)
                sk = stats.skew(transformed)
                mn, mx = transformed.min(), transformed.max()

                ax_test.hist(transformed, bins=60, color=colors[score_name], alpha=0.75, edgecolor='none')
                ax_test.set_title(norm_name if row_idx == 0 else '', fontsize=9, fontweight='bold')
                ax_test.set_ylabel(score_name if col_idx == 0 else '', fontsize=8)
                ax_test.tick_params(labelsize=7)
                ax_test.text(0.97, 0.95, f'skew={sk:.2f}\n[{mn:.2f}, {mx:.2f}]',
                        transform=ax_test.transAxes, fontsize=7,
                        va='top', ha='right', color='#555')

        plt.tight_layout()
        plt.show()
    return


@app.cell(hide_code=True)
def _(datas_inondation, gdf, metropole_datas, poids_prevention):
    gdf_calc = gdf.copy()

    gdf_calc.loc[metropole_datas.index, "score_secheresse"] = metropole_datas["score_secheresse"]

    gdf_calc.loc[datas_inondation.index, "score_inondation"] = datas_inondation["score_inondation"].values

    gdf_calc['score_secheresse_norm'] = clip_minmax(gdf_calc['score_secheresse'])
    gdf_calc['score_inondation_norm'] = clip_minmax(gdf_calc['score_inondation'])

    gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_arrete_autres'])
    # scaler_sec_robust = StandardScaler()
    # scaler_ino_robust = StandardScaler()

    # sec = scaler_sec_robust.fit_transform(gdf_calc[['score_secheresse']])
    # ino = scaler_ino_robust.fit_transform(gdf_calc[['score_inondation']])

    # gdf_calc['score_secheresse_norm'] = MinMaxScaler().fit_transform(sec)
    # gdf_calc['score_inondation_norm'] = MinMaxScaler().fit_transform(ino)

    p = poids_prevention.value

    gdf_calc['score_secheresse_net'] = (gdf_calc['score_secheresse_norm'] - p * gdf_calc['pprn_rga']).clip(lower=0)
    gdf_calc['score_inondation_net'] = (gdf_calc['score_inondation_norm'] - p * gdf_calc['pprn_ino']).clip(lower=0)

    gdf_calc['score_climatique_global'] = gdf_calc[
        ['score_secheresse_net','score_inondation_net']
    ].mean(axis=1)*0.9+0.1*gdf_calc['score_autres']
    return (gdf_calc,)


@app.cell
def _(col_selector_score_expo):
    col_selector_score_expo
    return


@app.cell
def _(carte_continue, col_selector_score_expo, gdf_calc):
    carte_continue(gdf_calc, col_selector_score_expo.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score assurances
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    colonnes_assurances = [
    'score_assurance',
           'multiple_franchise_last', 'evolution_prime_assurance_clipped_norm', 'part_prime_budget_clipped_norm','part_arretes_non_reco'
    ]

    col_selector_score_assurance = mo.ui.dropdown(
        options=colonnes_assurances,
        value=colonnes_assurances[0],
        label="Choisis la colonne"
    )
    return (col_selector_score_assurance,)


@app.cell(hide_code=True)
def _(mo):
    poids_prevention_prime_budget = mo.ui.slider(0, 1, step=0.1,value=0.4)
    poids_prevention_evolution_prime = mo.ui.slider(0, 1, step=0.1,value=0.3)
    poids_prevention_franchise = mo.ui.slider(0, 1, step=0.05,value=0.2)
    return (
        poids_prevention_evolution_prime,
        poids_prevention_franchise,
        poids_prevention_prime_budget,
    )


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(
    MinMaxScaler,
    gdf_calc,
    mo,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    ppb = poids_prevention_prime_budget.value
    pep = poids_prevention_evolution_prime.value
    pf = poids_prevention_franchise.value
    pna = 1 - pep - ppb
    mo.hstack([poids_prevention_prime_budget, poids_prevention_evolution_prime, poids_prevention_franchise])
    gdf_calc['part_arretes_non_reco'] = (gdf_calc['nb_total_arretes'] - gdf_calc['nb_total_arretes_recon'])/gdf_calc['nb_total_arretes']
    # scaler = StandardScaler()
    gdf_calc['part_arretes_non_reco'] = gdf_calc['part_arretes_non_reco'].fillna(0)
    gdf_calc_assurance  = gdf_calc.copy()

    # 'part_prime_budget', 'evolution_prime_assurance'
    # 'franchise_norm'

    for col_ in ['part_prime_budget', 'evolution_prime_assurance']:
        low = gdf_calc_assurance[col_].quantile(0.01)
        high = gdf_calc_assurance[col_].quantile(0.99)
        gdf_calc_assurance[col_ + '_clipped'] = gdf_calc_assurance[col_].clip(gdf_calc_assurance[col_].min(), high)

    scaler_max = MinMaxScaler()
    cols_assurance = ['part_prime_budget_clipped', 'evolution_prime_assurance_clipped']
    gdf_calc_assurance[[c + '_norm' for c in cols_assurance]] = scaler_max.fit_transform(
        gdf_calc_assurance[cols_assurance]
    )
    # gdf_calc_assurance[['part_prime_budget_norm', 'evolution_prime_assurance_norm']] = scaler_robust.fit_transform(
    #     gdf_calc_assurance[['part_prime_budget', 'evolution_prime_assurance']]
    # )


    gdf_calc_assurance['score_assurance'] = (
        pep * gdf_calc_assurance['evolution_prime_assurance_clipped_norm'] +
         ppb* gdf_calc_assurance['part_prime_budget_clipped_norm']
        + pna * gdf_calc_assurance['part_arretes_non_reco'])
    gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(1)
    gdf_calc_assurance['score_assurance'] += (
         pf*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))
    return (gdf_calc_assurance,)


@app.cell
def _():
    return


@app.cell
def _(
    mo,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    mo.hstack([poids_prevention_prime_budget, poids_prevention_evolution_prime, poids_prevention_franchise])
    return


@app.cell
def _(col_selector_score_assurance):
    col_selector_score_assurance
    return


@app.cell
def _(carte_continue, col_selector_score_assurance, gdf_calc_assurance):
    carte_continue(gdf_calc_assurance, col_selector_score_assurance.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score Économique
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    colonnes_eco = [
    'ratio_dettes_depenses',
           'depenses_per_pop','score_eco','ratio_dettes_depenses_norm',
           'depenses_per_pop_norm'
    ]

    col_selector_score_eco = mo.ui.dropdown(
        options=colonnes_eco,
        value=colonnes_eco[0],
        label="Choisis la colonne"
    )
    return (col_selector_score_eco,)


@app.cell
def _():
    # poids_prevention_depenses_per_pop = mo.ui.slider(0, 1, step=0.1)
    return


@app.cell(hide_code=True)
def _(mo):
    poids_prevention_dettes = mo.ui.slider(0, 1, step=0.1,value=0.5)
    return (poids_prevention_dettes,)


@app.cell
def _(MinMaxScaler, gdf_calc_assurance, np, poids_prevention_dettes):
    poids_prevention_dettes

    dette = poids_prevention_dettes.value
    dep = 1 - dette

    gdf_calc_eco = gdf_calc_assurance.copy()

    gdf_calc_eco['depenses_per_pop'] = gdf_calc_eco['depenses_per_pop'].replace(np.inf,np.nan)



    cols_eco = ['depenses_per_pop', 'ratio_dettes_depenses']

    for cols_ in cols_eco:
        low_ = gdf_calc_eco[cols_].quantile(0.1)
        high_ = gdf_calc_eco[cols_].quantile(0.99)
        gdf_calc_eco[cols_ + '_clip'] = gdf_calc_eco[cols_].clip(low_, high_)

    scaler = MinMaxScaler()

    cols_clip = [c + '_clip' for c in cols_eco]

    gdf_calc_eco[[c + '_norm' for c in cols_eco]] = scaler.fit_transform(
        gdf_calc_eco[cols_clip]
    )
    gdf_calc_eco['depenses_per_pop_norm'] = 1 - gdf_calc_eco['depenses_per_pop_norm']
    gdf_calc_eco['ratio_dettes_depenses_norm'] = 1 - gdf_calc_eco['ratio_dettes_depenses_norm']

    # dette = poids_prevention_dettes.value
    # dep = 1 - dette

    gdf_calc_eco['score_eco'] = (
        dette * gdf_calc_eco['ratio_dettes_depenses_norm'] +
         dep* gdf_calc_eco['depenses_per_pop_norm']
    )
    return (gdf_calc_eco,)


@app.cell
def _():
    return


@app.cell
def _(col_selector_score_eco):
    col_selector_score_eco
    return


@app.cell
def _(poids_prevention_dettes):
    poids_prevention_dettes
    return


@app.cell
def _(carte_continue, col_selector_score_eco, gdf_calc_eco):
    carte_continue(gdf_calc_eco, col_selector_score_eco.value)
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score Final
    """)
    return


@app.cell
def _(mo):
    colonnes_score = [
    'Score_vulnerabilite','score_final','score_eco','score_assurance',
           'score_climatique_global','score_final'
    ]

    col_selector_score = mo.ui.dropdown(
        options=colonnes_score,
        value=colonnes_score[0],
        label="Choisis la colonne"
    )
    return (col_selector_score,)


@app.cell
def _(mo):
    poids_score_eco = mo.ui.slider(0, 1, step=0.01)
    poids_score_assurance = mo.ui.slider(0, 1, step=0.01)
    return poids_score_assurance, poids_score_eco


@app.cell
def _(poids_score_assurance, poids_score_eco):
    poids_eco = poids_score_eco.value
    poids_assurance = poids_score_assurance.value
    poids_expo = 1 - poids_assurance - poids_eco
    return poids_assurance, poids_eco, poids_expo


@app.cell
def _(gdf_calc_eco, poids_assurance, poids_eco, poids_expo):
    poids_eco
    poids_assurance
    poids_expo

    gdf_calc_final = gdf_calc_eco.copy()
    gdf_calc_final['score_final'] = poids_eco*gdf_calc_final['score_eco'] +poids_assurance*gdf_calc_final['score_assurance'] + poids_expo*gdf_calc_final['score_climatique_global']
    return (gdf_calc_final,)


@app.cell
def _(mo, poids_expo, poids_score_assurance, poids_score_eco):
    mo.hstack([poids_score_eco, poids_score_assurance,poids_expo])
    return


@app.cell
def _(col_selector_score):
    col_selector_score
    return


@app.cell
def _(carte_continue, col_selector_score, gdf_calc_final):
    carte_continue(gdf_calc_final, col_selector_score.value)
    return


@app.cell
def _(gdf_calc_final, pd):
    gdf_calc_final['Score_vulnerabilite'] = pd.cut(gdf_calc_final['score_final'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1.0],
                         labels=[1, 2, 3, 4, 5], include_lowest=True)
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
