import os
import shutil
import sqlite3
import datetime

def backup():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(backend_dir)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Check backend db
    backend_db = os.path.join(backend_dir, "safety_intelligence.db")
    root_db = os.path.join(root_dir, "safety_intelligence.db")
    
    backups_made = []
    
    for db_path in [backend_db, root_db]:
        if os.path.exists(db_path):
            backup_path = db_path.replace(".db", f"_backup_pre_m3_{timestamp}.db")
            static_backup_path = db_path.replace(".db", "_backup_pre_m3.db")
            shutil.copy2(db_path, backup_path)
            shutil.copy2(db_path, static_backup_path)
            backups_made.append((db_path, backup_path, static_backup_path))
            
            # Inspect tables
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]
            
            print(f"[Backup] Database found at: {db_path}")
            print(f"         Timestamped Backup: {backup_path}")
            print(f"         Static Backup:      {static_backup_path}")
            print(f"         Existing Tables:    {tables}")
            for t in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {t}")
                count = cursor.fetchone()[0]
                print(f"           - {t}: {count} rows")
            conn.close()
            print()
            
    if not backups_made:
        print("[Backup Error] No safety_intelligence.db found to back up!")
    else:
        print(f"[Backup Success] Successfully created {len(backups_made)} backup(s).")

if __name__ == "__main__":
    backup()
