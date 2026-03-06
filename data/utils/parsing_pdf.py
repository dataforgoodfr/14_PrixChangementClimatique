import argparse
import re
from pathlib import Path

import fitz  # PyMuPDF
import pandas as pd
import pdfplumber

current_dir = Path.cwd()
seeds_dir = current_dir / "data" / "dbt_pipeline" / "seeds"
pdf_path = current_dir / "data" / "utils" / "downloaded_files" / "r23-474-annexe3.pdf"


def run_extract_information_from_pdf(
    insee_commune_csv_path: str, pdf_path: Path = pdf_path, seeds_dir: Path = seeds_dir
) -> pd.DataFrame:
    """Full ETL pipeline: extract data from PDF, transform it, and save to CSV.

    Args:
        insee_commune_csv_path (str): Path to the INSEE commune CSV file.
        pdf_path (Path): Path to input PDF.
        seeds_dir (Path): Directory to save seed CSV files.

    Returns:
        pd.DataFrame: Transformed DataFrame.
    """
    df = extract_information_from_pdf(pdf_path)
    df["id_collectivity"] = df.index

    path_relation_with_assurance = seeds_dir / "relation_with_assurance_pdf.csv"
    extract_relation_with_assurance(df, path_relation_with_assurance)
    path_problems = seeds_dir / "problems_pdf.csv"
    extract_problems(df, path_problems)
    path_collectivities = seeds_dir / "collectivities_pdf.csv"
    extract_collectivities(df, path_collectivities, insee_commune_csv_path)
    return df


def extract_questions_from_pdf(pdf_path: str) -> list:
    """Extract all bold questions ending with ":" from a PDF.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        list: Sorted list of unique questions.
    """
    results = []
    # Using fitz to extract text with font information
    doc = fitz.open(pdf_path)
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            # Only consider blocks that contain lines of text
            if "lines" not in block:
                continue
            for line in block["lines"]:
                # spans is a list of text segments with the same font properties
                for span in line["spans"]:
                    text = span["text"].strip()
                    if "bold" in span["font"].lower() and text.endswith(":"):
                        results.append(text)
    cleaned = [
        re.sub(r"\s+", " ", q).rstrip(":").strip() for q in results if q.strip() != ":"
    ]
    return sorted(set(cleaned))


