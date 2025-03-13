from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import report
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

app.include_router(report.router, prefix="/api/report", tags=["report"])