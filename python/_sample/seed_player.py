import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database_handler import players_collection
from datetime import datetime

player_data = {
    "identifier": "2023F-BSE-231",
    "name": "Zayed Iqbal",
    "level": 0,
    "xp": 0,
    "xp_max": 10000,
    "health": 100,
    "armor": 50,
    "stamina": 100,
    "isAdmin": False,
    "recent_activity": [
        {
            "text": "Completed a mission in downtown Los Santos",
            "time": datetime.now(),
            "type": "mission"
        },
        {
            "text": "Purchased armor at Ammu-Nation",
            "time": datetime.now(),
            "type": "purchase"
        },
        {
            "text": "Joined the server",
            "time": datetime.now(),
            "type": "login"
        }
    ]
}

result = players_collection.insert_one(player_data)
print("Inserted ID:", result.inserted_id)
