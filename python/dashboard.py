from fastapi import APIRouter, HTTPException
from database_handler import players_collection
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import main

router = APIRouter()

class ActivityItem(BaseModel):
    text: str
    time: str
    type: str

class PlayerData(BaseModel):
    identifier: str
    name: str
    level: int
    xp: int
    xp_max: int
    health: int
    armor: int
    stamina: int
    recent_activity: Optional[List[ActivityItem]] = []

@router.get("/api/player", response_model=PlayerData)
def get_player():
    player = players_collection.find_one({"identifier": main.playerIdentifier})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    raw_activity = player.get("recent_activity", [])

    recent_activity = []
    for item in raw_activity:
        recent_activity.append({
            "type": item.get("type", ""),
            "text": item.get("text", ""),
            "time": item.get("time").isoformat() if isinstance(item.get("time"), datetime) else str(item.get("time", ""))
        })
    
    return PlayerData(
        identifier=player["identifier"],
        name=player["name"],
        level=player["level"],
        xp=player["xp"],
        xp_max=player.get("xp_max", 10000),
        health=player["health"],
        armor=player["armor"],
        stamina=player["stamina"],
        recent_activity=recent_activity
    )
