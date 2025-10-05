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

#### Rate Limiting (Recommended for Production)

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.headers.get('Authorization'))

@app.route('/api/chat', methods=['POST'])
@limiter.limit("20 per minute")
def chat():
    # Protected endpoint
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

**Protection Layers:**

1. **Input Sanitization** - Clean user input before processing
2. **Pattern Detection** - Identify malicious patterns
3. **Response Validation** - Verify AI output format
4. **Conversation Filtering** - Remove sensitive data from history
5. **Scope Limitation** - AI cannot access system functions

#### API Key Security

```python
# API keys are encrypted before storage
from cryptography.fernet import Fernet

def encrypt_api_key(api_key, encryption_key):
    f = Fernet(encryption_key)
    return f.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key, encryption_key):
    f = Fernet(encryption_key)
    return f.decrypt(encrypted_key.encode()).decode()
```

**Key Management:**
- Never logged or displayed
- Encrypted in database
- Transmitted over HTTPS only
- User-specific (not shared)

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

#### Database Backups

```bash
# Regular automated backups
sqlite3 finance.db ".backup '/backups/finance_backup_$(date +%Y%m%d).db'"

# Encrypted backups recommended
gpg --encrypt --recipient your-email@example.com backup.db
```

---

### Frontend Security

#### XSS Prevention

```javascript
// React automatically escapes content
// But be careful with dangerouslySetInnerHTML

// Safe
<div>{userContent}</div>

// Unsafe - avoid unless necessary
<div dangerouslySetInnerHTML={{__html: userContent}} />

// If needed, sanitize first
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

#### CSRF Protection

```javascript
// Include CSRF token in requests
const response = await axios.post('/api/endpoint', data, {
  headers: {
    'X-CSRF-Token': csrfToken,
    'Authorization': `Bearer ${token}`
  }
});
```

#### Secure Storage

```javascript
// Use secure storage practices
// For production, consider:
// - HTTP-only cookies for tokens
// - Encrypted localStorage
// - SessionStorage for temporary data

// Never store sensitive data unencrypted
localStorage.setItem('token', token);  // OK for dev
// sessionStorage.setItem('apiKey', key);  // Never do this
```

---

## 🔧 Security Best Practices

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

### For Users

#### Account Security

**Strong Passwords:**
- At least 12 characters
- Mix of letters, numbers, symbols
- Unique to this application
- Use a password manager

**Two-Factor Authentication:**
- Coming soon
- Enable when available

**API Keys:**
- Keep Cerebras API key private
- Don't share in screenshots or logs
- Regenerate if compromised
- Monitor usage in Cerebras Console

#### Safe Usage

**Do:**
- ✅ Use HTTPS only
- ✅ Log out on shared computers
- ✅ Keep software updated
- ✅ Review account activity regularly
- ✅ Report suspicious activity

**Don't:**
- ❌ Share login credentials
- ❌ Use public WiFi without VPN
- ❌ Save passwords in browser on shared devices
- ❌ Click suspicious links
- ❌ Install untrusted browser extensions

---

## 🔍 Security Auditing

### Self-Assessment

Run these checks regularly:

```bash
# 1. Check for exposed secrets
git log --all --full-history -- "*.env"

# 2. Scan dependencies
npm audit
pip-audit

# 3. Check file permissions
ls -la backend/finance.db  # Should not be world-readable

# 4. Review server logs
grep "ERROR\|WARN" /var/log/finance-backend/*.log

# 5. Test authentication
curl -X POST http://localhost:5000/api/dashboard
# Should return 401 Unauthorized without token
```

### Automated Security Testing

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Bandit (Python)
        run: |
          pip install bandit
          bandit -r backend/
      
      - name: Run npm audit
        run: |
          cd frontend
          npm audit --audit-level=moderate
```

---

## 🚧 Known Limitations

### Current Implementation

1. **LocalStorage for Tokens** - In production, use HTTP-only cookies
2. **SQLite Database** - Migrate to PostgreSQL for production
3. **No Rate Limiting** - Implement for production
4. **Basic Input Validation** - Can be enhanced
5. **No WAF** - Consider web application firewall for production

### Planned Improvements

- [ ] Two-factor authentication
- [ ] HTTP-only cookie storage
- [ ] Rate limiting on all endpoints
- [ ] Advanced intrusion detection
- [ ] Automated security scanning
- [ ] Penetration testing
- [ ] Bug bounty program

---

## 📚 Security Resources

### Standards & Frameworks

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Bandit](https://bandit.readthedocs.io/) - Python security linter
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Node.js security
- [SQLMap](http://sqlmap.org/) - SQL injection testing

### Learning

- [Web Security Academy](https://portswigger.net/web-security)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Flask Security](https://flask.palletsprojects.com/en/2.3.x/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

## 📞 Security Contact

**For security issues only:**
- 📧 Email: security@your-email.com
- 🔒 PGP Key: [Download](https://keybase.io/yourusername)

**Response Times:**
- Critical: 24 hours
- High: 48 hours
- Medium: 7 days
- Low: 14 days

---

## 🏆 Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

- **Coming soon** - Be the first!

---

## 📄 Compliance

This application is designed with the following in mind:

- **GDPR** - User data privacy and control
- **CCPA** - California Consumer Privacy Act
- **PCI DSS** - Payment card data security (if applicable)
- **SOC 2** - Security and availability

**Note:** Formal compliance certification requires independent audit.

---

## 📅 Security Updates

**Last Updated:** October 5, 2025  
**Version:** 1.0.0  
**Next Review:** January 2026

---

**Remember: Security is everyone's responsibility. If you see something, say something! 🛡️**
