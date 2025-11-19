# 📱 Quick Start - Mobile Access

## 🚀 3 Simple Steps

### 1. Start Backend
```bash
python app.py
```
✅ Backend will be accessible on your network at `http://YOUR_IP:5000`

### 2. Start Frontend (Mobile Mode)
```bash
cd web-platform
npm run dev:mobile
```
✅ Frontend will be accessible on your network at `http://YOUR_IP:3000`

### 3. Get Your IP & Access Link
```bash
./start-mobile.sh
```

This will show you:
- Your local IP address
- The exact URL to open on your phone
- Status of both services

**Example output:**
```
📱 Your local IP address: 192.168.1.100
🔗 Access URLs:
   Frontend: http://192.168.1.100:3000
   Backend:  http://192.168.1.100:5000
```

### 4. Open on Mobile Phone
1. Make sure phone is on **same WiFi network**
2. Open browser on phone
3. Go to the URL shown (e.g., `http://192.168.1.100:3000`)

---

## ✨ What's Different?

- **Frontend**: Now uses `npm run dev:mobile` instead of `npm run dev`
  - This binds to `0.0.0.0` so it's accessible from network
- **Backend**: Already configured to accept network connections
- **API URL**: Automatically detects your IP and uses it for API calls
  - No need to manually set environment variables!

---

## 🔧 Troubleshooting

**Can't access from phone?**
1. Check both devices are on same WiFi
2. Check firewall allows ports 3000 and 5000
3. Try disabling firewall temporarily: `sudo ufw disable`
4. Verify IP address is correct

**API calls failing?**
- The app automatically uses your IP for API calls
- If issues persist, check backend is running on port 5000

**Still not working?**
- See `MOBILE_ACCESS.md` for detailed troubleshooting
- Check `TROUBLESHOOTING.md` for general issues

---

## 📝 Notes

- Works on any device on your local network (phone, tablet, another computer)
- No nginx required (but available if you want it)
- Automatically detects IP and configures API URLs
- Perfect for testing and demos!

---

**That's it! You're ready to test on mobile! 🎉**

