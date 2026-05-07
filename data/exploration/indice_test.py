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
    from sklearn.cluster import KMeans

    return PCA, StandardScaler, duckdb, gpd, mo, np, pd, plt, stats, wkt


@app.cell
def _(duckdb, wkt):
    PCC_DUCKDB_FILE = "data/exploration/dev.duckdb"
    con = duckdb.connect(database=PCC_DUCKDB_FILE, read_only=True)

    resultats_website_par_commune = con.sql("""SELECT	* FROM dev.main.resultats_website_par_commune""").df()

    resultats_website_par_commune["geometry"] = resultats_website_par_commune["geometry"].apply(wkt.loads)
    return con, resultats_website_par_commune


@app.cell
def _(gpd, resultats_website_par_commune):
    gdf = gpd.GeoDataFrame(resultats_website_par_commune, geometry="geometry")
    gdf = gdf.set_crs(4326).to_crs(2154)
    gdf["code_insee"] = gdf["code_insee"].astype(str)
    gdf["geometry"] = gdf["geometry"].simplify(100)
    return (gdf,)


@app.cell
def _(gdf):
    gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec","nb_total_arretes_autre"]] = gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec","nb_total_arretes_autre"]].fillna(0)
    return


@app.function
def clip_minmax(s,q_low,q_high):
    lo, hi = s.quantile(q_low), s.quantile(q_high)
    return (s.clip(lo, hi) - lo) / (hi - lo)


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


@app.cell(hide_code=True)
def _(pd, plt):
    def carte_discret(df,col_color):
        fig = plt.figure(figsize=(20, 10))

        ax_metro = fig.add_axes([0.0, 0.0, 0.65, 1.0])
        # vmin = df[col_color].quantile(0.01)
        # vmax = df[col_color].quantile(0.99)
        metro = df[~df["code_insee"].str.startswith(("97","98"))]
        colors = ['#608D83','#AFA15D','#F4BA5F','#D9622C','#AA2E26']

        vals = sorted(df[col_color].dropna().unique())
        # colors = ['#24AD46', '#B4FF5E', '#FFF45E', '#F5A927', '#F54927']
        color_map = {val: col for val, col in zip(vals, colors)}


        metro.plot(
            # column=col_color,
            color=metro[col_color].map(lambda x: color_map.get(x, color_map.get(int(x) if pd.notna(x) else x, '#D3D3D3'))),        # cmap="viridis",
            ax=ax_metro,
            linewidth=0.1,
            # legend=True,
            rasterized=True,
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
                # column=col_color,
                color=drom[col_color].map(lambda x: color_map.get(x, color_map.get(int(x) if pd.notna(x) else x, '#D3D3D3'))),            # cmap="viridis",
                ax=ax,
                linewidth=0.1,
                rasterized=True,
                # vmin=vmin,
                # vmax=vmax
            )

            ax.set_title(name, fontsize=9)
            ax.axis("off")

        plt.tight_layout()
        # plt.savefig('indice_vulnerabilite.svg',transparent=True)
        # plt.savefig('indice_vulnerabilite.png',transparent=True)
        plt.show()


    return (carte_discret,)


