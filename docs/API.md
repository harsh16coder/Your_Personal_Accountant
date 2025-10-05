# 📡 API Documentation

Complete reference for all API endpoints in Your Personal Accountant.

**Base URL:** `http://localhost:5000/api` (change this as per your domain name)

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `409 Conflict` - Email already exists

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

---

### Reset Password

Request password reset.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset instructions sent to email"
}
```

---

### Get Secret Key

Retrieve account secret key for password recovery.

**Endpoint:** `POST /api/auth/get-secret-key`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "secret_key": "RECOVER-KEY-12345"
}
```

---

## 👤 Profile Management

### Get User Profile

Retrieve user profile information.

**Endpoint:** `GET /api/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "cerebras_api_key": "csk-xxxxx",
  "selected_model": "llama3.1-8b",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### Update User Profile

Update user profile information.

**Endpoint:** `PUT /api/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "cerebras_api_key": "csk-new-key",
  "selected_model": "llama-4-scout-17b"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "selected_model": "llama-4-scout-17b"
  }
}
```

---

### Get Available AI Models

Retrieve list of available Cerebras AI models.

**Endpoint:** `GET /api/models`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "models": [
    {
      "id": "llama3.1-8b",
      "name": "Llama 3.1 8B",
      "description": "Fast and efficient model"
    },
    {
      "id": "llama-4-scout-17b",
      "name": "Llama 4 Scout 17B",
      "description": "Advanced reasoning capabilities"
    }
  ]
}
```

---

## 📊 Dashboard

### Get Dashboard Data

Retrieve complete dashboard overview.

**Endpoint:** `GET /api/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "assets": [
    {
      "id": 1,
      "name": "Savings Account",
      "amount": 5000,
      "type": "liquid"
    }
  ],
  "liabilities": [
    {
      "id": 1,
      "name": "Credit Card",
      "amount": 2000,
      "original_amount": 3000,
      "payment_type": "monthly",
      "installment_amount": 200,
      "priority_score": 8
    }
  ],
  "recommendations": [
    {
      "id": 1,
      "title": "Pay High-Interest Debt First",
      "description": "Focus on your credit card with 18% APR",
      "priority": "high"
    }
  ],
  "summary": {
    "total_assets": 5000,
    "total_liabilities": 2000,
    "net_worth": 3000
  }
}
```

---

## 💰 Assets

### Get All Assets

Retrieve all user assets.

**Endpoint:** `GET /api/assets`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "assets": [
    {
      "id": 1,
      "name": "Savings Account",
      "amount": 5000,
      "type": "liquid",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Stock Portfolio",
      "amount": 10000,
      "type": "investment",
      "created_at": "2025-01-16T11:00:00Z"
    }
  ],
  "total": 15000
}
```

---

### Create Asset

Add a new asset.

**Endpoint:** `POST /api/assets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "amount": 3000,
  "type": "liquid"
}
```

**Response:** `201 Created`
```json
{
  "message": "Asset created successfully",
  "asset": {
    "id": 3,
    "name": "Emergency Fund",
    "amount": 3000,
    "type": "liquid",
    "created_at": "2025-01-20T09:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid token

---

### Update Asset

Update an existing asset.

**Endpoint:** `PUT /api/assets/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Emergency Fund - Updated",
  "amount": 3500,
  "type": "liquid"
}
```

**Response:** `200 OK`
```json
{
  "message": "Asset updated successfully",
  "asset": {
    "id": 3,
    "name": "Emergency Fund - Updated",
    "amount": 3500,
    "type": "liquid"
  }
}
```

---

### Delete Asset

Delete an asset.

**Endpoint:** `DELETE /api/assets/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Asset deleted successfully"
}
```

---

## 💳 Liabilities

### Get All Liabilities

Retrieve all user liabilities.

**Endpoint:** `GET /api/liabilities`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "liabilities": [
    {
      "id": 1,
      "name": "Credit Card",
      "amount": 2000,
      "original_amount": 3000,
      "payment_type": "monthly",
      "installment_amount": 200,
      "priority_score": 8,
      "progress": 33.33,
      "created_at": "2025-01-10T14:00:00Z"
    }
  ],
  "total": 2000
}
```

---

### Create Liability

Add a new liability.

**Endpoint:** `POST /api/liabilities`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Car Loan",
  "amount": 15000,
  "payment_type": "monthly",
  "installment_amount": 500,
  "priority_score": 6
}
```

**Response:** `201 Created`
```json
{
  "message": "Liability created successfully",
  "liability": {
    "id": 2,
    "name": "Car Loan",
    "amount": 15000,
    "original_amount": 15000,
    "payment_type": "monthly",
    "installment_amount": 500,
    "priority_score": 6,
    "progress": 0
  }
}
```

---

### Update Liability

Update an existing liability.

**Endpoint:** `PUT /api/liabilities/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Car Loan - Updated",
  "installment_amount": 600,
  "priority_score": 7
}
```

**Response:** `200 OK`
```json
{
  "message": "Liability updated successfully",
  "liability": {
    "id": 2,
    "name": "Car Loan - Updated",
    "amount": 15000,
    "installment_amount": 600,
    "priority_score": 7
  }
}
```

---

### Make Payment

Process a payment on a liability.

**Endpoint:** `POST /api/liabilities/:id/pay`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 500,
  "payment_type": "partial"
}
```

**Payment Types:**
- `full` - Pay off remaining balance
- `partial` - Pay custom amount
- `installment` - Pay regular installment amount

**Response:** `200 OK`
```json
{
  "message": "Payment processed successfully",
  "liability": {
    "id": 2,
    "name": "Car Loan",
    "amount": 14500,
    "original_amount": 15000,
    "progress": 3.33
  },
  "payment": {
    "amount": 500,
    "remaining": 14500,
    "date": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid payment amount
- `404 Not Found` - Liability not found

---

### Delete Liability

Delete a liability.

**Endpoint:** `DELETE /api/liabilities/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Liability deleted successfully"
}
```

---

## 💡 Recommendations

### Get Recommendations

Retrieve AI-generated financial recommendations.

**Endpoint:** `GET /api/recommendations`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Pay High-Interest Debt First",
      "description": "Your credit card has the highest interest rate. Prioritize paying this off to save on interest charges.",
      "priority": "high",
      "category": "debt_management",
      "created_at": "2025-01-20T09:00:00Z"
    },
    {
      "id": 2,
      "title": "Build Emergency Fund",
      "description": "Aim for 3-6 months of expenses in liquid savings.",
      "priority": "medium",
      "category": "savings",
      "created_at": "2025-01-20T09:00:00Z"
    }
  ]
}
```

---

## 🤖 AI Chat Assistant

### Create Chat Session

Start a new chat session.

**Endpoint:** `POST /api/sessions`

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "session_id": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

---

### Get Chat History

Retrieve messages from a chat session.

**Endpoint:** `GET /api/sessions/:id/messages`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "I spent $15 on lunch at Chipotle",
      "created_at": "2025-01-20T10:05:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "I've recorded your expense of $15 for lunch at Chipotle.",
      "created_at": "2025-01-20T10:05:01Z"
    }
  ]
}
```

