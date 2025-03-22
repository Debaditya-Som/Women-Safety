from fastapi import APIRouter, HTTPException
from typing import List
from app.database import retrieve_hospitals
from app.schemas import HospitalSchema

router = APIRouter()

@router.get("/", response_model=List[HospitalSchema])
async def get_hospitals():
    hospitals = await retrieve_hospitals()
    if not hospitals:
        raise HTTPException(status_code=404, detail="No hospitals found")
    return hospitals
