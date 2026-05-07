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

    return (
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
def _(pd):
    Sv = pd.read_parquet('Score_vulnerabilite_s3.parquet')
    return (Sv,)


@app.cell
def _(Sv):
    Sv.loc[Sv['nom_commune']=='Rigny-la-Nonneuse']
    return


@app.cell
def _(Sv):
    Sv.loc[Sv['code_insee']=='10146']
    return


@app.cell
def _(duckdb, wkt):
    PCC_DUCKDB_FILE = "data/dbt_pipeline/dev.duckdb"
    con = duckdb.connect(database=PCC_DUCKDB_FILE, read_only=True)

    resultats_website_par_commune = con.sql("""SELECT	* FROM dev.main.resultats_website_par_commune""").df()

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
    gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec","nb_total_arretes_autre"]] = gdf[["nb_total_arretes_recon",
    "nb_total_arretes",
    "nb_total_arretes_ino",
    "nb_total_arretes_sec","nb_total_arretes_autre"]].fillna(0)
    return


@app.cell
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


@app.cell
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


@app.cell
def _(mo):
    poids_prevention = mo.ui.slider(0, 1, step=0.1,value=0.2)
    return


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
           'score_climatique_global','score_climatique_global_norm'
    ]

    col_selector_score_expo = mo.ui.dropdown(
        options=colonnes_score_expo,
        value=colonnes_score_expo[0],
        label="Choisis la colonne"
    )
    return


@app.cell
def _(col_selector_secheresse):
    col_selector_secheresse
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

    # w1, w2 = pca_sec.explained_variance_ratio_
    scores = pca_sec.transform(X_sec_scaled)
    # score_unique = w1 * scores[:,0] + w2 * scores[:,1]

    metropole_datas['score_secheresse'] = scores
    return metropole_datas, pca_sec


@app.cell
def _(metropole_datas, pca_sec, pd):
    selected_cols_ = ['swi_04_d_abs', 'nb_total_arretes_sec', 'indicateur_rga']

    # 1. Ajouter le décile du score
    metropole_datas['decile_secheresse'] = pd.qcut(
        metropole_datas['score_secheresse'],
        q=10,
        labels=[f'D{i}' for i in range(1, 11)]
    )

    # 2. Profiling : moyenne des variables originales par décile
    profil = metropole_datas.groupby('decile_secheresse')[selected_cols_].mean()

    # 3. Ajouter les loadings PCA pour référence
    loadings = pd.Series(
        pca_sec.components_[0],
        index=selected_cols_,
        name='loading_PC1'
    )
    print(loadings)
    print(profil)
    return


@app.cell
def _():
    return


@app.cell
def _(PCA, StandardScaler, col_selector_inondation, gdf):
    selected_cols_inondation = col_selector_inondation.value
    datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))]
    datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)
    # scaler_ino = MinMaxScaler()


    # num_std = [c for c in ['rr_50_d_abs','pxcwd_abs','swi_04_d_abs','tx_35_d_abs'] if c in selected_cols_inondation]

    # num_robust = [c for c in ['nb_total_arretes_reco','nb_total_arretes_ino','nb_total_arretes_sec'] if c in selected_cols_inondation]

    # passthrough = [c for c in ['indicateur_rga','indicateur_tri'] if c in selected_cols_inondation]

    # preprocessor = ColumnTransformer(
    #     transformers=[
    #         ("std", StandardScaler(), num_std),
    #         ("robust", StandardScaler(), num_robust),
    #         ("pass",  StandardScaler(), passthrough)
    #     ]
    # )

    # preprocessor = ColumnTransformer(
    #     transformers=[
    #         ("std", StandardScaler(), ['rr_50_d_abs']),
    #         ("robust", RobustScaler(), ['nb_total_arretes_ino']),
    #         ("passthrough", 'passthrough', ['indicateur_tri'])
    #     ]
    # )
    scaler_ino = StandardScaler()
    # X_ino_scaled = preprocessor.fit_transform(datas_inondation[selected_cols_inondation])
    X_ino_scaled = scaler_ino.fit_transform(datas_inondation[selected_cols_inondation])


    pca_ino = PCA(n_components=2)
    pca_ino.fit(X_ino_scaled)

    # print(pca_sec.explained_variance_ratio_)
    # print(f"Total : {pca_sec.explained_variance_ratio_.sum():.1%}")

    w1_ino, w2_ino = pca_ino.explained_variance_ratio_
    scores_ino = pca_ino.transform(X_ino_scaled)
    score_unique_ino = w1_ino * scores_ino[:,0] + w2_ino * scores_ino[:,1]

    datas_inondation['score_inondation'] = score_unique_ino
    return datas_inondation, selected_cols_inondation


