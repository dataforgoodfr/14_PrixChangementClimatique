import io
import os
import zipfile
from pathlib import Path
import polars as pl
import requests
from s3_connector import get_s3_client, send_large_file_to_s3
from tqdm import tqdm

# Lien du jeu de données INSEE des valeurs foncières, pas d'API pour le moment
# https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres

# Docu des colonnes INSEE
# https://www.data.gouv.fr/api/1/datasets/r/d573456c-76eb-4276-b91c-e6b9c89d6656

# Lien URL stable de chaque année (dossier .zip contenant un .txt)
data_2025_url = ("https://www.data.gouv.fr/api/1/datasets/r/4d741143-8331-4b59-95c2-3b24a7bdbe3c")
data_2024_url = ("https://www.data.gouv.fr/api/1/datasets/r/af812b0e-a898-4226-8cc8-5a570b257326")
data_2023_url = ("https://www.data.gouv.fr/api/1/datasets/r/cc8a50e4-c8d1-4ac2-8de2-c1e4b3c44c86")
data_2022_url = ("https://www.data.gouv.fr/api/1/datasets/r/8c8abe23-2a82-4b95-8174-1c1e0734c921")
data_2021_url = ("https://www.data.gouv.fr/api/1/datasets/r/e117fe7d-f7fb-4c52-8089-231e755d19d3")
data_2020_url = ("https://www.data.gouv.fr/api/1/datasets/r/8d771135-57c8-480f-a853-3d1d00ea0b69")

urls = {
    "2025": data_2025_url,
    "2024": data_2024_url,
    "2023": data_2023_url,
    "2022": data_2022_url,
    "2021": data_2021_url,
    "2020": data_2020_url,
}

# Année après année, ajouter un lien url dans une variable et la variable dans le dictionnaire urls pour automatiser le processus de téléchargement et d'ingestion des données

