#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MovieRec - Local deployment startup script
One-click startup for frontend and backend services

Usage:
    python launch.py
"""

import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

# Configuration
BACKEND_PORT = 8080
FRONTEND_PORT = 8081

def print_banner():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎬 MovieRec - Intelligent Movie Recommendation System 🎬   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")

def install_deps():
    """Install dependencies"""
    print("🔍 Checking dependencies...")
    req_file = Path(__file__).parent / "requirements.txt"
    if req_file.exists():
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', '-r', str(req_file)], check=True)
    print("✓ Dependencies ready\n")

def update_config():
    """Update frontend configuration"""
    print("⚙️  Updating frontend configuration...")
    app_js = Path(__file__).parent / "frontend" / "app.js"
    if app_js.exists():
        content = app_js.read_text(encoding='utf-8')
        # Replace API address
        import re
        content = re.sub(r"API_BASE_URL: 'http://127\.0\.0\.1:\d+'", f"API_BASE_URL: 'http://127.0.0.1:{BACKEND_PORT}'", content)
        app_js.write_text(content, encoding='utf-8')
    print("✓ Configuration updated\n")

def start_backend():
    """Start backend"""
    print(f"🚀 Starting backend service (port: {BACKEND_PORT})...")
    
    backend_script = f"""
import sys
sys.path.insert(0, 'backend')
from app import app, data_store
data_store.load_all()
print('✓ Backend service started')
print('')
app.run(debug=False, host='0.0.0.0', port={BACKEND_PORT}, use_reloader=False)
"""
    
    process = subprocess.Popen(
        [sys.executable, '-c', backend_script],
        cwd=str(Path(__file__).parent),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    # Wait for startup
    time.sleep(3)
    return process

def start_frontend():
    """Start frontend"""
    print(f"🌐 Starting frontend service (port: {FRONTEND_PORT})...")
    
    frontend_dir = Path(__file__).parent / "frontend"
    
    process = subprocess.Popen(
        [sys.executable, '-m', 'http.server', str(FRONTEND_PORT)],
        cwd=str(frontend_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    # Wait for startup
    time.sleep(2)
    return process

def open_browser():
    """Open browser"""
    time.sleep(2)
    
    urls = [
        f"http://127.0.0.1:{FRONTEND_PORT}/",
        f"http://127.0.0.1:{FRONTEND_PORT}/admin"
    ]
    
    for url in urls:
        try:
            webbrowser.open(url)
        except:
            pass

def main():
    print_banner()
    
    base_dir = Path(__file__).parent
    os.chdir(base_dir)
    
    print(f"📁 Working directory: {base_dir}\n")
    
    # Install dependencies
    try:
        install_deps()
    except Exception as e:
        print(f"⚠️  Dependency installation warning: {e}")
        print("Continuing startup...\n")
    
    # Update configuration
    update_config()
    
    # Start services
    backend_proc = None
    frontend_proc = None
    
    try:
        backend_proc = start_backend()
        frontend_proc = start_frontend()
        
        print("\n" + "="*60)
        print("🎉 Services started successfully!")
        print("="*60)
        print(f"\n📱 Frontend: http://127.0.0.1:{FRONTEND_PORT}/")
        print(f"⚙️  Admin:    http://127.0.0.1:{FRONTEND_PORT}/admin")
        print(f"🔌 API:      http://127.0.0.1:{BACKEND_PORT}/")
        print("\nPress Ctrl+C to stop services")
        print("="*60 + "\n")
        
        # Open browser
        open_browser()
        
        # Keep running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
            
    finally:
        print("\n👋 Stopping services...")
        if backend_proc:
            backend_proc.terminate()
            backend_proc.wait()
        if frontend_proc:
            frontend_proc.terminate()
            frontend_proc.wait()
        print("✓ Services stopped")

if __name__ == '__main__':
    main()
