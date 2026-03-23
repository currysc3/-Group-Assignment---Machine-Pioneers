#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MovieRec - Movie Recommendation System Startup Script
One-click startup for the complete movie recommendation system website

Usage:
    python start.py

Features:
    1. Check if dependencies are installed
    2. Load all necessary data
    3. Start Flask backend service
    4. Provide access links
"""

import sys
import subprocess
import os
from pathlib import Path

def check_dependencies():
    """Check if necessary dependencies are installed"""
    print("=" * 60)
    print("Checking dependencies...")
    print("=" * 60)
    
    required_packages = ['flask', 'flask_cors', 'pandas', 'numpy', 'sklearn']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} not installed")
    
    if missing_packages:
        print("\nMissing the following dependencies, installing...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✓ Dependencies installed")
    else:
        print("\n✓ All dependencies ready")
    
    return True

def check_data():
    """Check if necessary data files exist"""
    print("\n" + "=" * 60)
    print("Checking data files...")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    
    # Check movie data
    movies_file = base_dir / "assets" / "data" / "movies_display.json"
    if movies_file.exists():
        print(f"✓ Movie data ready: {movies_file}")
    else:
        print(f"⚠ Movie data not found: {movies_file}")
        print("  Will use raw data files")
    
    # Check recommendation results
    cf_dir = base_dir.parent / "协同过滤算法-核心代码+推荐结果+说明"
    if cf_dir.exists():
        print(f"✓ Collaborative filtering data directory exists: {cf_dir}")
    else:
        print(f"⚠ Collaborative filtering data directory not found: {cf_dir}")
    
    # Check evaluation visualization
    eval_dir = base_dir.parent / "协同过滤算法评估与可视化"
    if eval_dir.exists():
        print(f"✓ Evaluation visualization directory exists: {eval_dir}")
    else:
        print(f"⚠ Evaluation visualization directory not found: {eval_dir}")
    
    return True

def print_banner():
    """Print startup banner"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎬 MovieRec - Intelligent Movie Recommendation System 🎬   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def main():
    """Main function"""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("Dependency check failed, please install dependencies manually")
        return 1
    
    # Check data
    check_data()
    
    # Import and start application
    print("\n" + "=" * 60)
    print("Starting services...")
    print("=" * 60)
    
    try:
        # Switch to backend directory
        backend_dir = Path(__file__).parent / "backend"
        sys.path.insert(0, str(backend_dir))
        
        # Import application
        from app import app, data_store
        
        # Load data
        data_store.load_all()
        
        print("\n" + "=" * 60)
        print("🚀 Services started successfully!")
        print("=" * 60)
        print(f"\n📱 Frontend: http://127.0.0.1:8080/")
        print(f"⚙️  Admin:    http://127.0.0.1:8080/admin")
        print(f"📊 API Docs: http://127.0.0.1:8080/api/")
        print("\nPress Ctrl+C to stop services")
        print("=" * 60 + "\n")
        
        # Start services
        app.run(debug=True, host='0.0.0.0', port=8080, use_reloader=False)
        
    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
