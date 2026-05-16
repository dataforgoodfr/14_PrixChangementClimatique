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
    import seaborn as sns
    import matplotlib.colors as mcolors


    return MinMaxScaler, duckdb, gpd, mo, np, pd, plt, stats, wkt


@app.cell
def _(duckdb, wkt):
    PCC_DUCKDB_FILE = "data/exploration/dev.duckdb"
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

    return


@app.cell
def _():
    # def plot_depenses_vuln(gdf, colonne, score_col=None, clip_min=-1, clip_max=3000, seuil_norm=1000, quantiles=[0.2, 0.75], log_trace=False):
    #     if score_col:
    #         mask = gdf[colonne].notna() & gdf[score_col].notna()
    #         data_raw = gdf.loc[mask, colonne].values
    #         score_data = gdf.loc[mask, score_col].values
    #     else:
    #         data_raw = gdf[colonne].dropna().values
    #         score_data = None

    #     data_clipped = np.clip(data_raw, clip_min, clip_max)

    #     if log_trace:
    #         data_log = np.log1p(np.clip(data_raw, 0, clip_max))
    #         log_val = np.log1p(gdf[colonne])
    #         log_min = np.log1p(gdf[colonne].min())
    #         #np.log1p(gdf[colonne].quantile(0.01))
    #         log_seuil = np.log1p(seuil_norm)
    #         if score_col:
    #             data_vuln_series = (1 - (log_val - log_min) / (log_seuil - log_min))
    #             data_vuln = data_vuln_series[mask].values.clip(0, 1)
    #         else:
    #             data_vuln = (1 - (log_val - log_min) / (log_seuil - log_min)).dropna().values.clip(0, 1)

    #     quantile_colors = ['steelblue', 'purple', 'brown', 'pink']
    #     score_colors = {0: '#2ecc71', 1: '#a8d44b', 2: '#f1c40f', 3: '#e67e22', 4: '#e74c3c'}

    #     def plot_hist(ax, data, title, score_data=None):
    #         bins = 50
    #         edges = np.histogram_bin_edges(data, bins=bins)
    #         bin_indices = np.clip(np.digitize(data, edges[:-1]) - 1, 0, bins - 1)
    #         bin_width = edges[1:] - edges[:-1]
    #         if score_data is not None:
    #             bottom = np.zeros(bins)
    #             for s in sorted(score_colors.keys()):
    #                 counts = np.array([np.sum((bin_indices == i) & (score_data == s)) for i in range(bins)])
    #                 ax.bar(edges[:-1], counts, width=bin_width, bottom=bottom,
    #                        color=score_colors[s], edgecolor='white', alpha=0.9, align='edge', label=f'score {s}')
    #                 bottom += counts
    #         else:
    #             counts, _ = np.histogram(data, bins=edges)
    #             ax.bar(edges[:-1], counts, width=bin_width,
    #                    color='lightsteelblue', edgecolor='white', alpha=0.8, align='edge')
    #         ax.axvline(np.median(data), color='orange', linewidth=2, label=f'Médiane ({np.median(data):.2f})')
    #         ax.axvline(np.mean(data), color='red', linewidth=2, linestyle='--', label=f'Moyenne ({np.mean(data):.2f})')
    #         for q, color in zip(quantiles, quantile_colors):
    #             val = np.quantile(data, q)
    #             ax.axvline(val, color=color, linewidth=2, linestyle=':', label=f'Quantile {int(q*100)}% ({val:.2f})')
    #         ax.set_title(title)
    #         ax.set_ylabel("Fréquence")
    #         ax.legend(fontsize=8, ncol=2)
    #         ax.set_ylim((0,2000))


    #     n_plots = 3 if log_trace else 1
    #     fig, axes = plt.subplots(n_plots, 1, figsize=(11, 4 * n_plots))
    #     if n_plots == 1:
    #         axes = [axes]  
    # # — brut clippé [{clip_min}, {clip_max}]
    #     plot_hist(axes[0], data_clipped, f"{colonne} ", score_data)
    #     if log_trace:
    #         plot_hist(axes[1], data_log, f"{colonne} — log", score_data)
    #         plot_hist(axes[2], data_vuln, f"{colonne} — score vulnérabilité normalisé (seuil={seuil_norm})", score_data)

    #     plt.tight_layout()
    #     plt.show()
    return


