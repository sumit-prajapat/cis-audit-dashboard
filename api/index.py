"""
Vercel Serverless Function Entry Point
This file makes the FastAPI backend work on Vercel
"""
import sys
import os

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import the FastAPI app from backend/main.py
from main import app

# Export the app for Vercel
# Vercel will wrap this in its own handler
handler = app
