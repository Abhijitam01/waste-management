# 📱 Mobile Access Setup Guide

This guide shows you how to access OceanCleanup Connect from your mobile phone on the same WiFi network.

## 🚀 Quick Start (Simple Method - No Nginx)

### Step 1: Start Backend
```bash
python app.py
```
The backend will run on `0.0.0.0:5000` (accessible from network)

### Step 2: Start Frontend (Mobile Mode)
```bash
cd web-platform
npm run dev:mobile
```
This starts Next.js on `0.0.0.0:3000` (accessible from network)

### Step 3: Find Your IP Address
Run the helper script:
```bash
chmod +x start-mobile.sh
./start-mobile.sh
```

Or manually find your IP:
- **Linux/Mac**: `hostname -I` or `ifconfig | grep inet`
- **Windows**: `ipconfig` (look for IPv4 Address)

### Step 4: Access from Mobile
1. Make sure your phone is on the **same WiFi network**
2. Open browser on phone
3. Go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

---

## 🔧 Method 2: Using Nginx (Optional)

If you want a cleaner setup with nginx:

### Install Nginx
```bash
# Ubuntu/Debian
sudo apt-get install nginx

# Mac
brew install nginx

# Or use the nginx.conf provided
```

### Setup
1. Copy nginx config:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/oceancleanup
sudo ln -s /etc/nginx/sites-available/oceancleanup /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

2. Start services:
```bash
# Terminal 1
python app.py

# Terminal 2
cd web-platform
npm run dev
```

3. Access via nginx:
- Mobile: `http://YOUR_IP` (port 80, no need for :3000)
- Frontend API calls will be proxied automatically

---

## 📝 Environment Variables for Mobile

If you need to set the API URL for mobile access, create `.env.local` in `web-platform/`:

```bash
# web-platform/.env.local
NEXT_PUBLIC_API_URL=http://YOUR_IP:5000
```

Replace `YOUR_IP` with your actual local IP address.

---

## 🔍 Troubleshooting

### Can't access from mobile?

1. **Check Firewall**:
   ```bash
   # Linux - Allow ports
   sudo ufw allow 3000
   sudo ufw allow 5000
   
   # Or disable firewall temporarily for testing
   sudo ufw disable
   ```

2. **Check Network**:
   - Phone and computer must be on same WiFi
   - Some networks block device-to-device communication
   - Try mobile hotspot if router blocks it

3. **Check IP Address**:
   - Make sure you're using the correct IP (not 127.0.0.1)
   - IP should start with 192.168.x.x or 10.x.x.x

4. **Check Services**:
   ```bash
   # Test backend
   curl http://localhost:5000/status
   
   # Test frontend
   curl http://localhost:3000
   ```

5. **Check CORS**:
   - Backend already allows CORS
   - Frontend is configured for network access

### Backend not accessible?

The Flask app is already configured to bind to `0.0.0.0` by default, which means it accepts connections from any network interface.

If it's not working, check `config.py`:
```python
FLASK_HOST: str = os.getenv('FLASK_HOST', '0.0.0.0')  # Should be 0.0.0.0
```

### Frontend not accessible?

Make sure you're using the mobile dev command:
```bash
npm run dev:mobile  # Not just "npm run dev"
```

This binds to `0.0.0.0` instead of just `localhost`.

---

## 🎯 Quick Reference

| Service | Local URL | Network URL |
|---------|-----------|-------------|
| Frontend | http://localhost:3000 | http://YOUR_IP:3000 |
| Backend | http://localhost:5000 | http://YOUR_IP:5000 |
| Nginx | http://localhost | http://YOUR_IP |

---

## ✅ Testing Checklist

- [ ] Backend running: `python app.py`
- [ ] Frontend running: `npm run dev:mobile`
- [ ] IP address found: `./start-mobile.sh`
- [ ] Phone on same WiFi
- [ ] Firewall allows connections
- [ ] Can access from mobile browser
- [ ] Can detect waste from mobile
- [ ] Can see reports on mobile

---

## 📱 Mobile-Specific Notes

1. **Geolocation**: Mobile browsers can get GPS location automatically
2. **Camera**: Mobile can take photos directly
3. **Responsive**: UI is mobile-friendly
4. **Performance**: May be slower on mobile, especially drift analysis

---

## 🔒 Security Note

This setup is for **local network access only**. For production:
- Use HTTPS
- Set up proper authentication
- Use environment-specific configurations
- Don't expose to public internet without security measures

---

**Need Help?** Check `TROUBLESHOOTING.md` for more details.

