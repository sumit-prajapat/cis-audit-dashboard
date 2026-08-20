"""
Vercel Serverless Function Entry Point
This file makes the FastAPI backend work on Vercel
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app from backend/main.py
from main import app

# Vercel will use this app
# No need for additional configuration