@app.cell
def _(datas_inondation, pca_sec, pd):
    selected_cols_ino = ['rr_50_d_abs', 'nb_total_arretes_ino',"indicateur_tri"]

    # 1. Ajouter le décile du score
    datas_inondation['decile_inon'] = pd.qcut(
        datas_inondation['score_inondation'],
        q=10,
        labels=[f'D{i}' for i in range(1, 11)]
    )

    # 2. Profiling : moyenne des variables originales par décile
    profil_ino = datas_inondation.groupby('decile_inon')[selected_cols_ino].mean()

    # 3. Ajouter les loadings PCA pour référence
    loadings_ino = pd.Series(
        pca_sec.components_[0],
        index=selected_cols_ino,
        name='loading_PC1'
    )
    print(loadings_ino)
    print(profil_ino)
    return


@app.cell
def _():
    # def clip_minmax(series, lower=5, upper=99):
    #     p_low  = series.quantile(lower / 100)
    #     p_high = series.quantile(upper / 100)
    #     clipped = series.clip(lower=p_low, upper=p_high)
    #     return (clipped - clipped.min()) / (clipped.max() - clipped.min())
    return


@app.cell
def _():
    # gdf_calc = gdf.copy()

    # gdf_calc.loc[metropole_datas.index, "score_secheresse"] = metropole_datas["score_secheresse"]

    # gdf_calc.loc[datas_inondation.index, "score_inondation"] = datas_inondation["score_inondation"].values

    # gdf_calc['score_secheresse_norm'] = clip_minmax(gdf_calc['score_secheresse'])
    # gdf_calc['score_inondation_norm'] = clip_minmax(gdf_calc['score_inondation'])

    # gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_total_arretes_autre'])
    # # scaler_sec_robust = StandardScaler()
    # # scaler_ino_robust = StandardScaler()

    # # sec = scaler_sec_robust.fit_transform(gdf_calc[['score_secheresse']])
    # # ino = scaler_ino_robust.fit_transform(gdf_calc[['score_inondation']])

    # # gdf_calc['score_secheresse_norm'] = MinMaxScaler().fit_transform(sec)
    # # gdf_calc['score_inondation_norm'] = MinMaxScaler().fit_transform(ino)

    # p = poids_prevention.value

    # gdf_calc['score_secheresse_net'] = (gdf_calc['score_secheresse_norm'] - p * gdf_calc['pprn_rga']).clip(lower=0)
    # gdf_calc['score_inondation_net'] = (gdf_calc['score_inondation_norm'] - p * gdf_calc['pprn_ino']).clip(lower=0)

    # gdf_calc['score_climatique_global'] = gdf_calc[
    #     ['score_secheresse_net','score_inondation_net']
    # ].mean(axis=1)*0.9+0.1*gdf_calc['score_autres']

    # gdf_calc['score_climatique_global_norm'] = clip_minmax(gdf_calc['score_climatique_global'])
    return


@app.cell
def _(gdf_calc, mo):
    col_selector_distrib = mo.ui.multiselect(
        options=list(gdf_calc.select_dtypes(include='number').columns),
        value=['score_secheresse', 'score_inondation','part_prime_budget','evolution_prime_assurance','nb_total_arretes_autre','score_climatique_global','swi_04_d_abs', 'nb_total_arretes_sec',"indicateur_rga"],
        label='Colonnes à visualiser'
    )
    col_selector_distrib
    return (col_selector_distrib,)


@app.cell
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc,
        columns=['swi_04_d_abs', 'nb_total_arretes_sec',"indicateur_rga",'score_secheresse'],
        clip_quantiles=(0.05, 0.99),
        show_log=True,
    )
    return


@app.cell
def _(gdf_calc):
    gdf_calc["indicateur_tri"]
    return


@app.cell
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc.loc[gdf_calc['indicateur_tri']>0.0],
        columns=["indicateur_tri"],
        clip_quantiles=(0.05, 0.99),
        show_log=False,
    )
    return


@app.cell
def _():
    return


