#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MovieRec - Local deployment script
Resolves port conflicts, uses port 8080

Usage:
    python deploy.py
"""

import sys
import subprocess
import os
import time
import webbrowser
from pathlib import Path
from threading import Thread

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

def check_port(port):
    """Check if port is in use"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port(start_port=8080):
    """Find available port"""
    port = start_port
    while check_port(port):
        print(f"  Port {port} is in use, trying next...")
        port += 1
        if port > 8100:
            print("  Error: Cannot find available port")
            return None
    return port

def install_dependencies():
    """Install dependencies"""
    print("=" * 60)
    print("Checking and installing dependencies...")
    print("=" * 60)
    
    req_file = Path(__file__).parent / "requirements.txt"
    if req_file.exists():
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', '-r', str(req_file)])
    
    print("✓ Dependencies check complete\n")

def start_backend(port):
    """Start backend service"""
    print("=" * 60)
    print(f"Starting backend service (port: {port})...")
    print("=" * 60)
    
    backend_dir = Path(__file__).parent / "backend"
    sys.path.insert(0, str(backend_dir))
    
    # Modify port in environment variables
    os.environ['FLASK_PORT'] = str(port)
    
    from app import app, data_store
    data_store.load_all()
    
    # Start Flask in new thread
    def run_flask():
        app.run(debug=False, host='0.0.0.0', port=port, use_reloader=False)
    
    flask_thread = Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Wait for service to start
    time.sleep(2)
    
    print(f"✓ Backend service started: http://127.0.0.1:{port}/\n")
    return flask_thread

def start_frontend(port):
    """Start frontend service"""
    print("=" * 60)
    print(f"Starting frontend service (port: {port})...")
    print("=" * 60)
    
    frontend_dir = Path(__file__).parent / "frontend"
    
    # Use Python's http.server to host frontend
    import http.server
    import socketserver
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(frontend_dir), **kwargs)
        
        def end_headers(self):
            # Add CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            super().end_headers()
    
    def run_server():
        with socketserver.TCPServer(("", port), MyHTTPRequestHandler) as httpd:
            print(f"✓ Frontend service started: http://127.0.0.1:{port}/\n")
            httpd.serve_forever()
    
    server_thread = Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for service to start
    time.sleep(1)
    
    return server_thread

def open_browser(frontend_port, backend_port):
    """Open browser"""
    time.sleep(3)  # Wait for services to fully start
    
    urls = [
        f"http://127.0.0.1:{frontend_port}",
        f"http://127.0.0.1:{frontend_port}/admin"
    ]
    
    print("=" * 60)
    print("🚀 Services started successfully!")
    print("=" * 60)
    print(f"\n📱 Frontend: http://127.0.0.1:{frontend_port}/")
    print(f"⚙️  Admin:    http://127.0.0.1:{frontend_port}/admin")
    print(f"🔌 API:      http://127.0.0.1:{backend_port}/")
    print("\nOpening browser...")
    print("Press Ctrl+C to stop services")
    print("=" * 60 + "\n")
    
    for url in urls:
        try:
            webbrowser.open(url)
        except:
            pass

def main():
    """Main function"""
    print_banner()
    
    # Find available ports
    print("=" * 60)
    print("Finding available ports...")
    print("=" * 60)
    
    backend_port = find_available_port(8080)
    frontend_port = find_available_port(backend_port + 1)
    
    if not backend_port or not frontend_port:
        print("\n❌ Cannot find available ports, please manually close programs using these ports")
        return 1
    
    print(f"✓ Backend port: {backend_port}")
    print(f"✓ Frontend port: {frontend_port}\n")
    
    # Install dependencies
    install_dependencies()
    
    # Update frontend configuration
    update_frontend_config(backend_port)
    
    # Start services
    try:
        backend_thread = start_backend(backend_port)
        frontend_thread = start_frontend(frontend_port)
        
        # Open browser
        browser_thread = Thread(target=open_browser, args=(frontend_port, backend_port))
        browser_thread.start()
        
        # Keep main thread running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Services stopped")
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

def update_frontend_config(backend_port):
    """Update frontend configuration file"""
    app_js = Path(__file__).parent / "frontend" / "app.js"
    
    if app_js.exists():
        content = app_js.read_text(encoding='utf-8')
        # Update API address
        content = content.replace(
            "API_BASE_URL: 'http://127.0.0.1:8080'",
            f"API_BASE_URL: 'http://127.0.0.1:{backend_port}'"
        )
        app_js.write_text(content, encoding='utf-8')
        print(f"✓ Frontend configuration updated (API port: {backend_port})\n")

if __name__ == '__main__':
    sys.exit(main())
