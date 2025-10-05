# 🆘 Troubleshooting Guide

Common issues and solutions for Your Personal Accountant.

## 📋 Quick Diagnostics

Before diving into specific issues, run these checks:

```bash
# Check versions
node --version    # Should be 14+
python --version  # Should be 3.8+
npm --version

# Check if ports are available
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux
```

---

## 🔧 Backend Issues

### Issue: Backend Server Won't Start

**Symptoms:**
- `python app.py` fails immediately
- Port 5000 already in use
- Module import errors

**Solutions:**

**1. Port Already in Use**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or use different port
export FLASK_RUN_PORT=5001
python app.py
```

**2. Missing Dependencies**

```bash
cd backend

# Reinstall all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# If specific module missing
pip install flask flask-cors cerebras_cloud_sdk
```

**3. Virtual Environment Issues**

```bash
# Delete and recreate virtual environment
rm -rf venv
python -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Reinstall
pip install -r requirements.txt
```

**4. Python Version Mismatch**

```bash
# Check Python version
python --version

# If wrong version, use specific Python
python3.9 -m venv venv
```

---

### Issue: Database Errors

**Symptoms:**
- "database is locked"
- "no such table" errors
- "unable to open database file"
- Data not persisting

**Solutions:**

**1. Database Locked**

```bash
# Check for processes using database
lsof finance.db  # macOS/Linux
handle finance.db  # Windows (requires Handle from Sysinternals)

# Kill hanging processes
kill -9 <PID>

# Restart backend
python app.py
```

**2. Database Missing or Corrupted**

```bash
# Backend creates database automatically
# If corrupted, delete and restart
rm finance.db
python app.py

# Database will be recreated with tables
```

**3. Permission Issues**

```bash
# Check permissions
ls -la finance.db

# Fix permissions
chmod 644 finance.db
chown $USER:$USER finance.db
```

**4. SQLite Version Issues**

```bash
# Check SQLite version
sqlite3 --version

# Update SQLite (if needed)
pip install --upgrade pysqlite3
```

---

### Issue: API Key / Cerebras Integration Problems

**Symptoms:**
- "Invalid API key" errors
- Chatbot not responding
- 401 Unauthorized from Cerebras

**Solutions:**

**1. Verify API Key Format**

```python
# API key should start with 'csk-'
# Example: csk-abc123def456...

# Test key in Python
from cerebras.cloud.sdk import Cerebras

client = Cerebras(api_key="your-api-key-here")
# If this fails, key is invalid
```

**2. Check API Key Configuration**

```bash
# Verify in .env file
cat backend/.env | grep CEREBRAS

# Or check in database
sqlite3 finance.db "SELECT cerebras_api_key FROM users WHERE id=1;"
```

**3. Update API Key**

- Go to Profile in the app
- Enter new API key
- Save changes
- Test chatbot

**4. Network Issues**

```bash
# Test connectivity to Cerebras
curl https://api.cerebras.ai/v1/models

# Check firewall settings
# Ensure outbound HTTPS is allowed
```

---

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API requests blocked
- "Access-Control-Allow-Origin" errors

**Solutions:**

**1. Update CORS Configuration**

In `backend/app.py`:

```python
from flask_cors import CORS

# Development
CORS(app, origins=["http://localhost:3000"])

# Production - update to your domain
CORS(app, origins=["https://yourdomain.com"])
```

**2. Check Environment Variables**

```bash
# backend/.env
CORS_ALLOW_ORIGINS=http://localhost:3000

# For multiple origins
CORS_ALLOW_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**3. Browser Cache**

```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Or disable cache in DevTools
# Open DevTools → Network tab → Check "Disable cache"
```

---

## ⚛️ Frontend Issues

### Issue: Frontend Won't Start

**Symptoms:**
- `npm start` fails
- "Cannot find module" errors
- Port 3000 busy

**Solutions:**

**1. Port Already in Use**

```bash
# Use different port
PORT=3001 npm start

# Or kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**2. Node Modules Corruption**

```bash
cd frontend

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**3. Node Version Issues**

```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm install 16
nvm use 16

# Or install correct version from nodejs.org
```

**4. Memory Issues**

```bash
# Increase Node memory limit
export NODE_OPTIONS=--max-old-space-size=4096
npm start
```

---

### Issue: Build Failures

**Symptoms:**
- `npm run build` fails
- "JavaScript heap out of memory"
- Webpack errors

**Solutions:**

**1. Memory Issues**

```bash
# Increase memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**2. Dependency Conflicts**

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or try with legacy peer deps
npm install --legacy-peer-deps
npm run build
```

