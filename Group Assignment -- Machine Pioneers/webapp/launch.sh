#!/bin/bash
# MovieRec - Local deployment startup script (macOS/Linux)
# Usage: ./launch.sh

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🎬 MovieRec - Intelligent Movie Recommendation System 🎬   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Set ports
BACKEND_PORT=8080
FRONTEND_PORT=8081

cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies ready"
echo ""

# Update frontend configuration
echo "⚙️  Updating frontend configuration..."
sed -i '' "s|API_BASE_URL: 'http://127.0.0.1:[0-9]*'|API_BASE_URL: 'http://127.0.0.1:${BACKEND_PORT}'|g" frontend/app.js
echo "✓ Configuration updated"
echo ""

# Start backend service
echo "🚀 Starting backend service (port: ${BACKEND_PORT})..."
python -c "
import sys
sys.path.insert(0, 'backend')
from app import app, data_store
data_store.load_all()
print('✓ Backend service started')
print('')
app.run(debug=False, host='0.0.0.0', port=${BACKEND_PORT})
" &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend service
echo "🌐 Starting frontend service (port: ${FRONTEND_PORT})..."
cd frontend
python -m http.server ${FRONTEND_PORT} &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 2

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Services started successfully!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📱 Frontend: http://127.0.0.1:${FRONTEND_PORT}/"
echo "⚙️  Admin:    http://127.0.0.1:${FRONTEND_PORT}/admin"
echo "🔌 API:      http://127.0.0.1:${BACKEND_PORT}/"
echo ""
echo "Press Ctrl+C to stop services"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Open browser
sleep 2
open "http://127.0.0.1:${FRONTEND_PORT}/" 2>/dev/null || true
open "http://127.0.0.1:${FRONTEND_PORT}/admin" 2>/dev/null || true

# Wait for user interrupt
trap "echo ''; echo '👋 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