@app.cell
def _(col_selector_distrib, gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(gdf_calc, col_selector_distrib.value)

    # Avec quantiles custom et log
    plot_normalization_comparison(
        gdf_calc,
        columns=['score_secheresse', 'score_inondation'],
        clip_quantiles=(0.05, 0.99),
        show_log=True,
    )
    return


@app.cell
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc,
        columns=['score_secheresse', 'score_inondation'],
        clip_quantiles=(0.01, 0.99),
        show_log=True,
    )
    return


@app.cell
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
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc,
        columns=['score_inondation','rr_50_d_abs', 'nb_total_arretes_ino','indicateur_tri'],
        clip_quantiles=(0.05, 0.99),
        show_log=True,
        overlays={
            'indicateur_tri == 0':  gdf_calc.loc[gdf_calc['indicateur_tri'] == 0],
            # 'rr_50_d_abs > 2': gdf_calc.loc[gdf_calc['rr_50_d_abs'] > 2],
                    'nb_total_arretes_ino > 8': gdf_calc.loc[gdf_calc['nb_total_arretes_ino'] > 8],

        }
    )
    return


@app.function
def clip_minmax(s,q_low,q_high):
    lo, hi = s.quantile(q_low), s.quantile(q_high)
    return (s.clip(lo, hi) - lo) / (hi - lo)


@app.cell
def _(gdf_calc):
    gdf_calc
    return


@app.cell
def _(datas_inondation, gdf, metropole_datas, np):
    gdf_calc = gdf.copy()
    gdf_calc.loc[metropole_datas.index, "score_secheresse"] = metropole_datas["score_secheresse"]

    gdf_calc.loc[datas_inondation.index, "score_inondation"] = datas_inondation["score_inondation"].values


    gdf_calc['s_norm']  = clip_minmax(gdf_calc['score_secheresse'], q_low=0.5, q_high=0.95)
    gdf_calc['i_norm']  = clip_minmax(gdf_calc['score_inondation'],  q_low=0.5, q_high=0.95)

    gdf_calc['score_secheresse_net'] = (gdf_calc['s_norm'] - 0.2 * gdf_calc['pprn_rga']).clip(lower=0)
    gdf_calc['score_inondation_net'] = (gdf_calc['i_norm'] - 0.2 * gdf_calc['pprn_ino']).clip(lower=0)
    gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_total_arretes_autre'], q_low=0, q_high=1)

    score = np.sqrt(0.45*gdf_calc['score_secheresse_net'] **2 + 0.45*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2)

    gdf_calc['score_global_lp'] = score.fillna(
        gdf_calc['score_secheresse_net'].fillna(np.sqrt(0.9*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2))
    )

    # gdf_calc['score_global_lp'] = ((s_norm**2 + i_norm**2))**(1/2)
    # gdf_calc['score_global_somme'] = ((s_norm + i_norm)/2)

    # Puis moyenne géométrique retournée
    # s_inv = 1 - s_norm
    # i_inv = 1 - i_norm
    # gdf_calc['score_global'] = 1 - np.sqrt(s_inv * i_inv)
    return (gdf_calc,)


@app.cell
def _(gdf_calc):
    gdf_calc['s_norm'].var(),gdf_calc['s_norm'].mean()
    return


@app.cell
def _(gdf_calc):

    gdf_calc['i_norm'].var(),gdf_calc['i_norm'].mean()
    return


@app.cell
def _():
    # gdf_calc['score_climatique_global'] = gdf_calc[
    #     ['score_secheresse_net','score_inondation_net']
    # ].mean(axis=1)*0.9+0.1*gdf_calc['score_autres']

    # gdf_calc['score_climatique_global_norm'] = clip_minmax(gdf_calc['score_climatique_global'])

    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_exposition'] = gdf_calc['score_global_lp']/(gdf_calc['score_global_lp'].max())
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_exposition'].hist()
    return


