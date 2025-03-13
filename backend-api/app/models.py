from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Report(BaseModel):
    type: str
    severity: str
    description: str
    date: datetime
    time: str
    isAnonymous: str
    contactInfo: Optional[str] = None
    hasWitnesses: str
    witnessInfo: Optional[str] = None
    latitude: float
    longitude: float