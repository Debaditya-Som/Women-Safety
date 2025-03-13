from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.models import Report
from app.schemas import ReportSchema

MONGO_DETAILS = "mongodb://localhost:27017"
client = None
database = None
report_collection = None

async def connect_to_mongo():
    global client, database, report_collection
    client = AsyncIOMotorClient(MONGO_DETAILS)
    database = client.incident_reporting
    report_collection = database.get_collection("reports")

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