@app.cell
def _(gdf_calc, pd):
    gdf_calc['score_global_lp_discret'] = pd.cut(gdf_calc['score_exposition'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_global_lp_discret'].value_counts()
    return


@app.cell
def _(gdf_calc, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc,
        columns=['score_secheresse', 'score_inondation','s_norm','i_norm','score_exposition','score_global_lp'],
        clip_quantiles=(0.05, 0.95),
        show_log=True,
    )
    return


@app.cell
def _(carte_discret, gdf_calc):
    carte_discret(gdf_calc, 'score_global_lp_discret')
    return


@app.cell
def _(carte_continue, gdf_calc):
    carte_continue(gdf_calc, 'score_exposition')
    return


@app.cell
def _():
    return


@app.cell
def _(np):
    bins = [0, 0.2, 0.4, 0.6, 0.8, 1]
    labels = [0, 1, 2, 3, 4]

    def interpolate_score(x):
        for i in range(len(bins)-1):
            if bins[i] <= x <= bins[i+1]:
                # interpolation linéaire dans l’intervalle
                ratio = (x - bins[i]) / (bins[i+1] - bins[i])
                return labels[i] + ratio
        return np.nan

    # gdf_calc['score_vuln_continu'] = gdf_calc['score_global_lp'].apply(interpolate_score).round(1)
    return


@app.cell
def _(gdf_calc, pd):
    gdf_calc['score_global_lp_discret'] = pd.cut(gdf_calc['score_global_lp'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)
    gdf_calc['score_global_somme_discret'] = pd.cut(gdf_calc['score_global_somme'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_global_somme_discret'].value_counts()
    return


@app.cell
def _(gdf_calc):
    gdf_calc['score_global_lp_discret'].value_counts()
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
    gdf_calc_assurance['evolution_prime_assurance_clipped_norm'] = clip_minmax(gdf_calc_assurance['evolution_prime_assurance'],q_low = 0.0,q_high=0.95)

    gdf_calc_assurance['part_prime_budget_clipped_norm'] = clip_minmax(gdf_calc_assurance['part_prime_budget'],q_low = 0.05,q_high=0.95)


    gdf_calc_assurance['score_assurance'] = (
        pep * gdf_calc_assurance['evolution_prime_assurance_clipped_norm'] +
         ppb* gdf_calc_assurance['part_prime_budget_clipped_norm']
        + pna * gdf_calc_assurance['part_arretes_non_reco'])
    gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(1)
    gdf_calc_assurance['score_assurance'] += (
         pf*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))


    # gdf_calc_assurance['score_assurance_norm'] = clip_minmax(gdf_calc_assurance['score_assurance'],lower=5,upper=99)
    return gdf_calc_assurance, pep, pf, pna, ppb


@app.cell
def _():
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['evolution_prime_assurance'].max(),gdf_calc_assurance['evolution_prime_assurance'].min()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['evolution_prime_assurance_clip']=1 + gdf_calc_assurance['evolution_prime_assurance'].clip(0)
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance.loc[gdf_calc_assurance['evolution_prime_assurance']>0.0]['evolution_prime_assurance'].hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance, np):
    gdf_calc_assurance['evolution_prime_assurance_clip_log'] = np.log1p(gdf_calc_assurance['evolution_prime_assurance'].clip(0))

    gdf_calc_assurance['evolution_prime_assurance_clip_log_'] = np.log1p(gdf_calc_assurance['evolution_prime_assurance_clip']-gdf_calc_assurance['evolution_prime_assurance'].min())

    return


@app.cell
def _(gdf_calc_assurance):
    (gdf_calc_assurance['evolution_prime_assurance_clip']-gdf_calc_assurance['evolution_prime_assurance'].min()).hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['evolution_prime_assurance'].min()
    return


@app.cell
def _(gdf_calc_assurance, np):
    np.log(gdf_calc_assurance['evolution_prime_assurance_clip']).hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['evolution_prime_assurance_clip_log'].hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance, np):

    np.log(
        gdf_calc_assurance.loc[
            :,
            'evolution_prime_assurance_clip'
        ]
    ).hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance, pep, pna, ppb):
    gdf_calc_assurance['score_assurance'] = (
        pep * gdf_calc_assurance['evolution_prime_assurance_clip_log'] +
         ppb* gdf_calc_assurance['part_prime_budget']
        + pna * gdf_calc_assurance['part_arretes_non_reco'])



    return


@app.cell
def _(gdf_calc_assurance, pf):
    gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(1)
    gdf_calc_assurance['score_assurance'] += (
         pf*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))
    return


@app.cell
def _(MinMaxScaler, gdf_calc_assurance):
    MinMaxScaler().fit_transform(gdf_calc_assurance[['part_arretes_non_reco']])
    return


