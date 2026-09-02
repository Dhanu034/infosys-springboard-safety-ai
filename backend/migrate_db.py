import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "safety_intelligence.db")
print(f"Checking SQLite database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing columns in safety_alerts
cursor.execute("PRAGMA table_info(safety_alerts)")
columns = [row[1] for row in cursor.fetchall()]
print("Existing columns in safety_alerts:", columns)

new_columns = [
    ("automation_status", "VARCHAR(50) DEFAULT 'Not Configured'"),
    ("automation_attempted_at", "DATETIME"),
    ("automation_response_code", "INTEGER"),
    ("automation_response_message", "TEXT"),
    ("automation_last_error", "TEXT"),
    ("delivery_channel", "VARCHAR(50) DEFAULT 'None'")
]

for col_name, col_type in new_columns:
    if col_name not in columns:
        try:
            cursor.execute(f"ALTER TABLE safety_alerts ADD COLUMN {col_name} {col_type}")
            print(f"Added column: {col_name}")
        except Exception as e:
            print(f"Error adding {col_name}: {e}")
    else:
        print(f"Column already exists: {col_name}")

conn.commit()
conn.close()
print("Database schema migration completed successfully!")
