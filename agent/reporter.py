"""
reporter.py
Sends scan results from the agent to the FastAPI backend.
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("API_URL", "http://localhost:8000")


def send_results(device: dict, results: list) -> bool:
    """
    POST scan results to the backend API.
    Returns True if successful, False if it failed.
    """
    payload = {
        "device": device,
        "results": results,
    }

    try:
        response = requests.post(
            f"{API_URL}/api/scans",
            json=payload,
            timeout=15,
        )
        if response.status_code == 201:
            data = response.json()
            print(f"  ✅ Scan saved — ID: {data['id']}  Score: {data['score']}%")
            return True
        else:
            print(f"  ❌ API returned {response.status_code}: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("  ❌ Cannot connect to API. Is Docker running? (docker-compose up)")
        return False
    except requests.exceptions.Timeout:
        print("  ❌ API request timed out.")
        return False
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        return False
