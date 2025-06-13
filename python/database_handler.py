from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

MONGO_URI = "mongodb+srv://admin:admin@cluster0.ja7op90.mongodb.net/?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB Atlas")
except ConnectionFailure as e:
    print("❌ MongoDB connection failed:", e)

db = client["db_project"]
players_collection = db["players"]
inventory_collection = db["inventory"]
vehicles_collection = db["vehicles"]
