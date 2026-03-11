#!/usr/bin/env python3
import json
import sys
import requests
from html.parser import HTMLParser

# --- CONFIGURATION ---
CLIENT_ID = "d3f25062-d42b-4cef-99cf-b65a4795297f"
CLIENT_SECRET = "f0fee75f-242d-4c92-9b3b-4a9950e4d2fc"
AUTH_URL = "https://oauth.piste.gouv.fr/api/oauth/token"
API_BASE_URL = "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app"

class CatNatTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.current_row = []
        self.current_cell_content = ""
        self.phenomena = set()

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.in_table = True
        elif tag == "tr":
            self.in_tr = True
            self.current_row = []
        elif tag == "td":
            self.in_td = True
            self.current_cell_content = ""

    def handle_endtag(self, tag):
        if tag == "table":
            self.in_table = False
        elif tag == "tr":
            self.in_tr = False
            # The 3rd column (index 2) is "Phénomène naturel"
            # We skip rows that don't have at least 3 columns (like header rows or malformed ones)
            if len(self.current_row) >= 3:
                val = self.current_row[2].strip()
                # Skip the header string itself if it's there
                if val and val.lower() != "phénomène naturel":
                    self.phenomena.add(val)
        elif tag == "td":
            self.in_td = False
            self.current_row.append(self.current_cell_content)

    def handle_data(self, data):
        if self.in_td:
            self.current_cell_content += data

def get_token():
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "openid" # scope used in diag_legifrance.py successful attempts
    }
    response = requests.post(AUTH_URL, data=payload)
    response.raise_for_status()
    return response.json()["access_token"]

def fetch_decree(token, nor):
    url = f"{API_BASE_URL}/consult/getJoWithNor"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-IBM-Client-Id": CLIENT_ID
    }
    payload = {"nor": nor}
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

def extract_content(node):
    """Recursively extract 'content' fields from the JSON structure."""
    contents = []
    if isinstance(node, dict):
        if "content" in node and node["content"]:
            contents.append(node["content"])
        for k, v in node.items():
            contents.extend(extract_content(v))
    elif isinstance(node, list):
        for item in node:
            contents.extend(extract_content(item))
    return contents

def main():
    if len(sys.argv) < 2:
        print("Usage: ./fetch_catnat_phenomena.py <NOR>")
        sys.exit(1)
    
    nor = sys.argv[1]
    
    try:
        token = get_token()
        data = fetch_decree(token, nor)
        
        # Gather all HTML content strings from the JSON response
        all_html = extract_content(data)
        
        parser = CatNatTableParser()
        for html_snippet in all_html:
            parser.feed(html_snippet)
        
        if parser.phenomena:
            print(json.dumps(sorted(list(parser.phenomena)), indent=2, ensure_ascii=False))
        else:
            print(f"No phenomena found for NOR {nor}.")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