def download_and_extract_zip_in_local(
    url,
    output_dir="data/utils/downloaded_files/surface_m2",
    min_file_size_mb=None,
    year_suffix=None,
):
    """
    Télécharge un fichier .zip depuis une URL, extrait et sauvegarde les fichiers .txt localement
    Si plusieurs fichiers .txt sont trouvés, ils sont concaténés en un seul fichier
    Si le fichier existe déjà et a une taille suffisante, le téléchargement est ignoré

    Args:
        url: L'URL du fichier .zip à télécharger
        output_dir: Le dossier où sauvegarder les fichiers extraits
        min_file_size_mb: Taille minimale en MB pour considérer le fichier valide (None = pas de vérification)
        year_suffix: Suffixe pour le nom du fichier (ex: "2025")
    Returns:
        Chemin du fichier .txt sauvegardé
    """
    # Créer le dossier de sortie s'il n'existe pas
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Vérifier d'abord si un fichier existe déjà dans le dossier
    existing_txt_files = list(output_path.glob("*.txt"))

    # Si year_suffix est fourni, filtrer par nom de fichier contenant l'année
    if year_suffix and existing_txt_files:
        existing_txt_files = [
            f
            for f in existing_txt_files
            if year_suffix in f.name or f.name == "concatenated_data.txt"
        ]

    # Si un fichier existe, vérifier sa taille
    if existing_txt_files:
        existing_file = existing_txt_files[0]  # Prendre le premier fichier trouvé
        file_size_mb = existing_file.stat().st_size / (1024 * 1024)

        if min_file_size_mb is None or file_size_mb >= min_file_size_mb:
            print(
                f"✓ Fichier déjà existant: {existing_file.name} ({file_size_mb:.1f} MB)"
            )
            print("  Téléchargement ignoré")
            return str(existing_file)
        else:
            print(
                f"⚠️  Fichier existant mais trop petit: {file_size_mb:.1f} MB < {min_file_size_mb} MB"
            )
            print("   Suppression et re-téléchargement...")
            existing_file.unlink()  # Supprimer le fichier invalide

    # Télécharger le fichier .zip avec timeout et streaming
    print(f"Téléchargement depuis {url}...")
    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()  # Vérifie que la requête a réussi

    # Obtenir la taille totale du fichier
    total_size = int(response.headers.get("content-length", 0))

    # Télécharger avec barre de progression
    zip_content = io.BytesIO()
    with tqdm(
        total=total_size, unit="B", unit_scale=True, desc="Téléchargement"
    ) as pbar:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                zip_content.write(chunk)
                pbar.update(len(chunk))

    zip_content.seek(0)  # Retour au début du buffer

    # Extraire le contenu du .zip
    all_contents = []
    txt_filenames = []

    with zipfile.ZipFile(zip_content) as zip_file:
        print(f"Fichiers dans le .zip: {zip_file.namelist()}")

        # Lire tous les fichiers .txt
        for file_name in zip_file.namelist():
            if file_name.endswith(".txt"):
                txt_filenames.append(file_name)

    if len(txt_filenames) == 0:
        print("Aucun fichier .txt trouvé dans le zip")
        return None

    # Déterminer le nom du fichier de sortie
    if len(txt_filenames) == 1:
        output_filename = txt_filenames[0]
    else:
        output_filename = "concatenated_data.txt"

    output_filepath = output_path / output_filename

    # Le fichier n'existe pas, on procède à l'extraction
    zip_content.seek(0)  # Retour au début du buffer
    with zipfile.ZipFile(zip_content) as zip_file:
        for file_name in txt_filenames:
            content = zip_file.read(file_name).decode("utf-8")
            all_contents.append(content)
            print(f"Fichier .txt extrait: {file_name} ({len(content)} caractères)")

    # Préparer le contenu final
    if len(all_contents) == 1:
        final_content = all_contents[0]
    else:
        # Concaténer les fichiers (garder l'en-tête du premier seulement)
        result = [all_contents[0]]  # Premier fichier complet

        for content in all_contents[1:]:
            data_lines = content.split("\n")[1:]  # Ignorer l'en-tête
            result.append("\n".join(data_lines))

        final_content = "\n".join(result)
        print(f"{len(all_contents)} fichiers concaténés -> {output_filename}")

    # Sauvegarder le fichier
    with open(output_filepath, "w", encoding="utf-8") as f:
        f.write(final_content)

    print(f"Fichier sauvegardé: {output_filepath} ({len(final_content)} caractères)")
    return str(output_filepath)

