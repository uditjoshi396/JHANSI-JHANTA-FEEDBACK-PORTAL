# 🚀 QUICK START - RUN PROJECT IN 30 SECONDS

## Option 1: Click & Go (Easiest)
Simply double-click this file from Windows Explorer:
```
START_PROJECT.bat
```
Both servers start automatically. Done! ✅

---

## Option 2: Command Line (Terminal 1)
```bash
cd server
npm start
```

Then open **new terminal (Terminal 2)**:
```bash
cd client
npm start
```

---

## Option 3: Direct Node (Terminal 1 only - Backend)
```bash
cd server
node index.js
```

---

## 🌐 ACCESS POINTS

Once both servers are running:

| Service | URL |
|---------|-----|
| **Home Page** | http://localhost:3000 |
| **Register** | http://localhost:3000/register |
| **Login** | http://localhost:3000/login |
| **Backend API** | http://localhost:5000 |

---

## ✅ WHAT TO EXPECT

### Backend Console:
```
Server listening on port 5000
MongoDB connected
```

### Frontend Console:
```
Compiled successfully!
You can now view janata-client in the browser.
Local: http://localhost:3000
```

---

## 🧪 TEST RIGHT NOW

1. **Frontend is running?**
   - Visit http://localhost:3000
   - You should see the home page

2. **Backend is running?**
   - Visit http://localhost:5000
   - You should see: `{"status":"Janata Feedback API","time":"..."}`

3. **Can register?**
   - Go to http://localhost:3000/register
   - Fill form and submit
   - Should redirect to login

---

## 🛑 TO STOP SERVERS

Simply close the terminal windows or press **Ctrl+C** in each terminal.

---

## 💡 SYSTEM REQUIREMENTS

✅ Node.js 14+ (installed)  
✅ npm (installed)  
✅ MongoDB (running)  
✅ Ports 3000 & 5000 (available)  

---

**Status**: ✅ Ready to run!  
**Project**: Fully operational  
**All errors**: Fixed & tested  

🎉 Enjoy!