**3. Environment Variables**

```bash
# Ensure .env.production exists
cp .env.example .env.production

# Check required variables
cat .env.production
```

**4. Cache Issues**

```bash
# Clear build cache
rm -rf build
rm -rf .cache

# Rebuild
npm run build
```

---

### Issue: API Connection Failed

**Symptoms:**
- "Network Error" in console
- API requests timeout
- "Failed to fetch" errors

**Solutions:**

**1. Check Backend is Running**

```bash
# Test backend health
curl http://localhost:5000/health

# Or in browser
http://localhost:5000/api/dashboard
```

**2. Verify API URL**

```javascript
// frontend/.env
REACT_APP_API_URL=http://localhost:5000

// Check in browser DevTools → Network tab
// Verify requests go to correct URL
```

**3. Firewall/Antivirus**

```bash
# Temporarily disable firewall to test
# If works, add exception for ports 3000 and 5000
```

**4. Proxy Configuration**

If using corporate network, update `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

---

### Issue: Blank Page / White Screen

**Symptoms:**
- App loads but shows blank page
- No errors in console
- React not rendering

**Solutions:**

**1. Check Console for Errors**

```bash
# Open DevTools (F12)
# Look for JavaScript errors in Console tab
```

**2. Check Public Path**

In `package.json`:

```json
{
  "homepage": ".",
}
```

**3. Clear Browser Cache**

```bash
# Hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Or clear all cache in browser settings
```

**4. Rebuild**

```bash
rm -rf build
npm run build
npm start
```

---

## 🔐 Authentication Issues

### Issue: Login Not Working

**Symptoms:**
- "Invalid credentials" error
- Token not saved
- Redirected back to login

**Solutions:**

**1. Check Credentials**

```bash
# Demo account
Email: demo@example.com
Password: demo123

# Check if user exists in database
sqlite3 backend/finance.db "SELECT * FROM users WHERE email='demo@example.com';"
```

**2. JWT Token Issues**

```bash
# Check JWT_SECRET in backend/.env
cat backend/.env | grep JWT_SECRET

# Ensure it's set and consistent
JWT_SECRET=your-secret-key-here
```

**3. LocalStorage Issues**

```javascript
// In browser console
localStorage.clear()
// Try logging in again
```

**4. Password Hash Issues**

```bash
# Reset demo user password
sqlite3 backend/finance.db

# In SQLite
UPDATE users SET password='hashed_password_here' WHERE email='demo@example.com';
```

---

### Issue: Token Expired

**Symptoms:**
- Suddenly logged out
- "Unauthorized" errors
- Need to login frequently

**Solutions:**

**1. Increase Token Expiration**

In `backend/app.py`:

```python
import jwt
from datetime import datetime, timedelta

token = jwt.encode({
    'user_id': user_id,
    'exp': datetime.utcnow() + timedelta(days=7)  # Increase from 1 day
}, JWT_SECRET)
```

**2. Implement Token Refresh**

```javascript
// Add token refresh logic
const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  localStorage.setItem('token', response.data.token);
};
```

---

## 🤖 Chatbot Issues

### Issue: Chatbot Not Responding

**Symptoms:**
- Messages send but no response
- Loading indicator stuck
- Error messages

**Solutions:**

**1. Check API Key**

```bash
# Verify API key is set
# Profile → API Configuration → Check Cerebras API Key
```

**2. Check Backend Logs**

```bash
# Terminal running backend
# Look for errors related to Cerebras API
```

**3. Test API Directly**

```python
from cerebras.cloud.sdk import Cerebras

client = Cerebras(api_key="your-key")
response = client.chat.completions.create(
    model="llama3.1-8b",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response)
```

**4. Rate Limiting**

```bash
# Cerebras may rate limit
# Wait a few minutes and try again
# Or upgrade your Cerebras plan
```

---

### Issue: Chatbot Misunderstands Commands

**Symptoms:**
- Expense not recorded correctly
- Wrong amounts extracted
- Actions not triggered

**Solutions:**

**1. Be More Specific**

```bash
# Instead of: "paid bills"
# Use: "I paid $120 for electricity bill today"

