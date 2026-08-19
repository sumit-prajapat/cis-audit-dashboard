#!/usr/bin/env python3
"""Generate secure secret key for production"""
import secrets

if __name__ == "__main__":
    secret = secrets.token_urlsafe(64)
    print(f"\nGenerated SECRET_KEY:\n{secret}\n")
    print("Add this to your .env file:")
    print(f"SECRET_KEY={secret}\n")
