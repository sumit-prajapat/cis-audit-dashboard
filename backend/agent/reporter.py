"""
reporter.py
Sends scan results from the agent to the FastAPI backend.
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("CIS_API_URL", "http://localhost:8000").rstrip("/")
AUTH_TOKEN = os.getenv("CIS_AUTH_TOKEN")


def get_api_url() -> str:
    return os.getenv("CIS_API_URL", API_URL).rstrip("/")


def login_for_token(email: str, password: str, remember_me: bool = True) -> str | None:
    """Log in to the dashboard API and return an access token."""
    try:
        response = requests.post(
            f"{get_api_url()}/auth/login",
            data={
                "username": email,
                "password": password,
                "remember_me": str(remember_me).lower(),
            },
            timeout=15,
        )
        if response.status_code == 200:
            return response.json().get("access_token")

        print(f"  API login failed {response.status_code}: {response.text}")
        return None
    except requests.exceptions.ConnectionError:
        print("  Cannot connect to API. Is Docker running? (docker-compose up)")
        return None
    except requests.exceptions.Timeout:
        print("  API login request timed out.")
        return None
    except Exception as e:
        print(f"  Unexpected login error: {e}")
        return None


def send_results(device: dict, results: list, token: str | None = None) -> bool:
    """
    POST scan results to the backend API.
    Returns True if successful, False if it failed.
    """
    payload = {
        "device": device,
        "results": results,
    }

    auth_token = token or AUTH_TOKEN

    if not auth_token:
        print("  No auth token provided. Log in with --email/--password or pass --token.")
        return False

    headers = {"Authorization": f"Bearer {auth_token}"}

    try:
        response = requests.post(
            f"{get_api_url()}/api/scans",
            json=payload,
            headers=headers,
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
