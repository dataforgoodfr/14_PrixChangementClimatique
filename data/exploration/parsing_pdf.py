import re
import pdfplumber
import pandas as pd
import numpy as np
import fitz  # PyMuPDF
import argparse

def run_extract_information_from_pdf(pdf_path: str, out_path: str) -> pd.DataFrame:
    """
    Full ETL pipeline: extract data from PDF, transform it, and save to CSV.

    Args:
        pdf_path (str): Path to input PDF.
        out_path (str): Path to output CSV (without .csv extension).

    Returns:
        pd.DataFrame: Transformed DataFrame.
    """
    df = extract_information_from_pdf(pdf_path)
    df = transform_information_from_dataframe(df)
    df.to_csv(out_path + ".csv", index=False)
    return df
def transform_information_from_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform the raw DataFrame into a clean, usable format.

    Steps:
        - One-hot encode major problems
        - Extract department code and name
        - Extract collectivity name and administrative unit
        - Drop raw columns

    Args:
        df (pd.DataFrame): Raw DataFrame.

    Returns:
        pd.DataFrame: Cleaned and transformed DataFrame.
    """
    df_one_hot = extract_one_hot(df["Problème(s) majeur(s) évoqué(s)"]).replace(0, np.nan)
    df_transform = pd.concat([df, df_one_hot], axis=1)
    df_transform = df_transform.pipe(extract_department_code_name).pipe(extract_administrative_unit)
    cols_to_drop = ["Problème(s) majeur(s) évoqué(s)", "departement", "Collectivité"]
    df_transform = df_transform.drop(columns=cols_to_drop)
    cols = ["collectivite_name"] + [c for c in df_transform.columns if c != "collectivite_name"]
    return df_transform[cols]

def extract_questions_from_pdf(pdf_path: str) -> list:
    """
    Extract all bold questions ending with ":" from a PDF.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        list: Sorted list of unique questions.
    """
    results = []
    doc = fitz.open(pdf_path)
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if "bold" in span["font"].lower() and text.endswith(":"):
                        results.append(text)
    cleaned = [re.sub(r"\s+", " ", q).rstrip(":").strip() for q in results if q.strip() != ":"]
    return sorted(set(cleaned))


def read_pdf(path: str) -> str:
    """
    Read the full text from a PDF.

    Args:
        path (str): Path to the PDF file.

    Returns:
        str: Full text of the PDF.
    """
    with pdfplumber.open(path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def split_departments(text: str) -> list:
    """
    Split text into department blocks.

    Args:
        text (str): Full text of the PDF.

    Returns:
        list: List of tuples (department_name, text_block).
    """
    pattern = re.compile(r"(?m)^(?:\d{2}|2A|2B)\s*-\s*.+$")
    matches = list(pattern.finditer(text))
    return [(matches[i].group().strip(), text[matches[i].start():matches[i+1].start()]) for i in range(len(matches)-1)]


def split_collectivities(block: str) -> list:
    """
    Split a department block into individual collectivities.

    Args:
        block (str): Text block of a department.

    Returns:
        list: List of text blocks for each collectivity.
    """
    return [c.strip() for c in re.split(r"(?m)^Collectivité\s*:\s*", block)[1:] if c.strip()]


def parse_collectivity(text: str, department: str, questions: list) -> dict:
    """
    Parse a single collectivity and extract answers to questions.
    Only the question
    "Solutions proposées pour régler les problèmes d’assurance des collectivités"
    allows multi-line responses until the next collectivity or department.

    Args:
        text (str): Text of the collectivity.
        department (str): Department name.
        questions (list): List of questions to extract.

    Returns:
        dict: Dictionary with department, collectivity, and question responses.
    """
    record = {"departement": department, "Collectivité": text.split("\n")[0].strip()}

    for key in questions:
        if key == "Solutions proposées pour régler les problèmes d’assurance des collectivités":
            pattern = re.compile(
                rf"(?ms){re.escape(key)}\s*:\s*(.*?)(?=^Collectivité\s*:|^(?:\d{{2}}|2A|2B)\s*-|\Z)"
            )
            match = pattern.search(text)
            if match:
                record[key] = match.group(1).strip()
        else:
            pattern = re.compile(rf"(?m)^{re.escape(key)}\s*:\s*(.+)$")
            match = pattern.search(text)
            if match:
                record[key] = match.group(1).strip()

    return record


def parse_department(block: str, name: str, questions: list) -> list:
    """
    Parse all collectivities in a department block.

    Args:
        block (str): Department text block.
        name (str): Department name.
        questions (list): List of questions.

    Returns:
        list: List of dictionaries for each collectivity.
    """
    return [parse_collectivity(city, name, questions) for city in split_collectivities(block)]


def extract_information_from_pdf(pdf_path: str) -> pd.DataFrame:
    """
    Extract all information from a PDF into a DataFrame.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        pd.DataFrame: Raw extracted data.
    """
    text = read_pdf(pdf_path)
    questions = extract_questions_from_pdf(pdf_path)
    return pd.DataFrame([rec for dept, block in split_departments(text) for rec in parse_department(block, dept, questions)])


def extract_department_code_name(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add department code and department name as separate columns.

    Args:
        df (pd.DataFrame): DataFrame with 'departement' column.

    Returns:
        pd.DataFrame: DataFrame with 'code_department' and 'name_department'.
    """
    df = df.copy()
    df["code_department"] = df["departement"].str.extract(r"^(\d{2}|2A|2B)")
    df["name_department"] = df["departement"].str.extract(r"^(?:\d{2}|2A|2B)\s*-\s*(.+)")
    return df


def extract_administrative_unit(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract collectivity name and administrative unit.

    Args:
        df (pd.DataFrame): DataFrame with 'Collectivité' column.

    Returns:
        pd.DataFrame: DataFrame with 'collectivite_name' and 'administrative_unit'.
    """
    df = df.copy()
    df["collectivite_name"] = df["Collectivité"].str.replace(r"\s*\(.*\)", "", regex=True).str.strip()
    df["administrative_unit"] = df["Collectivité"].str.findall(r"\(([^()]*)\)").str.join(" ")
    return df


def extract_one_hot(series: pd.Series) -> pd.DataFrame:
    """
    Convert bullet-pointed problem statements into one-hot encoded columns.

    Args:
        series (pd.Series): Series of problem statements.

    Returns:
        pd.DataFrame: One-hot encoded DataFrame of problems.
    """
    s = series.fillna("").astype(str).str.strip()
    s = s[s.str.startswith("-")]
    s = s.str.lower().str.replace("’", "'", regex=False).str.replace(r"^-+\s*", "", regex=True).str.replace(r"\s+", " ", regex=True)
    return pd.get_dummies(s)






def main():
    parser = argparse.ArgumentParser(description="Extract and transform data from a PDF of municipalities")
    parser.add_argument("pdf_path", type=str, help="Path to the input PDF file")
    parser.add_argument("csv_path", type=str, help="Path to the output CSV file")
    args = parser.parse_args()

    pdf_path = args.pdf_path
    out_path = args.csv_path

    print(f"Extracting from: {pdf_path}")
    print(f"Output CSV: {out_path}")

    # Call your ETL function
    run_extract_information_from_pdf(pdf_path, out_path)

    print("Extraction completed!")

if __name__ == "__main__":
    main()