---

### Send Chat Message

Send a message to the AI assistant.

**Endpoint:** `POST /api/chat`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": 1,
  "message": "I spent $15 on lunch at Chipotle today"
}
```

**Response:** `200 OK`
```json
{
  "response": "I've recorded your expense of $15 for lunch at Chipotle. This has been categorized as a food expense.",
  "action": {
    "type": "expense_recorded",
    "data": {
      "amount": 15,
      "category": "food",
      "description": "lunch at Chipotle",
      "date": "2025-01-20"
    }
  }
}
```

**Supported Actions:**
- `expense_recorded` - Expense was logged
- `payment_processed` - Payment made on liability
- `advice_given` - Financial guidance provided
- `none` - General conversation

---

### Reset Chat Session

Clear chat history and start fresh.

**Endpoint:** `POST /api/chat/reset`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": 1
}
```

**Response:** `200 OK`
```json
{
  "message": "Chat session reset successfully",
  "session_id": 2
}
```

---

## 📈 Expenses & Trades

### Get Expenses

Retrieve user expenses.

**Endpoint:** `GET /api/expenses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date` (optional) - Filter by start date (YYYY-MM-DD)
- `end_date` (optional) - Filter by end date (YYYY-MM-DD)
- `category` (optional) - Filter by category

**Response:** `200 OK`
```json
{
  "expenses": [
    {
      "id": 1,
      "amount": 15,
      "category": "food",
      "description": "lunch at Chipotle",
      "date": "2025-01-20"
    }
  ],
  "total": 15
}
```

---

### Get Trades

Retrieve investment trades. (Currently not in use. Future work: Integrate stocks with assets)

**Endpoint:** `GET /api/trades`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "trades": [
    {
      "id": 1,
      "symbol": "AAPL",
      "shares": 10,
      "price": 150,
      "type": "buy",
      "date": "2025-01-20",
      "total": 1500
    }
  ]
}
```

---

## 📊 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Missing required field: name"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

---

## 🔧 Rate Limits

Currently, no rate limits are enforced. Tentative future versions will implement:

- **Authentication endpoints:** 5 requests per minute
- **Chat endpoints:** 20 requests per minute
- **Data endpoints:** 100 requests per minute

---

## 📝 Notes

1. **Date Format:** All dates use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
2. **Currency:** All monetary values are in USD
3. **Token Expiration:** JWT tokens expire after 24 hours
4. **API Key Security:** Never expose Cerebras API keys in client-side code

---

For implementation examples, see the [Features Guide](FEATURES.md).