@app.cell(hide_code=True)
def _(maks, np, plt, stats):
    def plot_normalization_comparison(
        gdf,
        columns,
        colors_palette=None,
        clip_quantiles=(0.01, 0.95),
        show_log=False,
        overlays=None, 
    ):
        """
        Affiche une grille de distributions selon différentes normalisations.

        Parameters
        ----------
        gdf : GeoDataFrame / DataFrame
            Source des données.
        columns : list[str]
            Colonnes à comparer.
        colors_palette : list[str], optional
            Palette de couleurs (cyclique).
        clip_quantiles : tuple(float, float)
            Quantiles bas/haut pour le Clip+MinMax. Default (0.01, 0.95).
        show_log : bool
            Si True, ajoute une colonne "Log1p" dans les normalisations.
        """
        if colors_palette is None:
            colors_palette = [
                '#1D9E75', '#534AB7', '#E24B4A', '#BA7517',
                '#185FA5', '#993556', '#3B6D11', '#5F5E5A'
            ]

        # Sécurité : accepte une string ou une liste
        if isinstance(columns, str):
            columns = [columns]

        colors = {col: colors_palette[i % len(colors_palette)] for i, col in enumerate(columns)}

        scores = {col: gdf[col].dropna() for col in columns}

        q_low, q_high = clip_quantiles

        def clip_minmax(s):
            lo, hi = s.quantile(q_low), s.quantile(q_high)
            return (s.clip(lo, hi) - lo) / (hi - lo)

        normalizations = {
            'Brut':                    lambda s: s,
            'StandardScaler':                lambda s: (s - s.mean()) / s.std(),
            'MinMaxScaler':                  lambda s: (s - s.min()) / (s.max() - s.min()),
            f'Clip p{int(q_low*100)}–p{int(q_high*100)} + MinMax': clip_minmax,
        }

        if show_log:
            normalizations['Log1p'] = lambda s: np.log1p(s - s.min())

        n_rows = len(scores)
        n_cols = len(normalizations)

        if n_rows == 0:
            print("Sélectionne au moins une colonne.")
            return

        fig, axes = plt.subplots(
            n_rows, n_cols,
            figsize=(4 * n_cols, 3 * n_rows),
            squeeze=False
        )

        for col_idx, (norm_name, norm_fn) in enumerate(normalizations.items()):
            for row_idx, (score_name, raw) in enumerate(scores.items()):
                ax = axes[row_idx][col_idx]
                transformed = norm_fn(raw)
                sk = stats.skew(transformed)
                mn, mx = transformed.min(), transformed.max()

                ax.hist(transformed, bins=60, color=colors[score_name], alpha=0.75, edgecolor='none')

                if overlays:
                    overlay_colors = ['#FF6B35', '#A8DADC', '#F4D35E', '#EE6C4D']
                    for ov_idx, (ov_label, ov_gdf) in enumerate(overlays.items()):

                        mask = ov_gdf.index()
                        ov_transformed = transformed.loc[maks]


                        # # if score_name not in ov_gdf.columns:
                        # #     continue
                        # ov_raw = ov_gdf[score_name].dropna()
                        # if ov_raw.empty:
                        #     continue
                        # ov_transformed = norm_fn(ov_raw)
                        # ov_transformed = ov_transformed[np.isfinite(ov_transformed)]
                        # if ov_transformed.empty:
                        #     continue
                        ov_color = overlay_colors[ov_idx % len(overlay_colors)]
                        ax.hist(ov_transformed, bins=60, color=ov_color, alpha=0.6, edgecolor='none', label=ov_label)

                if overlays:
                    ax.legend(fontsize=6, loc='upper left')
                ax.set_title(norm_name if row_idx == 0 else '', fontsize=9, fontweight='bold')
                ax.set_ylabel(score_name if col_idx == 0 else '', fontsize=8)
                ax.tick_params(labelsize=7)
                ax.text(
                    0.97, 0.95,
                    f'skew={sk:.2f}\n[{mn:.2f}, {mx:.2f}]',
                    transform=ax.transAxes, fontsize=7,
                    va='top', ha='right', color='#555'
                )

        plt.tight_layout()
        plt.show()

    return (plot_normalization_comparison,)


