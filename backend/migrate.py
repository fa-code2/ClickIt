import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "microgov.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column(table, column, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        print(f"Added {column} to {table}")
    except Exception as e:
        print(f"{table}.{column}: {e}")

# Users
add_column("users", "city", "TEXT DEFAULT 'Metro City'")
add_column("users", "ward", "TEXT DEFAULT 'Ward 14 (North Zone)'")
add_column("users", "zip_code", "TEXT DEFAULT '713303'")
add_column("users", "representative", "TEXT DEFAULT 'Councilor Priya Sharma (Ward 14)'")

# Complaints
add_column("complaints", "user_name", "TEXT DEFAULT 'Active Citizen'")
add_column("complaints", "city", "TEXT DEFAULT 'Metro City'")
add_column("complaints", "ward", "TEXT DEFAULT 'Ward 14 (North Zone)'")
add_column("complaints", "local_authority", "TEXT")
add_column("complaints", "routing_status", "TEXT DEFAULT 'ROUTED'")
add_column("complaints", "routing_notes", "TEXT")
add_column("complaints", "upvotes", "INTEGER DEFAULT 0")
add_column("complaints", "downvotes", "INTEGER DEFAULT 0")

# Work Orders
add_column("work_orders", "resolution_notes", "TEXT")

conn.commit()
conn.close()

from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print("Migration and table creation complete!")
