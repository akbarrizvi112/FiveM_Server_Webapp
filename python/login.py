from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database_handler import players_collection
import main

router = APIRouter()

class LoginData(BaseModel):
    identifier: str
    password: str

@router.post("/login")
async def login_user(data: LoginData):
    player = players_collection.find_one({
        "identifier": data.identifier,
        "password": data.password
    })

    if not player:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    main.playerIdentifier = data.identifier

    player["_id"] = str(player["_id"])
    return {"message": "Login successful", "user": player}


@router.post("/logout")
async def logout_user():
    main.playerIdentifier = None
    return {"message": "Logged out"}