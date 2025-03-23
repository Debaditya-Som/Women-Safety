# from fastapi import APIRouter, HTTPException
# from typing import List
# from app.models import Report
# from app.schemas import ReportSchema
# from app.database import add_report, retrieve_reports

# router = APIRouter()

# @router.post("/", response_model=ReportSchema)
# async def create_report(report: ReportSchema):
#     new_report = await add_report(report)
#     if new_report:
#         return new_report
#     raise HTTPException(status_code=400, detail="Something went wrong")

# @router.get("/", response_model=List[ReportSchema])
# async def get_reports():
#     reports = await retrieve_reports()
#     return reports


import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter()


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))  
REPORTS_FILE_PATH = os.path.join(BASE_DIR, "frontend", "public", "harassment_reports.json")

def load_reports():
    """Load existing reports from the JSON file."""
    if os.path.exists(REPORTS_FILE_PATH):
        with open(REPORTS_FILE_PATH, "r", encoding="utf-8") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return {"reports": []}
    return {"reports": []}

def save_reports(reports):
    """Save reports to the JSON file."""
    with open(REPORTS_FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(reports, file, indent=4)

@router.post("/")
async def submit_report(report: dict):
    try:
        reports_data = load_reports()
        reports_data["reports"].append(report)
        save_reports(reports_data)
        return {"message": "Report submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_reports():
    """
    Retrieve all stored harassment reports.
    """
    try:
        with open(REPORTS_FILE_PATH, "r") as f:
            data = json.load(f)
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))