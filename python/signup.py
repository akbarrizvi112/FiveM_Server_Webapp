from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from database_handler import players_collection, inventory_collection

router = APIRouter()

class SignupData(BaseModel):
    firstName: str
    lastName: str
    identifier: str
    password: str

@router.post("/signup")
async def signup(data: SignupData):
    player_data = {
        "identifier": data.identifier,
        "name": f"{data.firstName} {data.lastName}",
        "password": data.password,
        "level": 0,
        "xp": 0,
        "xp_max": 10000,
        "health": 100,
        "armor": 50,
        "stamina": 100,
        "isAdmin": False,
        "status": "online",
        "recent_activity": [
            {
                "text": "Joined the server",
                "time": datetime.now(),
                "type": "login"
            },
            {
                "text": "Got Starting Money",
                "time": datetime.now(),
                "type": "purchase"
            },
            {
                "text": "Character created successfully",
                "time": datetime.now(),
                "type": "mission"
            },
        ]
    }

    sample_inventory = {
        "identifier": "2023F-BSE-231",
        "items": [
            {
                "name": "Pistol",
                "quantity": 1,
                "description": "Pistol for self defense",
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

    players_collection.insert_one(player_data)

    result = inventory_collection.update_one(
        {"identifier": sample_inventory["identifier"]},
        {"$set": sample_inventory},
        upsert=True
    )
    print("Inserted ID:", result.upserted_id)
    
    return {"message": "Signup successful"}