def scan_and_transform():
    # Télécharger toutes les années et stocker en variables
    data_files = {}
    for year, url in urls.items():
        print(f"\nTéléchargement des données pour l'année {year}...")
        # Utiliser un sous-dossier par année pour éviter les conflits
        output_dir = f"data/utils/downloaded_files/surface_m2/{year}"
        # Vérifier que le fichier fait au moins 10 MB (sinon re-télécharger)
        output_path = download_and_extract_zip_in_local(
            url, output_dir=output_dir, min_file_size_mb=10, year_suffix=year
        )
        data_files[year] = output_path

    print("\n" + "=" * 60)
    print("Traitement des données avec Polars (lazy evaluation)")
    print("=" * 60)

    # Utiliser Polars avec lazy evaluation pour économiser la mémoire
    lazyframes = []

    for year, file_path in data_files.items():
        print(f"\nChargement année {year}...")
        # scan_csv est lazy - ne charge pas tout en mémoire
        lf = pl.scan_csv(
            file_path,
            separator="|",
            encoding="utf8",
            truncate_ragged_lines=True,  # Gérer les lignes mal formatées
            ignore_errors=True,  # Continuer malgré les erreurs
        ).with_columns(
            pl.lit(year).alias("annee")  # Ajouter la colonne année
        )
        lazyframes.append(lf)
        print(f"  ✓ Configuration lazy pour {year}")

    # Concaténer tous les dataframes
    print("\nConcaténation de toutes les années...")
    combined_lf = pl.concat(
        lazyframes, how="vertical_relaxed"
    )  # vertical_relaxed gère les schémas différents

    # Sauvegarder d'abord le fichier brut sans analyser les colonnes
    output_file_raw = "data/utils/downloaded_files/surface_m2/valeurs_foncieres_raw.parquet"
    output_file_clean = (
        "data/utils/downloaded_files/surface_m2/valeurs_foncieres_combined.parquet"
    )

    print(f"\nÉtape 1/2: Sauvegarde du fichier brut: {output_file_raw}")
    print("Écriture en streaming (cela peut prendre du temps)...")

    # sink_parquet écrit directement sans tout charger en mémoire
    combined_lf.sink_parquet(
        output_file_raw,
        compression="zstd",
        maintain_order=False,  # Plus rapide si l'ordre n'est pas important
    )

    print("✓ Fichier brut sauvegardé")

    # Étape 2: Recharger et supprimer les colonnes inutiles
    print("\nÉtape 2/2: Suppression des colonnes inutiles...")
    df_lazy = pl.scan_parquet(output_file_raw)

    # Obtenir le schéma
    all_columns = df_lazy.collect_schema().names()
    print(f"Nombre de colonnes dans le fichier: {len(all_columns)}")

    # Colonnes à supprimer (identifiées comme vides ou inutiles)
    columns_to_drop = [
        "Identifiant de document",
        "Reference document",
        "1 Articles CGI",
        "2 Articles CGI",
        "3 Articles CGI",
        "4 Articles CGI",
        "5 Articles CGI",
    ]

    # Vérifier quelles colonnes existent réellement
    existing_columns_to_drop = [col for col in columns_to_drop if col in all_columns]

    if existing_columns_to_drop:
        print(f"\n{'=' * 60}")
        print(f"Colonnes à supprimer: {len(existing_columns_to_drop)}")
        print(f"{'=' * 60}")
        for i, col in enumerate(existing_columns_to_drop, 1):
            print(f"  {i}. {col}")
        print(f"{'=' * 60}")

        # Filtrer les colonnes et réécrire
        columns_to_keep = [
            col for col in all_columns if col not in existing_columns_to_drop
        ]
        print("\nRéécriture du fichier sans les colonnes inutiles...")

        df_lazy.select(columns_to_keep).sink_parquet(
            output_file_clean,
            compression="zstd",
            maintain_order=False,
        )

        print(f"\n✓ {len(existing_columns_to_drop)} colonnes supprimées")
        print(f"  Colonnes restantes: {len(columns_to_keep)}")
        os.remove(output_file_raw)
        print("  Fichier brut supprimé")

        final_file = output_file_clean
    else:
        print("\n✓ Aucune colonne à supprimer")
        os.rename(output_file_raw, output_file_clean)
        final_file = output_file_clean

    # Recharger pour afficher les stats (lazy)
    print("\n" + "=" * 60)
    print("RÉSULTAT FINAL")
    print("=" * 60)

    df_lazy = pl.scan_parquet(final_file)

    # Compter les lignes et vérifier les colonnes (opérations légères)
    print("Calcul des statistiques...")
    stats = df_lazy.select(
        [pl.len().alias("total_lignes"), pl.col("annee").n_unique().alias("nb_annees")]
    ).collect()

    print(f"Nombre total de lignes: {stats['total_lignes'][0]:,}")
    print(f"Nombre d'années: {stats['nb_annees'][0]}")

    # Distribution par année
    print("\nDistribution par année:")
    distribution = (
        df_lazy.group_by("annee")
        .agg(pl.len().alias("total_lignes"))
        .sort("annee")
        .collect()
    )
    print(distribution)

def send_to_s3():
    s3_client = get_s3_client()
    try:
        send_large_file_to_s3(
            s3_client=s3_client,
            bucket=os.getenv("S3_BUCKET"),
            filepath="data/utils/downloaded_files/surface_m2/valeurs_foncieres_combined.parquet",
            s3_filepath="pipeline_inputs/valeurs_foncieres_combined.parquet",
            replace=False,  # Ne pas remplacer si le fichier existe déjà et a la même taille
        )
        print("Fichier envoyé à S3 ✅")
        s3_client.close()
    except Exception as e:
        print(f"Erreur lors de l'envoi à S3: {e}")
        s3_client.close()

def main():
    scan_and_transform()
    send_to_s3()

if __name__ == "__main__":
    main()
