from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import dashboard
import inventory
import signup
import login
import admin
import vehicles
import os

playerIdentifier = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount("/css", StaticFiles(directory=os.path.join(BASE_DIR, "../css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, "../js")), name="js")
app.mount("/images", StaticFiles(directory="../web/images"), name="images")

# Serve Root
@app.get("/")
def serve_root():
    file_path = os.path.join(BASE_DIR, "../web/login.html")
    return FileResponse(file_path)

@app.get("/login.html")
def serve_login():
    file_path = os.path.join(BASE_DIR, "../web/login.html")
    return FileResponse(file_path)

@app.get("/signup.html")
def serve_signup():
    file_path = os.path.join(BASE_DIR, "../web/signup.html")
    return FileResponse(file_path)

@app.get("/dashboard.html")
def serve_dashboard():
    file_path = os.path.join(BASE_DIR, "../web/dashboard.html")
    return FileResponse(file_path)

@app.get("/inventory.html")
def serve_inventory():
    file_path = os.path.join(BASE_DIR, "../web/inventory.html")
    return FileResponse(file_path)

@app.get("/vehicles.html")
def serve_vehicles():
    file_path = os.path.join(BASE_DIR, "../web/vehicles.html")
    return FileResponse(file_path)

@app.get("/admin.html")
def serve_admin():
    file_path = os.path.join(BASE_DIR, "../web/admin.html")
    return FileResponse(file_path)

# API routes
app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(signup.router)
app.include_router(login.router)
app.include_router(admin.router)
app.include_router(vehicles.router)