@app.cell
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
    # Score exposition
    """)
    return


@app.cell
def _(mo):
    poids_prevention = mo.ui.slider(0, 1, step=0.1,value=0.2)
    return (poids_prevention,)


@app.cell(hide_code=True)
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


@app.cell(hide_code=True)
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


@app.cell(hide_code=True)
def _(mo):
    colonnes_score_expo = [
    'score_secheresse',
           'score_inondation', 'score_secheresse_norm', 'score_inondation_norm',
           'score_secheresse_net', 'score_inondation_net',
           'score_climatique_global','score_climatique_global_norm'
    ]

    col_selector_score_expo = mo.ui.dropdown(
        options=colonnes_score_expo,
        value=colonnes_score_expo[0],
        label="Choisis la colonne"
    )
    return


@app.cell
def _(PCA, StandardScaler, col_selector_secheresse, gdf):
    selected_cols = col_selector_secheresse.value
    metropole_datas = gdf[~gdf["code_insee"].str.startswith(("97","98"))]
    metropole_datas[selected_cols] = metropole_datas[selected_cols].fillna(0)
    scaler_sec = StandardScaler()
    X_sec_scaled = scaler_sec.fit_transform(metropole_datas[selected_cols])

    pca_sec = PCA(n_components=1)
    pca_sec.fit(X_sec_scaled)

    scores = pca_sec.transform(X_sec_scaled)

    metropole_datas['score_secheresse'] = scores
    return (metropole_datas,)


@app.cell
def _(PCA, StandardScaler, col_selector_inondation, gdf):
    selected_cols_inondation = col_selector_inondation.value
    datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))]
    datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)

    scaler_ino = StandardScaler()
    X_ino_scaled = scaler_ino.fit_transform(datas_inondation[selected_cols_inondation])


    pca_ino = PCA(n_components=1)
    pca_ino.fit(X_ino_scaled)

    # w1_ino, w2_ino = pca_ino.explained_variance_ratio_
    scores_ino = pca_ino.transform(X_ino_scaled)
    # score_unique_ino = w1_ino * scores_ino[:,0] + w2_ino * scores_ino[:,1]

    datas_inondation['score_inondation'] = scores_ino
    return datas_inondation, pca_ino, selected_cols_inondation


@app.cell
def _(pca_ino, pd, selected_cols_inondation):
    loadings_ino = pd.Series(
        pca_ino.components_[0],
        index=selected_cols_inondation,
        name='loading_PC1'
    )
    print(loadings_ino)
    return


@app.cell
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc,
        columns=['rr_50_d_abs', 'indicateur_tri',"score_inondation",'score_secheresse'],
        clip_quantiles=(0.05, 0.99),
        show_log=True,
    )
    return


@app.cell
def _():
    # corr_ino = datas_inondation[selected_cols_inondation + ["score_inondation"]].corr()

    # fig_ino, ax_ino = plt.subplots(figsize=(6,4))

    # cax_ino = ax_ino.imshow(corr_ino, vmin=0, vmax=1)
    # ax_ino.set_xticks(np.arange(0, len(corr_ino.columns)-0.5, 1))
    # ax_ino.set_yticks(np.arange(0, len(corr_ino.index)-0.5, 1))

    # ax_ino.set_xticklabels(corr_ino.columns, rotation=45, ha="right")
    # ax_ino.set_yticklabels(corr_ino.index)
    # cbar_ino = fig_ino.colorbar(cax_ino, ax=ax_ino)
    # cbar_ino.set_label("Corrélation Inondation")
    # plt.show()
    return


@app.cell
def _(poids_prevention):
    poids_prevention
    return


@app.cell
def _(datas_inondation, gdf, metropole_datas, np, poids_prevention):
    gdf_calc = gdf.copy()

    poid_pre = poids_prevention.value
    gdf_calc.loc[metropole_datas.index, "score_secheresse"] = metropole_datas["score_secheresse"]

    gdf_calc.loc[datas_inondation.index, "score_inondation"] = datas_inondation["score_inondation"].values


    gdf_calc['s_norm']  = clip_minmax(gdf_calc['score_secheresse'], q_low=0.05, q_high=0.95)
    gdf_calc['i_norm']  = clip_minmax(gdf_calc['score_inondation'],  q_low=0.05, q_high=0.95)

    gdf_calc['score_secheresse_net'] = (gdf_calc['s_norm'] - poid_pre * gdf_calc['pprn_rga']).clip(lower=0)
    gdf_calc['score_inondation_net'] = (gdf_calc['i_norm'] - poid_pre * gdf_calc['pprn_ino']).clip(lower=0)
    gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_total_arretes_autre'], q_low=0, q_high=1)

    score = np.sqrt(0.45*gdf_calc['score_secheresse_net'] **2 + 0.45*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2)

    gdf_calc['score_global_lp'] = score.fillna(
        gdf_calc['score_secheresse_net'].fillna(np.sqrt(0.9*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2))
    )

    gdf_calc['score_exposition'] = gdf_calc['score_global_lp']/(gdf_calc['score_global_lp'].max())
    return (gdf_calc,)


@app.cell
def _():
    # gdf_calc['score_global_lp_discret'] = pd.cut(gdf_calc['score_exposition'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_exposition_int'] = (gdf_calc['score_exposition']*5).clip(0,4).astype('Int64')
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_exposition_1d'] = (gdf_calc['score_exposition']*5).round(1)
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_exposition_int'].value_counts()
    return


@app.cell
def _(carte_discret, gdf_calc):
    carte_discret(gdf_calc, 'score_exposition_int')
    return


@app.cell
def _(carte_continue, gdf_calc):
    carte_continue(gdf_calc, 'score_exposition')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score Assurances
    """)
    return


@app.cell
def _(mo):
    colonnes_assurances = [
    'score_assurance',
           'multiple_franchise_last', 'evolution_prime_assurance_clipped_norm', 'part_prime_budget_clipped_norm','part_arretes_non_reco','score_assurance_norm'
    ]

    col_selector_score_assurance = mo.ui.dropdown(
        options=colonnes_assurances,
        value=colonnes_assurances[0],
        label="Choisis la colonne"
    )
    return