@app.cell
def _(MinMaxScaler, gdf_calc_assurance):
    MinMaxScaler().fit_transform(gdf_calc_assurance[['evolution_prime_assurance_clip_log']])
    return


@app.cell
def _(MinMaxScaler, gdf_calc_assurance):
    MinMaxScaler().fit_transform(gdf_calc_assurance[['part_prime_budget']])
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc_assurance):
    mask = gdf_calc_assurance['evolution_prime_assurance'] < 0.0005

    nb = mask.sum()
    prop = mask.mean()

    nb, prop
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance.loc[
        gdf_calc_assurance['evolution_prime_assurance'] < 0.0005
    ]
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['part_prime_budget']*100
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['part_prime_budget'].mean(), gdf_calc_assurance['part_prime_budget'].median()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['part_prime_budget'].min()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance.loc[gdf_calc_assurance['part_prime_budget']<0]
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['part_prime_budget'].hist(bins=100)
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['part_prime_budget'].median(),gdf_calc_assurance['part_prime_budget'].mean(),gdf_calc_assurance['part_prime_budget'].var()
    return


@app.cell
def _(gdf_calc_assurance, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc_assurance,
        columns=['evolution_prime_assurance', 'part_prime_budget','part_arretes_non_reco','evolution_prime_assurance_clip_log','evolution_prime_assurance_clip_log_'],
        clip_quantiles=(0.0, 0.95),
        show_log=False,
    overlays={
            'evolution_prime_assurance > 0':  gdf_calc_assurance.loc[gdf_calc_assurance['evolution_prime_assurance'] < 0],
        }
    )
    return


@app.cell
def _(gdf_calc_assurance, np):
    gdf_calc_assurance['evolution_prime_assurance_clip_log_standard'] = clip_minmax(gdf_calc_assurance['evolution_prime_assurance_clip_log'],q_low = 0.0,q_high=0.95)

    gdf_calc_assurance['part_prime_budget_standard'] = clip_minmax(gdf_calc_assurance['part_prime_budget'],q_low = 0.0,q_high=0.95)


    gdf_calc_assurance['score_assurance'] = np.sqrt(
        0.4 * gdf_calc_assurance['evolution_prime_assurance_clip_log_standard']**2 +
         0.3* gdf_calc_assurance['part_prime_budget']**2
        + 0.3 * gdf_calc_assurance['part_arretes_non_reco']**2)

    gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(1)
    gdf_calc_assurance['score_assurance'] += (
         0.2*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))

    gdf_calc_assurance['score_assurance_min_max'] = (gdf_calc_assurance['score_assurance'])/(gdf_calc_assurance['score_assurance'].max())
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance'].mean()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance'].hist()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance_min_max'].hist()
    return


