import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
    YOLO_CONFIDENCE_THRESHOLD: float = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.70"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./safety_intelligence.db")
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    N8N_SAFETY_WEBHOOK_URL: str = os.getenv("N8N_SAFETY_WEBHOOK_URL", "")
    N8N_SHARED_SECRET: str = os.getenv("N8N_SHARED_SECRET", "")

    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    RESULTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results")
    DOCUMENTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "documents")
    MAX_DOCUMENT_SIZE_MB: int = int(os.getenv("MAX_DOCUMENT_SIZE_MB", "15"))
    TESSERACT_CMD_PATH: str = os.getenv("TESSERACT_CMD_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

settings = Settings()

# Ensure uploads, results, and documents directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)

