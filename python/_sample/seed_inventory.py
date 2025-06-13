import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database_handler import inventory_collection

sample_inventory = {
    "identifier": "2023F-BSE-203",
    "items": [
        {
            "name": "AK-47",
            "quantity": 1,
            "description": "Assault rifle with high damage",
            "weight": 4.8,
            "price": 2500,
            "category": "weapons"
        },
        {
            "name": "Bandage",
            "quantity": 5,
            "description": "Stops bleeding and restores a little health",
            "weight": 0.2,
            "price": 30,
            "category": "medical"
        },
        {
            "name": "Toolbox",
            "quantity": 1,
            "description": "Contains basic repair tools",
            "weight": 3.0,
            "price": 150,
            "category": "tools"
        },
        {
            "name": "GPS Tracker",
            "quantity": 2,
            "description": "Track vehicles in real time",
            "weight": 0.5,
            "price": 400,
            "category": "misc"
        }
    ]
}

result = inventory_collection.update_one(
    {"identifier": sample_inventory["identifier"]},
    {"$set": sample_inventory},
    upsert=True
)
print("Inserted ID:", result.upserted_id)