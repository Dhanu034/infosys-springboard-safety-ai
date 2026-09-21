from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ReportCommonEnvelope(BaseModel):
    project_id: str
    project_name: str
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    has_data: bool = False
    records_count: int = 0
    generated_at: datetime = datetime.utcnow()
    data_sources: List[str] = []
    disclaimers: List[str] = []
    metrics: Dict[str, Any] = {}

class ReportAuditLogResponse(BaseModel):
    log_id: str
    project_id: str
    report_type: str
    user_role: str
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    export_format: str
    generated_at: datetime

    class Config:
        from_attributes = True
