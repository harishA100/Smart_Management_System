from app.database.connection import Base
import pkgutil
import importlib
import app.models

for loader, module_name, is_pkg in pkgutil.iter_modules(app.models.__path__):
    importlib.import_module(f"app.models.{module_name}")

for table_name, table in Base.metadata.tables.items():
    print(f"--- Table: {table_name} ---")
    for column in table.columns:
        print(f"  - {column.name}: {column.type}")
    print()
