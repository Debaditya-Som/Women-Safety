from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportSchema(BaseModel):
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

    class Config:
        orm_mode = True


class Coordinates(BaseModel):
    latitude: float
    longitude: float

class HospitalSchema(BaseModel):
    id: str
    name: str
    coordinates: Coordinates

class PoliceSchema(BaseModel):
    id: str
    name: str
    coordinates: Coordinates