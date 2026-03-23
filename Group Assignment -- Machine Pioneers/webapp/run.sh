#!/bin/bash
# MovieRec - One-click startup script

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🎬 MovieRec - Intelligent Movie Recommendation System 🎬   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."
pip install -q flask flask-cors pandas numpy 2>/dev/null
echo "✓ Dependencies ready"
echo ""

# Stop old services
echo "🛑 Stopping old services..."
pkill -f "app.run.*port=8080" 2>/dev/null
sleep 1
echo "✓ Old services stopped"
echo ""

# Start services
echo "🚀 Starting services (port: 8080)..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Access addresses after service starts:"
echo "  📱 Frontend: http://127.0.0.1:8080/"
echo "  ⚙️  Admin:    http://127.0.0.1:8080/admin"
echo "  🔌 API:      http://127.0.0.1:8080/api/"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop services"
echo ""

# Start Flask service
python -c "
import sys
sys.path.insert(0, 'backend')
from app import app, data_store
data_store.load_all()
app.run(debug=False, host='0.0.0.0', port=8080, use_reloader=False)
"
