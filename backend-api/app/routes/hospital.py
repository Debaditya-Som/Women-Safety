from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.database import retrieve_hospitals
from app.schemas import HospitalSchema
from app.database import search_hospital_by_name

router = APIRouter()

@router.get("/", response_model=List[HospitalSchema])
async def get_hospitals():
    hospitals = await retrieve_hospitals()
    if not hospitals:
        raise HTTPException(status_code=404, detail="No hospitals found")
    return hospitals

@router.get("/search")
async def search_hospital(name: str = Query(..., min_length=1)):
    hospital = await search_hospital_by_name(name)
    
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    return hospital
