#!/bin/bash

# Script to start the application for mobile access
# This makes the app accessible on your local network

echo "🌊 OceanCleanup Connect - Mobile Access Setup"
echo "=============================================="
echo ""

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}')
fi

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not determine local IP address"
    echo "   Please enter your IP manually"
    exit 1
fi

echo "📱 Your local IP address: $LOCAL_IP"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: http://$LOCAL_IP:3000"
echo "   Backend:  http://$LOCAL_IP:5000"
echo ""
echo "✨ NEW: Shareable Link System"
echo "   The app now automatically detects your IP!"
echo "   Just open http://$LOCAL_IP:3000 and copy the link from the dashboard"
echo "   The link works from ANY device on the same network"
echo ""
echo "📲 On your mobile phone:"
echo "   1. Connect to the same WiFi network as this computer"
echo "   2. Open browser and go to: http://$LOCAL_IP:3000"
echo "   3. Or scan the QR code shown on the dashboard/home page"
echo ""
echo "⚠️  Make sure both services are running:"
echo "   Terminal 1 (Backend):  python app.py"
echo "   Terminal 2 (Frontend): cd web-platform && npm run dev:mobile"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Check if backend is running
if curl -s http://localhost:5000/status > /dev/null 2>&1; then
    echo "✅ Backend is running on port 5000"
else
    echo "⚠️  Backend not running on port 5000"
    echo "   Start it with: python app.py"
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "⚠️  Frontend not running on port 3000"
    echo "   Start it with: cd web-platform && npm run dev:mobile"
fi

echo ""
echo "✅ Ready! Open http://$LOCAL_IP:3000 on your mobile device"
echo ""
