import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from app.main import app

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(backend_dir, "app")
    print("[BuildSure AI] Starting FastAPI Server on http://127.0.0.1:8000 with Auto-Reload on app/ ...", flush=True)
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[app_dir],
        reload_includes=["*.py"],
        log_level="info"
    )
