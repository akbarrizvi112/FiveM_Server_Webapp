import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database_handler import vehicles_collection

sample_vehicle = {
  "identifier": "2023F-BSE-231",
  "vehicles": [
    {
      "name": "Sultan RS",
      "plate": "ABC123",
      "location": "Los Santos Garage",
      "condition": "Good",
      "fuel": 78,
      "insurance": "Active",
      "availability": "available"
    },
    {
      "name": "Banshee 900R",
      "plate": "XYZ999",
      "location": "Paleto Bay Garage",
      "condition": "Damaged",
      "fuel": 25,
      "insurance": "Active",
      "availability": "in-use"
    },
    {
      "name": "Banshee 900R",
      "plate": "XYZ123",
      "location": "Paleto Bay Garage",
      "condition": "Damaged",
      "fuel": 25,
      "insurance": "Clain Filed",
      "availability": "repair"
    }
  ]
}

result = vehicles_collection.update_one(
    {"identifier": sample_vehicle["identifier"]},
    {"$set": sample_vehicle},
    upsert=True
)
print("Inserted ID:", result.upserted_id)