"""
Build standalone executable launchers for Windows and Linux.
Uses PyInstaller to create portable, one-click scanners.

Usage:
  python build_launcher.py --windows
  python build_launcher.py --linux
  python build_launcher.py --all
"""

import os
import sys
import subprocess
import argparse
import shutil
from pathlib import Path


def check_pyinstaller():
    """Check if PyInstaller is installed."""
    try:
        import PyInstaller
        return True
    except ImportError:
        return False


def install_pyinstaller():
    """Install PyInstaller."""
    print("📦 Installing PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    print("✅ PyInstaller installed!")


def build_windows():
    """Build Windows executable."""
    print("\n" + "="*60)
    print("🏗️  Building Windows Launcher...")
    print("="*60)
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",  # Single executable
        "--console",  # Keep console window so user can see progress
        "--name", "cis-scanner-windows",
        "--icon", "NONE",  # Add icon later if available
        "--add-data", "checks;checks",  # Include checks folder
        "--clean",
        "launcher.py"
    ]
    
    try:
        subprocess.check_call(cmd)
        print("\n✅ Windows launcher built successfully!")
        print(f"📂 Location: dist/cis-scanner-windows.exe")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed: {e}")
        return False


def build_linux():
    """Build Linux executable."""
    print("\n" + "="*60)
    print("🏗️  Building Linux Launcher...")
    print("="*60)
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",  # Single executable
        "--console",  # Keep console
        "--name", "cis-scanner-linux",
        "--add-data", "checks:checks",  # Include checks folder (Linux syntax)
        "--clean",
        "launcher.py"
    ]
    
    try:
        subprocess.check_call(cmd)
        print("\n✅ Linux launcher built successfully!")
        print(f"📂 Location: dist/cis-scanner-linux")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed: {e}")
        return False


def create_portable_package():
    """Create a portable ZIP package with launcher and token file."""
    print("\n" + "="*60)
    print("📦 Creating Portable Package...")
    print("="*60)
    
    dist_dir = Path("dist")
    if not dist_dir.exists():
        print("❌ No dist folder found. Build executables first!")
        return
    
    # Create README for portable package
    readme = """
CIS AUDIT QUICK SCANNER
========================

This is a portable CIS compliance scanner.

QUICK START:
------------
1. Run the executable (cis-scanner-windows.exe or cis-scanner-linux)
2. Follow on-screen instructions
3. View results in your dashboard

AUTHENTICATION:
---------------
Option 1: Download from Dashboard (Recommended)
  - Launcher auto-authenticates using your session
  
Option 2: Set Token Manually
  - Create a file named ".cis-token" in same folder
  - Paste your access token into that file
  - Run launcher

Option 3: Environment Variable
  - Set CIS_TOKEN environment variable
  - Run launcher

Option 4: Command Line
  - Run: cis-scanner-windows.exe --token YOUR_TOKEN

SUPPORT:
--------
Dashboard: https://cis-audit-dashboard.vercel.app
Documentation: See USER_GUIDE.md
"""
    
    # Write README
    with open(dist_dir / "README.txt", "w", encoding="utf-8") as f:
        f.write(readme)
    
    # Create empty token file template
    with open(dist_dir / ".cis-token.example", "w", encoding="utf-8") as f:
        f.write("# Paste your access token here (one line)\n")
        f.write("# Get token from: Dashboard Settings API Access\n")
    
    print("✅ Portable package files created!")
    print(f"📂 Location: {dist_dir}")


def clean_build_files():
    """Clean up build artifacts."""
    print("\n🧹 Cleaning build artifacts...")
    
    dirs_to_remove = ["build", "__pycache__"]
    files_to_remove = ["*.spec"]
    
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"  Removed: {dir_name}/")
    
    import glob
    for pattern in files_to_remove:
        for file in glob.glob(pattern):
            os.remove(file)
            print(f"  Removed: {file}")
    
    print("✅ Cleanup complete!")


def main():
    parser = argparse.ArgumentParser(description="Build CIS Audit Launcher executables")
    parser.add_argument("--windows", action="store_true", help="Build Windows executable")
    parser.add_argument("--linux", action="store_true", help="Build Linux executable")
    parser.add_argument("--all", action="store_true", help="Build for all platforms")
    parser.add_argument("--clean", action="store_true", help="Clean build artifacts after build")
    
    args = parser.parse_args()
    
    # Default to all if no specific platform selected
    if not args.windows and not args.linux and not args.all:
        args.all = True
    
    print("="*60)
    print("  🛡️  CIS AUDIT LAUNCHER BUILDER")
    print("="*60)
    
    # Check PyInstaller
    if not check_pyinstaller():
        print("\n⚠️  PyInstaller not found!")
        response = input("Install PyInstaller now? (y/n): ")
        if response.lower() == 'y':
            install_pyinstaller()
        else:
            print("❌ PyInstaller required. Exiting.")
            sys.exit(1)
    
    # Build executables
    success = True
    
    if args.windows or args.all:
        if not build_windows():
            success = False
    
    if args.linux or args.all:
        if platform.system() == "Windows":
            print("\n⚠️  Note: Building Linux executable on Windows may not work properly.")
            print("   For best results, build Linux executables on Linux systems.")
        if not build_linux():
            success = False
    
    # Create portable package
    if success:
        create_portable_package()
    
    # Clean up
    if args.clean:
        clean_build_files()
    
    # Summary
    print("\n" + "="*60)
    if success:
        print("✅ BUILD SUCCESSFUL!")
        print("="*60)
        print("\nBuilt executables:")
        if args.windows or args.all:
            print("  📦 dist/cis-scanner-windows.exe")
        if args.linux or args.all:
            print("  📦 dist/cis-scanner-linux")
        print("\nNext steps:")
        print("  1. Test the executable on target systems")
        print("  2. Upload to: https://cis-audit-api.onrender.com/downloads/")
        print("  3. Add download button to dashboard")
    else:
        print("❌ BUILD FAILED!")
        print("="*60)
        print("\nCheck errors above for details.")
    print()


if __name__ == "__main__":
    import platform
    main()