@app.cell
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
def _(
    mo,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    mo.hstack([poids_prevention_prime_budget, poids_prevention_evolution_prime, poids_prevention_franchise])
    return


@app.cell
def _(
    gdf_calc,
    np,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    ppb = poids_prevention_prime_budget.value
    pep = poids_prevention_evolution_prime.value
    pf = poids_prevention_franchise.value
    pna = 1 - pep - ppb

    # gdf_calc['part_arretes_non_reco'] = (gdf_calc['nb_total_arretes'] - gdf_calc['nb_total_arretes_recon'])/gdf_calc['nb_total_arretes']
    # gdf_calc['part_arretes_non_reco'] = gdf_calc['part_arretes_non_reco'].fillna(0)
    gdf_calc_assurance  = gdf_calc.copy()

    gdf_calc_assurance['evolution_prime_assurance_clip_log'] = np.log1p(gdf_calc_assurance['evolution_prime_assurance'].clip(0))

    gdf_calc_assurance['evolution_prime_assurance_clip_log_standard'] = clip_minmax(gdf_calc_assurance['evolution_prime_assurance_clip_log'],q_low = 0.05,q_high=0.95)

    gdf_calc_assurance['part_prime_budget_standard'] = clip_minmax(gdf_calc_assurance['part_prime_budget'],q_low = 0.5,q_high=0.95)


    gdf_calc_assurance['score_assurance'] = np.sqrt(
        pep * gdf_calc_assurance['evolution_prime_assurance_clip_log_standard']**2 +
         ppb* gdf_calc_assurance['part_prime_budget_standard']**2
        + pna * gdf_calc_assurance['part_arretes_non_reconnus'].fillna(1)**2)

    gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(1)
    gdf_calc_assurance['score_assurance'] += (
         pf*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))

    gdf_calc_assurance['score_assurance_min_max'] = (gdf_calc_assurance['score_assurance'])/(gdf_calc_assurance['score_assurance'].max())
    return (gdf_calc_assurance,)


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance_int'] = (gdf_calc_assurance['score_assurance_min_max']*5).astype('Int64').clip(0,4)
    gdf_calc_assurance['score_assurance_1d'] = (gdf_calc_assurance['score_assurance_min_max']*5).round(1)

    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance_int'].value_counts()
    return


@app.cell
def _(carte_discret, gdf_calc_assurance):
    carte_discret(gdf_calc_assurance, 'score_assurance_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score Economique
    """)
    return


@app.cell
def _(mo):
    poids_prevention_dettes = mo.ui.slider(0, 1, step=0.1,value=0.5)
    return (poids_prevention_dettes,)


@app.cell
def _(gdf_calc_assurance, np, poids_prevention_dettes):
    poids_prevention_dettes

    dette = poids_prevention_dettes.value
    dep = 1 - dette

    gdf_calc_eco = gdf_calc_assurance.copy()

    gdf_calc_eco['depenses_per_pop'] = gdf_calc_eco['depenses_per_pop'].replace(np.inf,np.nan)

    gdf_calc_eco['ratio_dettes_depenses_neg'] = clip_minmax(- gdf_calc_eco['ratio_dettes_depenses'],q_low = 0.05,q_high=0.95)

    x = - gdf_calc_eco['ratio_dettes_depenses']

    xmin = 1
    xmax = x.quantile(0.9)

    gdf_calc_eco['debt_vuln'] = ((x - xmin) / (xmax - xmin))
    gdf_calc_eco['debt_vuln'] = gdf_calc_eco['debt_vuln'].clip(0,1)


    gdf_calc_eco['budget_vuln'] =np.log1p(gdf_calc_eco['depenses_per_pop'])
    gdf_calc_eco['budget_vuln_clipmax'] = 1-((gdf_calc_eco['budget_vuln']-np.log1p(gdf_calc_eco['depenses_per_pop'].min()))/(np.log1p(1000)-np.log1p(gdf_calc_eco['depenses_per_pop'].min())))
    gdf_calc_eco['budget_vuln_clipmax'] = gdf_calc_eco['budget_vuln_clipmax'].clip(0,1)



    # gdf_calc_eco['depenses_per_pop_log'] = -np.log1p(gdf_calc_eco['depenses_per_pop'])
    # # gdf_calc_eco['depenses_per_pop_log']  = 1/(gdf_calc_eco['depenses_per_pop'] +0.01)
    # gdf_calc_eco['depenses_per_pop_log_clip_high']  = clip_minmax(gdf_calc_eco['depenses_per_pop_log'] , 0.05, 0.95)


    gdf_calc_eco['score_eco'] = np.sqrt(
        0.5 * gdf_calc_eco['ratio_dettes_depenses_neg']**2 +
         0.5* gdf_calc_eco['budget_vuln_clipmax']**2
    )

    gdf_calc_eco['score_eco_minmax'] = gdf_calc_eco['score_eco']/gdf_calc_eco['score_eco'].max()
    return (gdf_calc_eco,)


@app.cell
def _(gdf_calc_eco, np):
    gdf_calc_eco['score_eco_int'] = np.floor(gdf_calc_eco['score_eco_minmax'] * 5).clip(0, 4).astype('Int64')
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco_1d'] = (gdf_calc_eco['score_eco_minmax']*5).round(1)
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco_int'].value_counts()
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco_minmax'].hist()
    return


@app.cell
def _(carte_discret, gdf_calc_eco):
    carte_discret(gdf_calc_eco, 'score_eco_int')
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Score Final
    """)
    return


@app.cell
def _(mo):
    poids_prevention_eco = mo.ui.slider(0, 1, step=0.05,value=0.15)
    poids_prevention_assurance = mo.ui.slider(0, 1, step=0.05,value=0.3)
    return poids_prevention_assurance, poids_prevention_eco


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_assurance_min_max'].var(),gdf_calc_eco['score_exposition'].var()
    return


@app.cell
def _(mo, poids_prevention_assurance, poids_prevention_eco, ppexpo):
    mo.hstack([poids_prevention_eco, poids_prevention_assurance, ppexpo])

    return


@app.cell
def _(gdf_calc_eco, poids_prevention_assurance, poids_prevention_eco):
    ppeco = poids_prevention_eco.value
    ppa = poids_prevention_assurance.value
    ppexpo = 1 - ppeco - ppa

    gdf_calc_eco['final'] = (ppeco*gdf_calc_eco['score_eco_minmax']**2+ppa*gdf_calc_eco['score_assurance_min_max']**2+ppexpo*gdf_calc_eco['score_exposition']**2)**(1/2)


    gdf_calc_eco['final_min_max'] = (gdf_calc_eco['final']-gdf_calc_eco['final'].min())/(gdf_calc_eco['final'].max()-gdf_calc_eco['final'].min())
    gdf_calc_eco['final_min_max']  = clip_minmax(gdf_calc_eco['final_min_max'] ,q_low = 0.05,q_high=1)
    return (ppexpo,)


@app.cell
def _(gdf_calc_eco, np):
    gdf_calc_eco['score_final_int'] = np.floor(gdf_calc_eco['final_min_max'] * 5).clip(0, 4).astype('Int64')

    gdf_calc_eco['score_final_1d'] = (gdf_calc_eco['final_min_max']*5).round(1)
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['final_min_max'].hist()
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_final_int'].value_counts()
    return


@app.cell
def _(carte_discret, gdf_calc_eco):
    carte_discret(gdf_calc_eco, 'score_final_int')
    return


@app.cell
def _(pd):
    sv = pd.read_parquet('Score_vulnerabilite_s3.parquet')
    return (sv,)


@app.cell
def _(sv):
    sv_= sv.rename({'indice_vulnerabilite_niveau':'indice_vulnerabilite_niveau_old'},axis=1)
    return (sv_,)


@app.cell
def _(GDF_, sv_):
    INDICES = GDF_.merge(sv_[['code_insee','indice_vulnerabilite_niveau_old']],on='code_insee')
    return (INDICES,)


@app.cell
def _(INDICES):
    INDICES.to_parquet('Score_vulnerabilite.parquet')
    return


@app.cell
def _(GDF):
    GDF_ = GDF.rename({'score_eco_1d':'score_economique','score_assurance_1d':'score_assurance','score_exposition_1d':'score_exposition','score_final_1d':'indice_vulnerabilite_niveau'},axis=1)
    return (GDF_,)


@app.cell
def _(gdf_calc_eco):
    GDF = gdf_calc_eco[['code_insee','departement','region','geo_point_2_d','code_departement','code_region','nom_commune','score_eco_1d','score_assurance_1d','score_exposition_1d','score_final_1d']]
    return (GDF,)


@app.cell
def _(con):
    con.execute("""
    COPY (
        SELECT * FROM resultats_website_par_commune
    )
    TO 'indice_temporaire.parquet'
    (FORMAT PARQUET);
    """)
    return


if __name__ == "__main__":
    app.run()