@app.cell
def _(np, plt):
    def plot_variable(df, colonne_variable,colonne_var_stand,score_color, scores_ref):
        if score_color:
            df[score_color] = df[score_color].fillna(-1)
        score_colors = {-1:'#A9A9A9',0: '#2ecc71', 1: '#a8d44b', 2: '#f1c40f', 3: '#e67e22', 4: '#e74c3c'}
    
        fig, ax = plt.subplots(figsize=(12, 6))
        mask = df[[colonne_variable, colonne_var_stand]].dropna().index
        data_stand = df.loc[mask, colonne_var_stand]
        data_brut  = df.loc[mask, colonne_variable]  
    
        if score_color is not None:
            score_data = df.loc[mask, score_color].fillna(-1).astype(int)
            counts_total, edges = np.histogram(data_stand, bins=50)
            bin_width = edges[1] - edges[0]
            bin_indices = np.digitize(data_stand, edges[:-1]) - 1
            bin_indices = np.clip(bin_indices, 0, 49)

            bottom = np.zeros(50)
            for s in sorted(score_colors.keys()):
                counts = np.array([
                    np.sum((bin_indices == i) & (score_data == s))
                    for i in range(50)
                ])
                ax.bar(edges[:-1], counts, width=bin_width, bottom=bottom,
                       color=score_colors[s], edgecolor='white', alpha=0.9,
                       align='edge', label=f'score {s}')
                bottom += counts
        else:
            ax.hist(data_stand , bins=50, color='lightsteelblue', edgecolor='white', alpha=0.8)
        # ax_dettes.axvline(0.9, color='red',    linestyle='--', linewidth=2, label=f'score 0.9')
        # ax_dettes.axvline(0.1, color='green',  linestyle='--', linewidth=2, label=f'score 0.1')
        ax.axvline(data_stand.median(), color='orange', linewidth=2, label=f'Médiane indice ({data_stand .median():.2f})')
        ax.axvline(np.mean(data_stand), color='red', linewidth=2, linestyle='--', label='Moyenne' )
        ax.set_xlabel("Indice")
        ax.set_ylabel("Fréquence")
        ax.set_title(f"Distribution de l'indice {colonne_variable}")
        ax.legend(fontsize=8)
        ax.set_ylim((0,8000))
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
def _(MinMaxScaler, col_selector_secheresse, gdf, np):
    selected_cols = col_selector_secheresse.value  
    # doit contenir ['swi_04_d_abs', 'indicateur_rga', 'nb_total_arretes_sec']

    metropole_datas = gdf[~gdf["code_insee"].str.startswith(("97","98"))].copy()
    metropole_datas[selected_cols] = metropole_datas[selected_cols].fillna(0)


    # Standardisation individuelle
    # scaler_sec = StandardScaler()
    # X_sec_scaled = pd.DataFrame(
    #     scaler_sec.fit_transform(metropole_datas[selected_cols]),
    #     columns=selected_cols,
    #     index=metropole_datas.index)

    # # Terme d'interaction SWI × RGA
    # X_sec_scaled['swi_x_rga'] = X_sec_scaled['swi_04_d_abs'] * X_sec_scaled['indicateur_rga']

    # # Re-standardisation du terme d'interaction
    # X_sec_scaled['swi_x_rga'] = StandardScaler().fit_transform(X_sec_scaled[['swi_x_rga']])

    metropole_datas['swi_04_d_abs_indice'] = clip_minmax(metropole_datas['swi_04_d_abs'],q_low=0,q_high=1)
    metropole_datas['indicateur_rga_indice'] = clip_minmax(metropole_datas['indicateur_rga'],q_low=0,q_high=0.99)
    metropole_datas['swi_x_rga'] = metropole_datas['swi_04_d_abs_indice'] * metropole_datas['indicateur_rga_indice']
    metropole_datas['swi_x_rga_indice'] = clip_minmax(metropole_datas['swi_x_rga'],q_low=0,q_high=0.99)
    metropole_datas['swi_x_rga_indice_int'] = (
        np.floor(metropole_datas['swi_x_rga_indice'] * 5)
        .clip(0, 4)
        .astype('Int64')
    )

    metropole_datas['nb_total_arretes_sec_indice'] = clip_minmax(metropole_datas['nb_total_arretes_sec'],q_low=0,q_high=0.99)

    # # Score final (poids à ajuster selon vos choix)
    w_swi_rga = 0.5
    w_arretes = 0.5

    metropole_datas['score_secheresse'] = np.sqrt(
        w_swi_rga * metropole_datas['swi_x_rga_indice']**2 +
        w_arretes * metropole_datas['nb_total_arretes_sec_indice']**2
    )

    metropole_datas['score_secheresse'] = MinMaxScaler().fit_transform(
        metropole_datas[['score_secheresse']]
    )

    metropole_datas['score_secheresse_int'] = (
        np.floor(metropole_datas['score_secheresse'] * 5)
        .clip(0, 4)
        .astype('Int64')
    )

    return (metropole_datas,)


