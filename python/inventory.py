from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from database_handler import inventory_collection
import main

router = APIRouter()

class Item(BaseModel):
    name: str
    quantity: int
    description: str
    weight: float
    price: int
    category: str

class InventoryData(BaseModel):
    identifier: str
    items: List[Item]

@router.get("/api/inventory", response_model=InventoryData)
def get_inventory():
    record = inventory_collection.find_one({"identifier": main.playerIdentifier})
    if not record:
        raise HTTPException(status_code=404, detail="Inventory not found")

    return InventoryData(
        identifier=record["identifier"],
        items=record.get("items", [])
    )

class UpdateItemRequest(BaseModel):
    itemName: str

@router.post("/api/inventory/use-item")
async def use_item(data: UpdateItemRequest):
    player = inventory_collection.find_one({"identifier": main.playerIdentifier})
    if not player:
        return JSONResponse(content={"error": "Player not found"}, status_code=404)

    items = player.get("items", [])
    updated_items = []
    item_found = False

    for item in items:
        if item["name"] == data.itemName:
            item_found = True
            if item["quantity"] > 1:
                item["quantity"] -= 1
                updated_items.append(item)
        else:
            updated_items.append(item)

    if not item_found:
        return JSONResponse(content={"error": "Item not found"}, status_code=404)

    inventory_collection.update_one(
        {"identifier": main.playerIdentifier},
        {"$set": {"items": updated_items}}
    )

    return JSONResponse(content={"message": "Item used"}, status_code=200)