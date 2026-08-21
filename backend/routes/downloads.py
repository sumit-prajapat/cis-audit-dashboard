"""
Download routes for CIS scanner launchers.
Serves portable executables for Windows and Linux.
"""

import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

# Path to downloads directory
DOWNLOADS_DIR = Path(__file__).parent.parent / "downloads"


@router.get("/downloads/cis-scanner-windows.exe")
async def download_windows_launcher(token: str = Query(None)):
    """
    Download Windows launcher executable.
    Token parameter is optional and embedded in filename for auto-auth.
    """
    file_path = DOWNLOADS_DIR / "cis-scanner-windows.exe"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Windows launcher not found. Please build it first.")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename="cis-scanner-windows.exe",
        headers={
            "Content-Disposition": "attachment; filename=cis-scanner-windows.exe",
            "X-Content-Type-Options": "nosniff",
        }
    )


@router.get("/downloads/cis-scanner-linux")
async def download_linux_launcher(token: str = Query(None)):
    """
    Download Linux launcher executable.
    Token parameter is optional and embedded in filename for auto-auth.
    """
    file_path = DOWNLOADS_DIR / "cis-scanner-linux"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Linux launcher not found. Build on Linux system.")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename="cis-scanner-linux",
        headers={
            "Content-Disposition": "attachment; filename=cis-scanner-linux",
            "X-Content-Type-Options": "nosniff",
        }
    )


@router.get("/downloads/info")
async def get_download_info():
    """
    Get information about available downloads.
    """
    windows_exists = (DOWNLOADS_DIR / "cis-scanner-windows.exe").exists()
    linux_exists = (DOWNLOADS_DIR / "cis-scanner-linux").exists()
    
    windows_size = 0
    linux_size = 0
    
    if windows_exists:
        windows_size = (DOWNLOADS_DIR / "cis-scanner-windows.exe").stat().st_size
    
    if linux_exists:
        linux_size = (DOWNLOADS_DIR / "cis-scanner-linux").stat().st_size
    
    return {
        "windows": {
            "available": windows_exists,
            "filename": "cis-scanner-windows.exe",
            "size_bytes": windows_size,
            "size_mb": round(windows_size / 1024 / 1024, 2) if windows_size > 0 else 0,
            "download_url": "/downloads/cis-scanner-windows.exe"
        },
        "linux": {
            "available": linux_exists,
            "filename": "cis-scanner-linux",
            "size_bytes": linux_size,
            "size_mb": round(linux_size / 1024 / 1024, 2) if linux_size > 0 else 0,
            "download_url": "/downloads/cis-scanner-linux"
        }
    }
