import csv
import glob
import os

files = glob.glob('backend/data/supermarket/*.csv')
for f in files:
    with open(f, encoding='utf-8') as file:
        reader = csv.reader(file)
        try:
            headers = next(reader)
            print(f"--- {os.path.basename(f)} ---")
            print(headers)
            print()
        except StopIteration:
            pass