@app.cell
def _(gdf_calc_assurance, pd):
    gdf_calc_assurance['score_assurance_min_max_discret'] = pd.cut(gdf_calc_assurance['score_assurance_min_max'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)

    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance['score_assurance_min_max_discret'].value_counts()
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance.loc[gdf_calc_assurance['score_assurance_min_max_discret']>1].shape
    return


@app.cell
def _(gdf_calc_assurance):
    gdf_calc_assurance.loc[gdf_calc_assurance['score_assurance_min_max_discret']>1].shape
    return


@app.cell
def _(carte_discret, gdf_calc_assurance):
    carte_discret(gdf_calc_assurance, 'score_assurance_min_max_discret')
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

    gdf_calc_eco['ratio_dettes_depenses_neg'] = clip_minmax(- gdf_calc_eco['ratio_dettes_depenses'],q_low = 0.01,q_high=0.99)

    gdf_calc_eco['depenses_per_pop_log'] = np.log1p(gdf_calc_eco['depenses_per_pop']-gdf_calc_eco['depenses_per_pop'].min())

    gdf_calc_eco['depenses_per_pop_log_clip_high'] = 1- clip_minmax(gdf_calc_eco['depenses_per_pop_log'],q_low = 0.01,q_high=0.734) 


    # gdf_calc_eco['depenses_per_pop_clipped_norm'] = clip_minmax(gdf_calc_eco['depenses_per_pop'],lower=1,upper=90)

    # gdf_calc_eco['ratio_dettes_depenses_clipped_norm'] = clip_minmax(gdf_calc_eco['ratio_dettes_depenses_neg'],lower=1,upper=95)


    # gdf_calc_eco['depenses_per_pop_norm'] = 1 - gdf_calc_eco['depenses_per_pop_clipped_norm']
    # # gdf_calc_eco['ratio_dettes_depenses_norm'] = 1 - gdf_calc_eco['ratio_dettes_depenses_clipped_norm']

    # # dette = poids_prevention_dettes.value
    # # dep = 1 - dette

    gdf_calc_eco['score_eco'] = np.sqrt(
        0.5 * gdf_calc_eco['ratio_dettes_depenses_neg']**2 +
         0.5* gdf_calc_eco['depenses_per_pop_log_clip_high']**2
    )

    # gdf_calc_eco['score_eco_norm'] = clip_minmax(gdf_calc_eco['score_eco'],lower=5,upper=99)
    return (gdf_calc_eco,)


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco'].hist()
    return


@app.cell
def _(gdf_calc_eco, pd):
    gdf_calc_eco['score_eco_discret'] = pd.cut(gdf_calc_eco['score_eco'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)

    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco_discret'].value_counts()
    return


@app.cell
def _(gdf_calc_eco, np):
    gdf_calc_eco['depenses_per_pop_log'] = np.log1p(gdf_calc_eco['depenses_per_pop']-gdf_calc_eco['depenses_per_pop'].min())

    gdf_calc_eco['depenses_per_pop_log_clip_high'] = 1- clip_minmax(gdf_calc_eco['depenses_per_pop_log'],q_low = 0.01,q_high=0.95) 

    gdf_calc_eco['depenses_per_pop_log_clip_high'] = 1- clip_minmax(gdf_calc_eco['depenses_per_pop_log'],q_low = 0.01,q_high=0.95) 
    return


@app.cell
def _(gdf_calc_eco, plot_normalization_comparison):
    plot_normalization_comparison(
        gdf_calc_eco,
        columns=['depenses_per_pop','depenses_per_pop_log_clip_high', 'ratio_dettes_depenses_neg','ratio_dettes_depenses','depenses_per_pop_log'],
        clip_quantiles=(0.05, 0.95),
        show_log=True,
    )
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['depenses_per_pop'].median()
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['depenses_per_pop'].min(),gdf_calc_eco['depenses_per_pop'].max()
    return


@app.cell
def _(gdf_calc_eco, np):
    np.log1p(2000-gdf_calc_eco['depenses_per_pop'].min())
    return


@app.cell
def _(gdf_calc_eco, np):
    np.log1p(gdf_calc_eco['depenses_per_pop']-gdf_calc_eco['depenses_per_pop'].min()).hist(bins=1000)
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['depenses_per_pop']
    return


@app.cell
def _(df):
    1- 3079 / len(df)
    return


@app.cell
def _(df):
    df.loc[df['depenses_per_pop']>1500]
    return


@app.cell
def _(gdf_calc_eco, pd):
    df = gdf_calc_eco.copy()

    df['decile'] = pd.qcut(
        df['depenses_per_pop'],
        30,  # 10 déciles
        labels=False
    )

    df.groupby('decile')['depenses_per_pop'].mean()
    return (df,)


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco.columns
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco[['score_eco','score_assurance_min_max','score_global_lp']]
    return


@app.cell
def _(gdf_calc_eco, np):
    gdf_calc_eco['final'] = np.sqrt(0.15*gdf_calc_eco['score_eco']**2+0.45*gdf_calc_eco['score_assurance_min_max']**2+0.4*gdf_calc_eco['score_global_lp']**2)

    # gdf_calc_eco['final'] = 0.2*gdf_calc_eco['score_eco']+0.4*gdf_calc_eco['score_assurance_min_max']+0.4*gdf_calc_eco['score_global_lp']
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['final_min_max'] = (gdf_calc_eco['final']-gdf_calc_eco['final'].min())/(gdf_calc_eco['final'].max()-gdf_calc_eco['final'].min())
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['final'].hist()
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['final_min_max'].hist()
    return


@app.cell
def _(gdf_calc_eco, pd):
    gdf_calc_eco['score_final_discret'] = pd.cut(gdf_calc_eco['final_min_max'], bins=[0, 0.2, 0.4, 0.6, 0.8, 1],labels=[0, 1, 2, 3, 4], include_lowest=True)

    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_final_discret'].value_counts()
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco.loc[gdf_calc_eco['code_insee'].str.startswith('97')]
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
