# 🌟 Features Guide

Comprehensive guide to all features in Your Personal Accountant.

## 📊 Dashboard Overview

The Dashboard is your financial command center, providing real-time insights into your financial health.

### What You'll See

- **Total Assets** - Sum of all your savings, investments, and valuables
- **Total Liabilities** - Sum of all debts and payment obligations
- **Net Worth** - Your assets minus liabilities
- **Recent Activity** - Latest transactions and updates
- **Quick Profile Actions** - Fast access to change profile related settings

### Using the Dashboard

1. **View Summary Cards** - Click any card for detailed breakdown
2. **Quick Add** - Use the "+" buttons to add assets or liabilities
4. **Refresh Data** - Pull to refresh or use the refresh button

---

## 💰 Asset Management

Track all your financial assets in one place.

### Asset Types

**Liquid Assets** - Easily accessible cash and equivalents
- Savings accounts
- Checking accounts
- Cash on hand

**Investment Assets** - Long-term growth assets
- Stocks and bonds
- Mutual funds
- Real estate

### Adding an Asset

1. Navigate to **Assets** page
2. Click **"Add New Asset"**
3. Fill in details:
   ```
   Name: Savings Account
   Amount: $5,000
   Type: Liquid
   ```
4. Click **"Save"**
5. Alternatively, you can add assets by asking the chatbot

### Editing Assets

1. Click on any asset card
2. Modify the information
3. Save changes
4. Changes reflect immediately across the app
5. Alternatively, you can modify assets by asking the chatbot

### Asset Best Practices

- Update regularly for accurate net worth
- Categorize correctly (liquid vs investment)
- Include all sources of wealth

---

## 💳 Liability Management

Track and manage all debts and payment obligations.

### Liability Types

**One-Time Payments**
- Utility bills
- Rent
- Subscriptions

**Installment Payments**
- Car loans
- Student loans
- Personal loans
- Mortgages

**Revolving Credit**
- Credit cards

### Adding a Liability

1. Navigate to **Liabilities** page
2. Click **"Add New Liability"**
3. Fill in details:
   ```
   Name: Credit Card
   Amount: $2,000
   Payment Type: Monthly
   Installment: $200
   Priority: 8 (1-10 scale)
   ```
4. Click **"Save"**
5. Alternatively, you can add liabilities by asking the chatbot

### Priority Scoring

Rate each liability's importance (1-100):

- **90-100**: Critical (mortgage, car payment)
- **70-80**: High priority (credit cards, student loans)
- **50-60**: Medium priority (personal loans)
- **1-40**: Low priority (small debts, subscriptions)

### Making Payments

#### Via Chatbot
```
"Pay off my credit card completely"
"Make a $200 payment on my car loan"
```

#### Via Manual Interface
1. Click on a liability card
2. Select payment type:
   - **Full Payoff** - Pay remaining balance
   - **Partial Payment** - Enter custom amount
   - **Installment** - Pay regular amount
3. Confirm payment
4. View updated balance instantly

### Payment Progress

Each liability card shows:
- **Progress Bar** - Visual representation of payments made
- **Percentage** - How much you've paid off
- **Remaining Balance** - Amount still owed
- **Last Payment** - Date and amount of last payment

---

## 🤖 AI Chat Assistant

Your intelligent financial companion powered by Cerebras AI.

### Getting Started

1. Click the **chatbot bar**
2. The assistant greets you
3. Start typing or use voice input (if enabled)

### Supported Commands

#### 💰 Expense Tracking
```
"I spent $15 on lunch at Chipotle today"
"Paid $120 for electricity bill using credit card"
"Bought groceries worth $85 with cash"
"Coffee at Starbucks $6.50"
```

#### 📈 Investment Tracking
```
"I bought 10 shares of AAPL at $150"
"Sold 5 shares of GOOGL at $2800"
"Added $500 to my savings account"
"Purchased 0.01 BTC at $45000"
```

#### 💳 Payment Management
```
"Pay off my credit card completely"
"Make a $200 payment on my car loan"
"Pay the minimum amount on my student loan"
"I want to pay $500 towards my mortgage"
```

#### 💡 Financial Guidance
```
"Help me understand my budget"
"What should I pay first?"
"Show me my current debt status"
"Give me savings recommendations"
```

### AI Model Selection

Choose from multiple Cerebras AI models:

1. **llama3.1-8b** - Fast, efficient for simple queries
2. **llama-4-scout-17b** - Advanced reasoning, recommended
3. **llama3.1-70b** - Most powerful, detailed responses
4. **Other models** - Full list available in the dropdown

**To change model:**
1. Go to Profile → Settings
2. Select preferred model from dropdown
3. Save changes

### Chatbot Features

- **Context Awareness** - Remembers conversation history
- **Natural Language** - Talk naturally, no special syntax
- **Multi-Action** - Handle multiple requests in one message
- **Smart Suggestions** - Offers relevant follow-up actions
- **Error Handling** - Clarifies ambiguous requests

### Privacy & Security

- Conversations are encrypted
- Messages stored securely in your account
- No data shared with third parties
- Clear chat history anytime

---

## 💡 Recommendations System

AI-generated financial advice tailored to your situation.

