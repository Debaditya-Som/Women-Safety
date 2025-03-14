import json
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

# Bounding box for locations in West Bengal
latitude_range = (21.5, 27.0)
longitude_range = (85.5, 89.0)

# Types of harassment
harassment_types = [
    "verbal", "physical", "cyber", "stalking", "workplace", "public transport",
    "domestic", "online abuse", "blackmail", "unwanted advances"
]

# Severity levels
severity_levels = ["low", "medium", "high", "critical"]

# Realistic witness statements
witness_statements = [
    "A bystander called for help.",
    "Two people saw the incident but didn't intervene.",
    "A passerby recorded the incident on their phone.",
    "An eyewitness gave a description of the suspect.",
    "Nearby shopkeepers confirmed the altercation.",
    "Multiple people reported hearing verbal threats.",
    "A security guard intervened and reported it.",
    "A neighbor witnessed the harassment and called the police."
]

# Function to generate random dates and times
def random_date():
    start_date = datetime(2024, 1, 1)
    random_days = random.randint(0, 365)
    random_time = timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return (start_date + timedelta(days=random_days)).strftime("%Y-%m-%dT00:00:00"), f"{random_time.seconds // 3600:02}:{(random_time.seconds % 3600) // 60:02}"

# Generate 100 reports
reports = []
for _ in range(100):
    date, time = random_date()
    has_witnesses = random.choice(["yes", "no"])
    report = {
        "type": "harassment",
        "severity": random.choice(severity_levels),
        "description": f"A case of {random.choice(harassment_types)} harassment reported.",
        "date": date,
        "time": time,
        "isAnonymous": random.choice(["yes", "no"]),
        "contactInfo": fake.email() if random.choice([True, False]) else "N/A",
        "hasWitnesses": has_witnesses,
        "witnessInfo": random.choice(witness_statements) if has_witnesses == "yes" else "No witnesses present.",
        "latitude": round(random.uniform(*latitude_range), 15),
        "longitude": round(random.uniform(*longitude_range), 15)
    }
    reports.append(report)

# Save to a JSON file
data = {"reports": reports}
with open("harassment_reports.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print("100 harassment reports generated and saved to 'harassment_reports.json'.")
