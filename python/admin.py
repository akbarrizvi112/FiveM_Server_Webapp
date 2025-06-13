from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database_handler import players_collection, inventory_collection, vehicles_collection
import main

router = APIRouter()

class PlayerStatusUpdate(BaseModel):
    name: str
    status: str

@router.get("/api/getTotalPlayers")
async def get_all_players():
    players = list(players_collection.find({}, {"_id": 0, "name": 1, "identifier": 1, "level": 1, "status": 1}))
    return players


@router.get("/api/getTotalItems")
async def get_all_items():
    total_quantity = 0
    inventories = inventory_collection.find()

    for player in inventories:
        items = player.get("items", [])
        for item in items:
            quantity = item.get("quantity", 0)
            total_quantity += quantity

    return {"total_quantity": total_quantity}


@router.get("/api/total-vehicle-count")
def get_total_vehicle_count():
    pipeline = [
        {"$project": {"vehicleCount": {"$size": "$vehicles"}}},
        {"$group": {"_id": None, "total": {"$sum": "$vehicleCount"}}}
    ]

    result = list(vehicles_collection.aggregate(pipeline))
    total = result[0]["total"] if result else 0
    return {"totalVehicles": total}


@router.get("/api/check-admin")
def check_admin():
    user = players_collection.find_one({"identifier": main.playerIdentifier})
    if user and user.get("isAdmin"):
        return {"admin": True}
    return {"admin": False}


@router.post("/api/player/update-status")
async def update_player_status(data: PlayerStatusUpdate):
    result = players_collection.update_one({"name": data.name}, {"$set": {"status": data.status}})

    return {"updated": result.modified_count}