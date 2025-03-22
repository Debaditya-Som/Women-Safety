from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.models import Report
from app.schemas import ReportSchema, HospitalSchema

MONGO_DETAILS = "mongodb://localhost:27017"
client = None
database = None
report_collection = None
hospital_collection = None
police_collection = None  


async def connect_to_mongo():
    global client, database, report_collection, hospital_collection, police_collection 

    client = AsyncIOMotorClient(MONGO_DETAILS)

    database = client.incident_reporting
    report_collection = database.get_collection("reports")

    safety_resources_db = client.safety_resources  
    hospital_collection = safety_resources_db.get_collection("Hospitals")
    police_collection = safety_resources_db.get_collection("Police") 

async def close_mongo_connection():
    client.close()

async def add_report(report: ReportSchema) -> ReportSchema:
    report = await report_collection.insert_one(report.dict())
    new_report = await report_collection.find_one({"_id": report.inserted_id})
    return new_report

async def retrieve_reports():
    reports = []
    async for report in report_collection.find():
        reports.append(report)
    return reports

async def retrieve_hospitals():
    hospitals = []
    async for hospital in hospital_collection.find():
        hospitals.append({
            "id": str(hospital["_id"]),
            "name": hospital.get("name", "Unknown"),
            "coordinates": hospital.get("coordinates", {})
        })
    return hospitals

async def retrieve_police_stations():
    polices = []
    async for police in police_collection.find():
        polices.append({
            "id": str(police["_id"]),
            "name": police.get("name", "Unknown"),
            "coordinates": police.get("coordinates", {})
        })
    return polices