# Instead of: "bought stocks"
# Use: "I bought 10 shares of AAPL at $150 per share"
```

**2. Use Clear Dates**

```bash
# Good: "today", "yesterday", "on January 15"
# Bad: "the other day", "recently"
```

**3. Include All Details**

```bash
# Include: amount, category, date
"I spent $25.50 on lunch at Chipotle today"
```

**4. Check Model Selection**

```bash
# Try different model
# Profile → Settings → AI Model
# llama-4-scout-17b generally works better
```

---

## 💾 Data Issues

### Issue: Data Not Saving

**Symptoms:**
- Changes don't persist
- Refresh loses data
- Database reverts

**Solutions:**

**1. Check Database Connection**

```bash
# Verify database file exists
ls -la backend/finance.db

# Check write permissions
chmod 644 backend/finance.db
```

**2. Transaction Issues**

```python
# In backend code, ensure commits
conn = get_db()
cursor = conn.cursor()
cursor.execute("INSERT INTO ...")
conn.commit()  # This is crucial
conn.close()
```

**3. Browser LocalStorage**

```javascript
// Check if localStorage is working
localStorage.setItem('test', 'value')
console.log(localStorage.getItem('test'))
// If null, localStorage is disabled
```

---

### Issue: Data Synchronization Problems

**Symptoms:**
- Dashboard shows old data
- Changes not reflected immediately
- Inconsistent data across pages

**Solutions:**

**1. Force Refresh**

```javascript
// In React components
const { triggerRefresh } = useDataRefresh();
triggerRefresh(['dashboard', 'assets', 'liabilities']);
```

**2. Clear React State**

```javascript
// Hard refresh the page
window.location.reload();
```

**3. Check DataRefreshContext**

```javascript
// Ensure components are wrapped in provider
<DataRefreshProvider>
  <App />
</DataRefreshProvider>
```

---

## 🌐 Network Issues

### Issue: Slow Performance

**Symptoms:**
- Slow loading times
- API requests timeout
- Laggy UI

**Solutions:**

**1. Check Network Speed**

```bash
# Test internet connection
ping google.com

# Test API response time
time curl http://localhost:5000/api/dashboard
```

**2. Optimize Database Queries**

```sql
-- Add indexes
CREATE INDEX idx_user_id ON assets(user_id);
CREATE INDEX idx_user_id ON liabilities(user_id);
```

**3. Enable Caching**

```python
# In backend, add response caching
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/dashboard')
@cache.cached(timeout=60)
def dashboard():
    # ...
```

**4. Reduce Bundle Size**

```bash
# Analyze bundle
npm run build
npm install -g source-map-explorer
source-map-explorer build/static/js/*.js
```

---

## 🔍 Debugging Tips

### Enable Debug Mode

**Backend:**

```python
# backend/app.py
app.config['DEBUG'] = True

# Or in .env
FLASK_DEBUG=True
```

**Frontend:**

```javascript
// Add console logs
console.log('Component mounted', props);
console.error('Error occurred', error);
```

### Use Browser DevTools

```bash
# Open DevTools: F12 or Cmd+Option+I

# Useful tabs:
# - Console: JavaScript errors
# - Network: API requests
# - Application: LocalStorage, cookies
# - Performance: Profiling
```

### Check Logs

**Backend Logs:**

```bash
# Development
# Logs appear in terminal

# Production
sudo journalctl -u finance-backend -f
tail -f /var/log/finance-backend/error.log
```

**Frontend Logs:**

```bash
# Browser console (F12)
# Look for errors, warnings, network failures
```

---

## 📞 Getting Help

If you're still experiencing issues:

1. **Search GitHub Issues**: [github.com/your-repo/issues](https://github.com/your-username/Your_Personal_Accountant/issues)
2. **Check Documentation**: Review all docs in `/docs` folder
3. **Create New Issue**: Include:
   - Operating system
   - Node/Python versions
   - Steps to reproduce
   - Error messages
   - Screenshots

4. **Contact Support**:
   - 📧 Email: your-email@example.com
   - 💬 GitHub Discussions
   - 🐛 GitHub Issues

---

## 🔧 Useful Commands Reference

```bash
# Backend
python app.py                    # Start server
pip install -r requirements.txt  # Install deps
python -m pytest                # Run tests
flake8 .                        # Lint code

# Frontend  
npm start                       # Dev server
npm run build                   # Production build
npm test                        # Run tests
npm run lint                    # Lint code

# Database
sqlite3 finance.db              # Open database
.tables                         # List tables
.schema users                   # Show table schema

# Git
git status                      # Check status
git log                         # View commits
git diff                        # View changes

# System
lsof -i :5000                   # Check port (Unix)
netstat -ano | findstr :5000    # Check port (Windows)
ps aux | grep python            # Find Python processes
```

---

**Still stuck? Don't hesitate to ask for help! We're here to support you. 🤝**
