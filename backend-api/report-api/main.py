from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
try:
    from database import reports_collection
except ImportError:
    raise ImportError("The 'database' module could not be found. Ensure it is available in your project.")
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Pydantic Model for Input Validation
class ReportCreate(BaseModel):
    type: str
    description: str
    date: str
    latitude: float
    longitude: float

# Convert MongoDB Document to JSON
def report_serializer(report) -> dict:
    return {
        "id": str(report["_id"]),
        "type": report["type"],
        "description": report["description"],
        "date": report["date"],
        "latitude": report["latitude"],
        "longitude": report["longitude"],
    }

# POST: Submit a Report
@app.post("/api/report/")
async def create_report(report: ReportCreate):
    report_dict = report.dict()
    result = await reports_collection.insert_one(report_dict)
    return {"message": "Report submitted successfully!", "report_id": str(result.inserted_id)}

# GET: Fetch All Reports
@app.get("/api/reports/")
async def get_reports():
    reports = await reports_collection.find().to_list(100)
    return [report_serializer(report) for report in reports]

# GET: Fetch a Single Report by ID
@app.get("/api/report/{report_id}")
async def get_report(report_id: str):
    report = await reports_collection.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_serializer(report)
