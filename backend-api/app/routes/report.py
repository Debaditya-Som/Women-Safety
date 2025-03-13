from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Report
from app.schemas import ReportSchema
from app.database import add_report, retrieve_reports

router = APIRouter()

@router.post("/", response_model=ReportSchema)
async def create_report(report: ReportSchema):
    new_report = await add_report(report)
    if new_report:
        return new_report
    raise HTTPException(status_code=400, detail="Something went wrong")

@router.get("/", response_model=List[ReportSchema])
async def get_reports():
    reports = await retrieve_reports()
    return reports