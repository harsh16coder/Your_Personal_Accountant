# 🔒 Security Policy

## 🛡️ Security Overview

Your Personal Accountant takes security seriously. This document outlines our security measures, best practices, and how to report vulnerabilities.

---

## 📋 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

---

## 🚨 Reporting Security Vulnerabilities

**Please DO NOT report security vulnerabilities through public GitHub issues.**

### How to Report

**Email:** security@your-email.com

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

**Response Time:**
- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Depends on severity

### What to Expect

1. **Acknowledgment** - We'll confirm receipt of your report
2. **Investigation** - We'll investigate and validate the issue
3. **Fix Development** - We'll develop and test a fix
4. **Disclosure** - We'll coordinate disclosure with you
5. **Credit** - You'll be credited (if desired) in release notes

---

## 🔐 Security Features

### Authentication & Authorization

#### Password Security

```python
# Passwords are hashed using Werkzeug's security utilities
from werkzeug.security import generate_password_hash, check_password_hash

# Hashing (during registration)
hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

# Verification (during login)
check_password_hash(stored_hash, provided_password)
```

**Best Practices:**
- Minimum 8 characters
- Use strong, unique passwords
- Never share passwords
- Change regularly

#### JWT Token Management

```python
# Tokens are signed and time-limited
import jwt
from datetime import datetime, timedelta

token = jwt.encode({
    'user_id': user_id,
    'exp': datetime.utcnow() + timedelta(days=1)
}, JWT_SECRET, algorithm='HS256')
```

**Token Security:**
- Stored in localStorage (HTTP-only cookies recommended for production)
- Expires after 24 hours
- Validated on every request
- Cannot be tampered with

---

### API Security

#### CORS Configuration

```python
# Restricts which domains can access the API
from flask_cors import CORS

CORS(app, origins=[
    "http://localhost:3000",
    "https://yourdomain.com"
])
```

#### Input Validation

```python
# All user inputs are validated
def validate_amount(amount):
    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError("Amount must be positive")
        return amount
    except ValueError:
        raise ValueError("Invalid amount format")
```

---

### AI Security

#### Prompt Injection Protection

Multi-layer protection against prompt injection attacks:

```python
import re

def detect_prompt_injection(user_input):
    """
    Detects common prompt injection patterns
    """
    suspicious_patterns = [
        r'ignore.*previous.*instructions',
        r'disregard.*above',
        r'forget.*system.*prompt',
        r'you.*are.*now',
        r'new.*role',
        r'pretend.*you.*are',
        # ... more patterns
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True
    return False
```

---

### Database Security

#### SQL Injection Prevention

```python
# Always use parameterized queries
cursor.execute(
    "SELECT * FROM users WHERE email = ?",
    (email,)  # Parameter binding
)

# Never use string formatting
# BAD: cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

#### Data Encryption

```python
# Sensitive data is encrypted
import hashlib

def hash_sensitive_data(data):
    return hashlib.sha256(data.encode()).hexdigest()
```

---

### For Developers

#### Environment Variables

```bash
# Never commit these files
.env
.env.local
.env.production

# Use .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

**Required .env variables:**

```env
# Backend
JWT_SECRET=use-openssl-rand-base64-32
DB_PATH=/secure/path/to/database.db
FLASK_SECRET_KEY=another-random-secret
ENCRYPTION_KEY=for-api-key-encryption

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

#### Dependency Management

```bash
# Regularly update dependencies
pip install --upgrade pip
pip list --outdated
pip install --upgrade package-name

npm outdated
npm update

# Security audits
pip-audit  # Python
npm audit  # Node.js
```

#### Code Review Checklist

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL queries parameterized
- [ ] Error messages don't leak info
- [ ] Authentication required for sensitive endpoints
- [ ] HTTPS used for all external requests
- [ ] User data sanitized before storage

---

## 📅 Security Updates

**Last Updated:** October 5, 2025  
**Version:** 1.0.0  
**Next Review:** January 2026

---

**Remember: Security is everyone's responsibility. If you see something, say something! 🛡️**