@app.cell
def _(metropole_datas, np, plot_variable):
    plot_variable(metropole_datas,'indicateur_rga', 'score_secheresse', 'score_secheresse_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(metropole_datas, np, plot_variable):
    plot_variable(metropole_datas, 'nb_total_arretes_sec','nb_total_arretes_sec_indice', 'score_secheresse_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(metropole_datas, np, plot_variable):
    plot_variable(metropole_datas, 'indicateur_rga','indicateur_rga_indice', 'score_secheresse_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(metropole_datas, np, plot_variable):
    plot_variable(metropole_datas, 'swi_04_d_abs','swi_04_d_abs_indice', 'score_secheresse_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(carte_discret, metropole_datas):
    carte_discret(metropole_datas, 'score_secheresse_int')
    return


@app.cell
def _():
    # selected_cols = col_selector_secheresse.value
    # metropole_datas = gdf[~gdf["code_insee"].str.startswith(("97","98"))]
    # metropole_datas[selected_cols] = metropole_datas[selected_cols].fillna(0)
    # scaler_sec = StandardScaler()
    # X_sec_scaled = scaler_sec.fit_transform(metropole_datas[selected_cols])

    # pca_sec = PCA(n_components=1)
    # pca_sec.fit(X_sec_scaled)

    # scores = pca_sec.transform(X_sec_scaled)

    # metropole_datas['score_secheresse'] = scores
    return


@app.cell
def _():
    # selected_cols_inondation = col_selector_inondation.value
    # datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))]
    # datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)

    # scaler_ino = StandardScaler()
    # X_ino_scaled = scaler_ino.fit_transform(datas_inondation[selected_cols_inondation])


    # pca_ino = PCA(n_components=1)
    # pca_ino.fit(X_ino_scaled)

    # # w1_ino, w2_ino = pca_ino.explained_variance_ratio_
    # scores_ino = pca_ino.transform(X_ino_scaled)
    # # score_unique_ino = w1_ino * scores_ino[:,0] + w2_ino * scores_ino[:,1]

    # datas_inondation['score_inondation'] = scores_ino
    return


@app.cell
def _():
    # loadings_ino = pd.Series(
    #     pca_ino.components_[0],
    #     index=selected_cols_inondation,
    #     name='loading_PC1'
    # )
    # print(loadings_ino)

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
def _(selected_cols_inondation):
    selected_cols_inondation
    return


@app.cell
def _(MinMaxScaler, col_selector_inondation, gdf, np):
    selected_cols_inondation = col_selector_inondation.value
    datas_inondation = gdf[~gdf["code_insee"].str.startswith(("98"))]
    datas_inondation[selected_cols_inondation] = datas_inondation[selected_cols_inondation].fillna(0)


    datas_inondation['rr_50_d_abs_indice'] = clip_minmax(datas_inondation['rr_50_d_abs'],q_low=0,q_high=0.99)
    datas_inondation['indicateur_tri_indice'] = clip_minmax(datas_inondation['indicateur_tri'],q_low=0,q_high=0.99)
    datas_inondation['rr_50_x_tri'] = datas_inondation['rr_50_d_abs_indice'] * datas_inondation['indicateur_tri_indice']
    datas_inondation['rr_50_x_tri_indice'] = clip_minmax(datas_inondation['rr_50_x_tri'],q_low=0,q_high=0.99)
    datas_inondation['rr_50_x_tri_indice_int'] = (
        np.floor(datas_inondation['rr_50_x_tri_indice'] * 5)
        .clip(0, 4)
        .astype('Int64')
    )

    datas_inondation['nb_total_arretes_ino_indice'] = clip_minmax(datas_inondation['nb_total_arretes_ino'],q_low=0,q_high=0.99)

    # # Score final (poids à ajuster selon vos choix)
    w_rr50_tri = 0.4
    w_arretes_ino = 0.6

    datas_inondation['score_inondation'] = np.sqrt(
        w_rr50_tri * datas_inondation['rr_50_x_tri_indice']**2 +
        w_arretes_ino * datas_inondation['nb_total_arretes_ino_indice']**2
    )

    datas_inondation['score_inondation'] = MinMaxScaler().fit_transform(
        datas_inondation[['score_inondation']]
    )

    datas_inondation['score_inondation_int'] = (
        np.floor(datas_inondation['score_inondation'] * 5)
        .clip(0, 4)
        .astype('Int64')
    )

    return datas_inondation, selected_cols_inondation


@app.cell
def _(datas_inondation, np, plot_variable):
    plot_variable(datas_inondation, 'indicateur_tri','rr_50_x_tri_indice', 'score_inondation_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(datas_inondation, np, plot_variable):
    plot_variable(datas_inondation, 'rr_50_d_abs','rr_50_d_abs_indice', 'score_inondation_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(datas_inondation, np, plot_variable):
    plot_variable(datas_inondation, 'nb_total_arretes_ino','nb_total_arretes_ino_indice', 'score_inondation_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(carte_discret, datas_inondation):
    carte_discret(datas_inondation, 'score_inondation_int')
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


    # gdf_calc['s_norm']  = clip_minmax(gdf_calc['score_secheresse'], q_low=0.05, q_high=0.95)
    # gdf_calc['i_norm']  = clip_minmax(gdf_calc['score_inondation'],  q_low=0.05, q_high=0.95)

    gdf_calc['score_secheresse_net'] = (gdf_calc['score_secheresse'] - poid_pre * gdf_calc['pprn_rga']).clip(lower=0)
    gdf_calc['score_inondation_net'] = (gdf_calc['score_inondation'] - poid_pre * gdf_calc['pprn_ino']).clip(lower=0)
    gdf_calc['score_autres'] = clip_minmax(gdf_calc['nb_total_arretes_autre'], q_low=0, q_high=1)

    score_principal = np.maximum(
        gdf_calc['score_secheresse_net'],
        gdf_calc['score_inondation_net']
    )

    score= np.sqrt((score_principal**2 * 0.9 + gdf_calc['score_autres']**2 * 0.1))
    # score = np.sqrt(0.45*gdf_calc['score_secheresse_net'] **2 + 0.45*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2)

    gdf_calc['score_global_lp'] = score.fillna(
        gdf_calc['score_secheresse_net'].fillna(np.sqrt(0.9*gdf_calc['score_inondation_net']**2+0.1*gdf_calc['score_autres']**2))
    )

    gdf_calc['score_exposition'] = gdf_calc['score_global_lp']/(gdf_calc['score_global_lp'].max())
    return (gdf_calc,)


@app.cell
def _(gdf_calc, np, plot_variable):
    plot_variable(gdf_calc, 'nb_total_arretes_autre','score_autres', None,np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
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
    poids_prevention_prime_budget = mo.ui.slider(0, 1, step=0.1,value=0.4,label='prime/budget')
    poids_prevention_evolution_prime = mo.ui.slider(0, 1, step=0.1,value=0.3,label='evolution prime')
    poids_prevention_franchise = mo.ui.slider(0, 1, step=0.05,value=0.2,label='franchise')
    return (
        poids_prevention_evolution_prime,
        poids_prevention_franchise,
        poids_prevention_prime_budget,
    )


@app.cell
def _(gdf_calc, np):
    gdf_calc_assurance = gdf_calc.copy()

    gdf_calc_assurance['multiple_franchise_last_indice'] = (((gdf_calc_assurance['multiple_franchise_last'].fillna(0)))/ (4))

    gdf_calc_assurance['part_prime_budget_standard'] = clip_minmax(gdf_calc_assurance['part_prime_budget'],q_low = 0.01,q_high=0.99)

    gdf_calc_assurance['part_arretes_non_reconnus_clip']  = clip_minmax(gdf_calc_assurance['part_arretes_non_reconnus'],q_low = 0.0,q_high=1)

    gdf_calc_assurance['evolution_prime_assurance_clip'] = gdf_calc_assurance['evolution_prime_assurance'].clip(-1)
    x_min = -0.2
    # gdf_calc_assurance['evolution_prime_assurance'].quantile(0.05) #0
    x_max = np.expm1(np.log1p(x_min)+(np.log1p(0.144)-np.log1p(x_min))/0.3)

    gdf_calc_assurance['indice_prime'] = ((np.log1p(gdf_calc_assurance['evolution_prime_assurance_clip']) - np.log1p(x_min)) / (np.log1p(x_max) - np.log1p(x_min))).clip(0, 1)
    return (gdf_calc_assurance,)


@app.cell
def _(
    mo,
    pna,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    mo.hstack([poids_prevention_prime_budget, poids_prevention_evolution_prime, poids_prevention_franchise,pna])
    return


@app.cell
def _(
    gdf_calc_assurance,
    np,
    poids_prevention_evolution_prime,
    poids_prevention_franchise,
    poids_prevention_prime_budget,
):
    ppb = poids_prevention_prime_budget.value
    pep = poids_prevention_evolution_prime.value
    pf = poids_prevention_franchise.value
    pna = 1 - pep - ppb - pf

    gdf_calc_assurance['score_assurance'] = np.sqrt(
        pep * gdf_calc_assurance['indice_prime']**2 +
         ppb* gdf_calc_assurance['part_prime_budget_standard']**2
        + pna * gdf_calc_assurance['part_arretes_non_reconnus_clip'].fillna(1)**2+pf*gdf_calc_assurance['multiple_franchise_last_indice']**2)

    # gdf_calc_assurance['multiple_franchise_last'] = gdf_calc_assurance['multiple_franchise_last'].fillna(0)
    # gdf_calc_assurance['score_assurance'] += (
    #      pf*((gdf_calc_assurance['multiple_franchise_last']-1))/ (5 - 1))

    gdf_calc_assurance['score_assurance_min_max'] = (gdf_calc_assurance['score_assurance'])/(gdf_calc_assurance['score_assurance'].max())
    return pep, pf, pna, ppb


@app.cell(hide_code=True)
def _(gdf_calc_assurance, pep, pf, pna, ppb):
    poids = {'indice_prime': pep, 
             'part_prime_budget_standard': ppb, 
             'part_arretes_non_reconnus_clip': pna, 
             'multiple_franchise_last_indice': pf}

    df_contrib = gdf_calc_assurance.copy()
    df_contrib['part_arretes_non_reconnus_clip'] = df_contrib['part_arretes_non_reconnus_clip'].fillna(1)

    score_sq = df_contrib['score_assurance_min_max'] ** 2  # = p1*x1² + p2*x2² + ...

    for var, p in poids.items():
        df_contrib[f'contrib_{var}'] = (p * df_contrib[var]**2) / score_sq

    contrib_cols = [f'contrib_{v}' for v in poids]
    print(df_contrib[contrib_cols].mean().sort_values(ascending=False))
    return


@app.cell
def _(gdf_calc_assurance, np, plot_variable):
    plot_variable(gdf_calc_assurance, 'evolution_prime_assurance','indice_prime', 'score_assurance_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(gdf_calc_assurance, np, plot_variable):
    plot_variable(gdf_calc_assurance, 'part_prime_budget','part_prime_budget_standard','score_assurance_int', np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(gdf_calc_assurance, np, plot_variable):
    plot_variable(gdf_calc_assurance, 'part_arretes_non_reconnus','part_arretes_non_reconnus_clip', 'score_assurance_int',np.array([0,0.2,0.4,0.6,0.8,1]))
    return


@app.cell
def _(gdf_calc_assurance, np, plot_variable):
    plot_variable(gdf_calc_assurance, 'multiple_franchise_last','multiple_franchise_last_indice', 'score_assurance_int',np.array([0,0.25,0.5,0.75,1]))
    return


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
    poids_prevention_dettes = mo.ui.slider(0, 1, step=0.1,value=0.5,label='poids dettes')
    return (poids_prevention_dettes,)


@app.cell
def _(mo, poids_prevention_dettes, ppbh):
    mo.hstack([poids_prevention_dettes,ppbh])
    return


@app.cell
def _(gdf_calc_assurance, np, poids_prevention_dettes, ppb):
    ppd = poids_prevention_dettes.value
    ppbh = 1- ppd

    gdf_calc_eco = gdf_calc_assurance.copy()

    xmin_dette = 0
    xmax_dette = - gdf_calc_eco['ratio_dettes_depenses'].median()/0.2
    # xmax = x.quantile(0.9)

    gdf_calc_eco['debt_indice'] = ((- gdf_calc_eco['ratio_dettes_depenses'] - xmin_dette) / (xmax_dette - xmin_dette))
    gdf_calc_eco['debt_indice'] = gdf_calc_eco['debt_indice'].clip(0,1)

    x_min_depenses = gdf_calc_eco['depenses_per_pop'].quantile(0.01)
        # .quantile(0.001)
    xmax_depenses = np.expm1(np.log1p(x_min_depenses) + (np.log1p(gdf_calc_eco['depenses_per_pop'].median()) - np.log1p(x_min_depenses)) / 0.8)

    gdf_calc_eco['depenses_per_pop_indice'] = (1-(np.log1p(gdf_calc_eco['depenses_per_pop']) - np.log1p(x_min_depenses)) / (np.log1p(xmax_depenses) - np.log1p(x_min_depenses))).clip(0, 1)


    gdf_calc_eco['score_eco'] = np.sqrt(
        ppb * gdf_calc_eco['depenses_per_pop_indice']**2 +
         ppd* gdf_calc_eco['debt_indice']**2
    )

    gdf_calc_eco['score_eco_minmax'] = gdf_calc_eco['score_eco']/gdf_calc_eco['score_eco'].max()
    return gdf_calc_eco, ppbh


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco.loc[gdf_calc_eco['depenses_per_pop_indice']>0.4].shape
    return


@app.cell
def _(gdf_calc_eco, np):
    gdf_calc_eco['score_eco_int'] = np.floor(gdf_calc_eco['score_eco_minmax'] * 5).clip(0, 4).astype('Int64')
    gdf_calc_eco['score_eco_1d'] = (gdf_calc_eco['score_eco_minmax']*5).round(1)
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco.loc[gdf_calc_eco['score_eco_int']>1].shape
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_eco_int'].value_counts()
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc_eco, np, plot_variable):
    plot_variable(gdf_calc_eco, 'depenses_per_pop','depenses_per_pop_indice','score_eco_int', np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(gdf_calc_eco, np, plot_variable):
    plot_variable(gdf_calc_eco, 'ratio_dettes_depenses','debt_indice', 'score_eco_int',np.array([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]))
    return


@app.cell
def _(carte_continue, gdf_calc_eco):
    carte_continue(gdf_calc_eco, 'debt_indice')
    return


@app.cell
def _(carte_continue, gdf_calc_eco):
    carte_continue(gdf_calc_eco, 'depenses_per_pop_indice')
    return


@app.cell
def _(carte_discret, gdf_calc_eco):
    carte_discret(gdf_calc_eco, 'score_eco_int')
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _():
    # q_300  = (gdf['depenses_per_pop'].dropna() <= 400).mean()
    # q_1500 = (gdf['depenses_per_pop'].dropna() <= 1500).mean()

    # print(f"300€/hab  → quantile {q_300:.3f}  ({q_300*100:.1f}% des communes en dessous)")
    # print(f"1500€/hab → quantile {q_1500:.3f} ({q_1500*100:.1f}% des communes en dessous)")
    # s_low, x_low = 0.9, 250
    # s_high, x_high = 0.1, 1000
    # r = (1 - s_low) / (1 - s_high)
    # lin_min = (r * x_high - x_low) / (r - 1)
    # lin_max = lin_min + (x_low - lin_min) / (1 - s_low)

    # # Calcul des bornes implicites
    # log_low  = np.log1p(x_low)
    # log_high = np.log1p(x_high)
    # log_min = (r * log_high - log_low) / (r - 1)
    # log_max = log_min + (log_low - log_min) / (1 - s_low)
    # print(np.expm1(log_min))
    # print(np.expm1(log_max))
    return


@app.cell(hide_code=True)
def _():
    # data_depense = gdf_calc_eco['depenses_per_pop'].dropna().values
    # data_clipped_depense = np.clip(data_depense, -1, 3000)
    # data_log = np.log1p(np.clip(data_depense, 0, 3000))  # log1p = log(1+x), évite log(0)

    # fig_, (ax3, ax4) = plt.subplots(2, 1, figsize=(10, 8))

    # def plot_hist(ax, data, title):
    #     ax.hist(data, bins=50, color='lightsteelblue', edgecolor='white', alpha=0.8)
    #     ax.axvline(np.median(data), color='orange', linewidth=2, label=f'Médiane ({np.median(data):.2f})')
    #     ax.axvline(np.mean(data), color='red', linewidth=2, linestyle='--', label=f'Moyenne ({np.mean(data):.2f})')
    #     ax.axvline(np.quantile(data, 0.75), color='green', linewidth=2, linestyle=':', label=f'Quantile 75% ({np.quantile(data, 0.75):.2f})')
    #     ax.set_title(title)
    #     ax.set_ylabel("Fréquence")
    #     ax.legend()

    # plot_hist(ax3, data_clipped_depense, "Dépenses par habitant (clippé)")
    # plot_hist(ax4, data_log, "Dépenses par habitant (log)")

    # plt.tight_layout()
    # plt.show()
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
def _():
    # ppeco = poids_prevention_eco.value
    # ppa = poids_prevention_assurance.value
    # ppexpo = 1 - ppeco - ppa

    # gdf_calc_eco['final'] = (ppeco*gdf_calc_eco['score_eco_minmax']**2+ppa*gdf_calc_eco['score_assurance_min_max']**2+ppexpo*gdf_calc_eco['score_exposition']**2)**(1/2)


    # gdf_calc_eco['final_min_max'] = (gdf_calc_eco['final']-gdf_calc_eco['final'].min())/(gdf_calc_eco['final'].max()-gdf_calc_eco['final'].min())
    # gdf_calc_eco['final_min_max']  = clip_minmax(gdf_calc_eco['final_min_max'] ,q_low = 0.05,q_high=1)
    return


@app.cell
def _():
    # gdf_calc_eco['score_final_int'] = np.floor(gdf_calc_eco['final_min_max'] * 5).clip(0, 4).astype('Int64')

    # gdf_calc_eco['score_final_1d'] = (gdf_calc_eco['final_min_max']*5).round(1)
    return


@app.cell
def _():
    # gdf_calc_eco['final_min_max'].hist()
    return


@app.cell
def _():
    return


@app.cell
def _(gdf_calc_eco):
    gdf_calc_eco['score_final_int'].value_counts()
    return


@app.cell
def _():
    # carte_discret(gdf_calc_eco, 'score_final_int')
    return


@app.cell
def _():
    # INDICES = gdf_calc_eco[['code_insee','departement','region','score_eco_1d','score_assurance_1d','score_exposition_1d','score_final_1d']]
    # INDICES_ = INDICES.rename({'score_eco_1d':'score_economique','score_assurance_1d':'score_assurance','score_exposition_1d':'score_exposition','score_final_1d':'indice_vulnerabilite_niveau'},axis=1)

    # INDICES_.to_parquet('Score_vulnerabilite.parquet')
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
