from fastapi import APIRouter, HTTPException
from typing import List
from app.database import retrieve_police_stations
from app.schemas import PoliceSchema

router = APIRouter()

@router.get("/", response_model=List[PoliceSchema])
async def get_police_stations():
    police_stations = await retrieve_police_stations()
    if police_stations:
        return police_stations
    raise HTTPException(status_code=404, detail="No police stations found")