### Types of Recommendations

#### Debt Management
- Which debts to prioritize
- Consolidation opportunities
- Interest-saving strategies

#### Savings Goals
- Emergency fund targets
- Retirement planning
- Short-term savings goals

#### Budget Optimization
- Spending pattern analysis
- Category-based suggestions
- Income allocation advice

#### Investment Guidance
- Portfolio diversification
- Risk assessment
- Asset allocation tips

### Viewing Recommendations

1. Navigate to **Recommendations** page
2. View priority-sorted advice
3. Click any recommendation for details
4. Mark as complete when acted upon

### Recommendation Priority

- **High** (Red) - Urgent action needed
- **Medium** (Orange) - Important but not urgent
- **Low** (Green) - Beneficial when possible

---

## 👤 Profile Management

Manage your account settings and preferences.

### Personal Information

Update your profile:
- Name
- Email
- Password
- Profile picture (coming soon)

### API Configuration

**Setting up Cerebras API:**

1. Get API key from [Cerebras Console](https://cloud.cerebras.ai/)
2. Go to Profile → API Settings
3. Paste your API key (starts with `csk-`)
4. Select preferred AI model
5. Save changes

**Security:**
- API keys are encrypted
- Never shared in logs
- Regenerate if compromised

### Preferences

Customize your experience:
- **Currency** - USD, EUR, GBP, etc.
- **Date Format** - MM/DD/YYYY or DD/MM/YYYY
- **Theme** - Light or Dark (coming soon)
- **Notifications** - Email alerts for important events

### Export Data

Download your financial data:
1. Go to Profile → Data Export
2. Select date range
3. Choose format (CSV, JSON, PDF)
4. Download file

---

## 🔄 Real-Time Updates

The app automatically refreshes data across all components.

### How It Works

When you perform any action:
1. Data is sent to backend
2. Database is updated
3. All relevant components refresh automatically
4. No manual refresh needed

### What Gets Updated

- **Dashboard** - After any financial change
- **Asset List** - When assets are added/modified
- **Liability List** - After payments or updates
- **Recommendations** - When financial situation changes
- **Chat History** - After each message

### Manual Refresh

If needed, you can manually refresh:
- Pull down on mobile
- Click refresh icon
- Reload the page

---

## 📱 Mobile Experience

Optimized for mobile devices.

### Mobile-Specific Features

- **Touch-Friendly** - Large tap targets
- **Swipe Actions** - Swipe to delete or edit
- **Pull to Refresh** - Natural mobile interaction
- **Responsive Cards** - Adapts to screen size
- **Bottom Navigation** - Easy thumb access

### Mobile Tips

- Use landscape mode for better dashboard view
- Enable notifications for payment reminders
- Use voice input for faster expense logging
- Bookmark the app for quick access

---

## 🔐 Security Features

Your financial data is protected with multiple security layers.

### Authentication

- **Password Hashing** - Secure storage
- **JWT Tokens** - Session management
- **Auto Logout** - After inactivity
- **Two-Factor** - Coming soon

### Data Protection

- **Encryption** - All sensitive data encrypted
- **HTTPS Only** - Secure connections
- **API Key Security** - Encrypted storage
- **No Third-Party Sharing** - Your data stays private

### AI Security

- **Prompt Injection Protection** - Multiple layers
- **Input Sanitization** - Prevents malicious inputs
- **Response Validation** - Ensures safe outputs
- **Conversation Filtering** - Removes sensitive info

---

## 🎨 Customization

Personalize your experience.

### Visual Customization

- **Color Themes** - Multiple color schemes
- **Card Layouts** - Grid or list view
- **Chart Types** - Bar, line, or pie charts
- **Dashboard Widgets** - Customize what you see

### Notification Preferences

Choose what notifications you receive:
- Payment reminders
- Large expenses alerts
- Recommendation updates
- Weekly summaries

---

## 📊 Reports & Analytics

Detailed insights into your finances.

### Available Reports

**Monthly Summary**
- Income vs expenses
- Savings rate
- Net worth change
- Category breakdown

**Debt Payoff Progress**
- Payment history
- Projected payoff dates
- Interest saved
- Payment patterns

**Investment Performance**
- Portfolio value
- Returns
- Asset allocation
- Buy/sell history

### Generating Reports

1. Go to Reports section
2. Select report type
3. Choose date range
4. Click "Generate"
5. View or download

---

## 🔔 Notifications

Stay informed about your finances.

### Notification Types

- **Payment Reminders** - Upcoming bills
- **Budget Alerts** - Overspending warnings
- **Goal Progress** - Milestone achievements
- **Recommendations** - New advice available

### Managing Notifications

1. Go to Profile → Notifications
2. Toggle notification types
3. Set reminder timing
4. Save preferences

---

## 💾 Data Management

Control your financial data.

### Backup

- **Automatic** - Daily backups
- **Manual** - Export anytime
- **Cloud Sync** - Coming soon

### Import Data

Support for:
- CSV files
- Bank statements
- Other finance apps

### Delete Account

To delete your account:
1. Go to Profile → Account Settings
2. Click "Delete Account"
3. Confirm decision
4. All data is permanently removed

---

For technical details, see [API Documentation](API.md).  