def read_pdf(path: str) -> str:
    """Read the full text from a PDF file.

    Args:
        path (str): Path to the PDF file.

    Returns:
        str: Full text of the PDF as a single string.
    """
    with pdfplumber.open(path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def split_departments(text: str) -> list[tuple[str, str]]:
    """Split the PDF text into department blocks.

    Args:
        text (str): Full text of the PDF.

    Returns:
        list[tuple[str, str]]: List of tuples (department_name, department_text_block).
    """
    dept_pattern = re.compile(r"^(?:\d{2,3}|2A|2B) - [^\n]+$", re.MULTILINE)

    matches = list(dept_pattern.finditer(text))

    blocks = []
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        blocks.append((matches[i].group().strip(), text[start:end]))
    return blocks


def split_collectivities(block: str) -> list[str]:
    """Split a department block into individual collectivities.

    Args:
        block (str): Text block of a department.

    Returns:
        list[str]: List of text blocks, each representing a collectivity.
    """
    return [
        c.strip() for c in re.split(r"(?m)^Collectivité\s*:\s*", block)[1:] if c.strip()
    ]


def parse_collectivity(text: str, department: str, questions: list[str]) -> dict:
    """Parse a single collectivity and extract answers to questions.

    Only the question
    "Solutions proposées pour régler les problèmes d’assurance des collectivités"
    allows multi-line responses until the next collectivity or department.

    Args:
        text (str): Text of the collectivity.
        department (str): Name of the department.
        questions (list[str]): List of questions to extract.

    Returns:
        dict: Dictionary with department, collectivity, and question responses.
    """
    record = {"department": department, "collectivity": text.split("\n")[0].strip()}

    for q in questions:
        if (
            q
            == "Solutions proposées pour régler les problèmes d’assurance des collectivités"
        ):
            pattern = re.compile(rf"(?ms){re.escape(q)}\s*:\s*(.*)")
        else:
            pattern = re.compile(rf"(?m)^{re.escape(q)}\s*:\s*(.+)$")

        match = pattern.search(text)
        record[q] = match.group(1).strip() if match else None

    return record


def parse_department(block: str, name: str, questions: list[str]) -> list[dict]:
    """Parse all collectivities in a department block.

    Args:
        block (str): Department text block.
        name (str): Department name.
        questions (list[str]): List of questions to extract.

    Returns:
        list[dict]: List of dictionaries for each collectivity.
    """
    return [parse_collectivity(c, name, questions) for c in split_collectivities(block)]


def extract_information_from_pdf(pdf_path: str) -> pd.DataFrame:
    """Extract all information from a PDF into a DataFrame.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        pd.DataFrame: DataFrame with columns for department, collectivity, and questions.
    """
    text = read_pdf(pdf_path)
    questions = extract_questions_from_pdf(
        pdf_path
    )  # Your function to extract questions
    data = []

    for dept_name, dept_block in split_departments(text):
        data.extend(parse_department(dept_block, dept_name, questions))

    return pd.DataFrame(data)


def extract_relation_with_assurance(df: pd.DataFrame, csv_path: str) -> pd.DataFrame:
    """Extract solutions and relationship scores per collectivity and save to CSV.

    Args:
        df (pd.DataFrame): DataFrame with columns:
            - 'id_collectivity'
            - 'Solutions proposées pour régler les problèmes d’assurance des collectivités'
            - 'Qualité de la relation avec l’assureur pour les dommages aux biens'
        csv_path (str): Mandatory path to save the resulting CSV.

    Returns:
        pd.DataFrame: Columns ['id_collectivity', 'solution', 'relation_score'].
    """
    df_result = pd.DataFrame(
        {
            "id_collectivity": df["id_collectivity"],
            "solution": df[
                "Solutions proposées pour régler les problèmes d’assurance des collectivités"
            ],
            "relation_score": df[
                "Qualité de la relation avec l’assureur pour les dommages aux biens"
            ]
            .str.replace("/10", "", regex=False)
            .astype(float),
        }
    )

    df_result = df_result[["id_collectivity", "solution", "relation_score"]]

    df_result.to_csv(csv_path, index=False)

    return df_result


def extract_problems(df: pd.DataFrame, csv_path: str) -> pd.DataFrame:
    """Extract major problems mentioned by collectivity and save to CSV.

    Args:
        df (pd.DataFrame): Input DataFrame with column
            - "Problème(s) majeur(s) évoqué(s)"
        csv_path (str): Path to save the resulting CSV.

    Returns:
        pd.DataFrame: Columns ["id_collectivite", "problem"]
    """
    events = []

    for i, text in df["Problème(s) majeur(s) évoqué(s)"].dropna().items():
        # Split on dash or bullet
        parts = re.split(r"[-•]", text)
        for part in parts:
            part = part.strip()
            if part and not part.isdigit():
                events.append({"id_collectivite": i, "problem": part})

    df_problems = pd.DataFrame(events)
    df_problems.to_csv(csv_path, index=False)
    return df_problems


def extract_collectivities(
    df: pd.DataFrame, path_csv: Path, insee_commune_csv_path: str
) -> pd.DataFrame:
    """Extract and clean collectivity information from the DataFrame.

    Args:
        df (pd.DataFrame): Input DataFrame with columns:
            - "id_collectivity"
            - "department" (format "XX - Name")
            - "collectivity" (format "Name (Type)")
            - "Fonction" (job of the respondent)
        path_csv (Path): path of output csv

    Returns:
        pd.DataFrame: Columns
            - id_collectivity
            - department_code
            - department_name
            - collectivity
            - type_collectivity
            - respondent_job
    """
    df_collectivities = pd.DataFrame()

    df_collectivities["id_collectivity"] = df["id_collectivity"]

    # Extract department code (e.g., 95, 974, 2A)
    df_collectivities["department_code"] = df["department"].str.extract(
        r"^(\d{2,3}|2A|2B)"
    )

    # Extract department name
    df_collectivities["department_name"] = df["department"].str.extract(
        r"^(?:\d{2,3}|2A|2B)\s*-\s*(.+)"
    )

    # Clean collectivity name and remove parenthesis content
    df_collectivities["collectivity"] = (
        df["collectivity"].str.replace(r"\s*\(.*?\)", "", regex=True).str.strip()
    )

    # Extract type of collectivity (inside parenthesis)
    df_collectivities["type_collectivity"] = df["collectivity"].str.extract(
        r"\(([^()]*)\)\s*$"
    )

    # Job of the respondent
    df_collectivities["respondent_job"] = df["Fonction"]

    # Merge with INSEE commune data to get code_geo
    df_collectivities_pdf_with_code_geo = extract_code_geo(
        df_collectivities, insee_commune_csv_path
    )

    # Keep only relevant columns
    df_collectivities_pdf_with_code_geo = df_collectivities_pdf_with_code_geo[
        [
            "id_collectivity",
            "department_code",
            "department_name",
            "collectivity",
            "type_collectivity",
            "respondent_job",
            "COM",
        ]
    ]
    # rename COM to code_geo
    df_collectivities_pdf_with_code_geo = df_collectivities_pdf_with_code_geo.rename(
        columns={"COM": "code_geo"}
    )

    df_collectivities_pdf_with_code_geo.to_csv(path_csv, index=False)

    return df_collectivities_pdf_with_code_geo


def extract_code_geo(
    df_collectivities_pdf: pd.DataFrame, path_csv: Path
) -> pd.DataFrame:
    """Merge the collectivity DataFrame with INSEE commune data to get code_geo.

    Args:
        df_collectivities_pdf (pd.DataFrame): DataFrame with collectivity and department info.
        path_csv (Path): Path to save the resulting CSV.

    Returns:
        pd.DataFrame: DataFrame with code_geo

    """
    insee_commune_2025 = pd.read_csv(path_csv)
    df_collectivities_pdf["collectivity_lower"] = (
        df_collectivities_pdf["collectivity"]
        .str.lower()
        .str.replace("’", "", regex=False)
    )

    insee_commune_2025["LIBELLE_lower"] = (
        insee_commune_2025["LIBELLE"].str.lower().str.replace("'", "", regex=False)
    )

    # merge ensuite
    df_collectivities_pdf_with_code_geo = pd.merge(
        df_collectivities_pdf,
        insee_commune_2025,
        left_on=["collectivity_lower", "department_code"],
        right_on=["LIBELLE_lower", "DEP"],
        how="left",
    )

    return df_collectivities_pdf_with_code_geo


# add arg for insee_commune_csv_path in main
def main():
    parser = argparse.ArgumentParser(
        description="Extract information from PDF and save to CSV."
    )
    parser.add_argument(
        "--insee_commune_csv_path",
        "-p",
        type=str,
        required=True,
        help="Path to the INSEE commune CSV file.",
    )
    args = parser.parse_args()
    insee_commune_csv_path = args.insee_commune_csv_path

    print("Extracting information from PDF...")
    run_extract_information_from_pdf(insee_commune_csv_path)
    print("Extraction completed!")


if __name__ == "__main__":
    main()
