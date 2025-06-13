from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from database_handler import vehicles_collection
import main
import random
import string

router = APIRouter()

@router.get("/api/vehicles")
def get_all_vehicles():
    player = vehicles_collection.find_one({"identifier": main.playerIdentifier})
    if not player:
        return {"vehicles": []}
    
    return JSONResponse(content={"vehicles": player["vehicles"]})

class VehicleDeleteRequest(BaseModel):
    plate: str

@router.post("/api/vehicles/delete")
def delete_vehicle(data: VehicleDeleteRequest):
    result = vehicles_collection.update_one(
        {"identifier": main.playerIdentifier},
        {"$pull": {"vehicles": {"plate": data.plate}}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found or already removed")

    return {"message": "Vehicle deleted successfully"}


class AddVehicleRequest(BaseModel):
    name: str
    price: int

def generate_plate():
    return ''.join(random.choices(string.ascii_uppercase, k=3)) + ''.join(random.choices(string.digits, k=3))

def random_availability():
    return random.choice(["available", "in-use", "repair"])

@router.post("/api/vehicles/add")
async def add_vehicle(data: AddVehicleRequest):
    plate = generate_plate()
    availability = random_availability()
    new_vehicle = {
        "name": data.name,
        "plate": plate,
        "location": "Default Garage",
        "condition": "Good",
        "fuel": 100,
        "insurance": True,
        "availability": availability
    }

    vehicles_collection.update_one(
        {"identifier": main.playerIdentifier},
        {"$push": {"vehicles": new_vehicle}},
        upsert=True
    )

    return JSONResponse(content={"message": "Vehicle added", "plate": plate}, status_code=200)