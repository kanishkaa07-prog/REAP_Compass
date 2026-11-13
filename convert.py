import pandas as pd
import json

file = "rajasthan_colleges_MOCK_dataset_final.xlsx"
sheets = pd.read_excel(file, sheet_name=None)

data = {}
for name, df in sheets.items():
    df = df.fillna("")
    df["confidence"] = "Mock"
    data[name.lower()] = df.to_dict(orient="records")

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done! Sheets:", list(data.keys()))