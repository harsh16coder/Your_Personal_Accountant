# 💰 Your Personal Accountant# Personal Accountant Budget Allocator



[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/Your_Personal_Accountant)A comprehensive financial management application featuring an AI-powered chatbot for expense tracking, budget planning, and financial guidance. Built with React frontend and Flask backend, integrated with Llama AI for intelligent financial assistance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)## 🌟 Features

[![Flask](https://img.shields.io/badge/Flask-2.3.2-green.svg)](https://flask.palletsprojects.com/)

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)### 💰 Financial Management

- *Dashboard Overview*: Real-time visualization of assets, liabilities, and net worth

A comprehensive AI-powered personal finance management application featuring an intelligent chatbot, advanced payment systems, real-time updates, and multi-model LLM support. Built with React frontend and Flask backend, integrated with Cerebras Cloud for intelligent financial assistance.- *Asset Tracking*: Monitor savings accounts, investments, and valuable assets

- *Liability Management*: Track loans, credit cards, rent, and payment obligations

## 🌟 Key Features- *Smart Recommendations*: AI-generated financial advice and payment prioritization



### 🤖 **AI-Powered Financial Assistant**### 🤖 AI-Powered Chatbot

- **Natural Language Processing**: Communicate naturally with your finance assistant- *Natural Language Processing*: Communicate with your personal finance assistant

- **Multi-Model LLM Support**: Choose from various Cerebras AI models (llama3.1-8b, llama-4-scout-17b, etc.)- *Expense Recording*: Simply say "I spent $15 on lunch at Chipotle today"

- **User-Configurable API Keys**: Secure personal API key management- *Trade Logging*: Log stock purchases like "I bought 10 shares of AAPL at $150"

- **Intelligent Expense Recording**: Simply say "I spent $15 on lunch at Chipotle today"- *Financial Guidance*: Get personalized advice on budgeting and debt management

- **Smart Trade Logging**: Log investments like "I bought 10 shares of AAPL at $150"- *Session Persistence*: Chat history maintained during your session

- **Financial Guidance**: Get personalized advice on budgeting and debt management

- **Security-First Design**: Advanced prompt injection protection### 🎨 User Experience

- *Responsive Design*: Works seamlessly on desktop, tablet, and mobile

### 💳 **Advanced Payment Management**- *Interactive Cards*: Hover effects and smooth animations

- **Flexible Payment Options**: Support for full payoff, partial payments, and installments- *Gradient UI*: Modern blue-themed interface with professional aesthetics

- **Payment Progress Tracking**: Accurate progress bars with amount-based calculations- *Real-time Updates*: Live data synchronization between frontend and backend

- **Multiple Payment Methods**: Pay via chatbot or manual interface

- **Dynamic Payment Validation**: Real-time payment amount validation## 🏗 Project Structure

- **Payment History**: Complete transaction tracking and history



### 📊 **Comprehensive Financial Dashboard**Budget Allocator/

- **Real-Time Overview**: Live visualization of assets, liabilities, and net worth├── backend/                     # Flask API Server

- **Asset Management**: Track savings accounts, investments, properties, and valuables│   ├── app.py                  # Main Flask application with all endpoints

- **Smart Liability Tracking**: Monitor loans, credit cards, EMIs with priority scoring│   ├── finance.db              # SQLite database

- **Dynamic Recommendations**: AI-generated financial advice and payment prioritization│   ├── requirements.txt        # Python dependencies

- **Interactive Financial Cards**: Hover effects and detailed information displays│   ├── .env                    # Environment variables

│   └── .env.example           # Environment template

### 🔄 **Real-Time Data Synchronization**├── frontend/                   # React Application

- **Live Updates**: Automatic data refresh across all components│   ├── src/

- **Context-Aware Refreshing**: Smart updates based on operation type│   │   ├── components/         # React Components

- **No Manual Refresh Required**: Seamless user experience with instant data updates│   │   │   ├── AssetCard.js           # Asset display card

- **Cross-Component Synchronization**: Consistent data across the entire application│   │   │   ├── Chatbot.js             # AI chatbot interface

│   │   │   ├── LiabilityCard.js       # Liability display card

### 👤 **Advanced User Management**│   │   │   ├── LoadingSpinner.js      # Loading animation

- **Comprehensive Profile System**: Complete user profile management│   │   │   ├── ProfileMenu.js         # User profile management

- **API Key Configuration**: Secure Cerebras API key management│   │   │   └── RecommendationCard.js  # Financial recommendations

- **Model Selection**: Choose preferred LLM model for AI interactions│   │   ├── pages/              # Page Components

- **Profile Integration**: Seamless profile menu with quick access│   │   │   ├── AssetView.js           # Asset management page

- **Secure Authentication**: JWT-based authentication system│   │   │   ├── Dashboard.js           # Main dashboard

│   │   │   ├── LiabilityView.js       # Liability management page

### 🛡️ **Enterprise-Grade Security**│   │   │   ├── Login.js               # Authentication page

- **Prompt Injection Protection**: Multi-layered security against AI manipulation│   │   │   ├── Register.js            # User registration

- **Input Sanitization**: Comprehensive input validation and cleaning│   │   │   └── RecommendationView.js  # Recommendations page

- **Response Validation**: Strict AI response format enforcement│   │   ├── services/           # API Services

- **Security Monitoring**: Real-time threat detection and blocking│   │   │   ├── api.js                 # Backend API integration

- **Authentication Security**: Secure user session management│   │   │   └── mockData.js            # Demo data service

│   │   ├── App.js              # Main React application

## 📁 Project Architecture│   │   ├── index.js            # React entry point

│   │   └── index.css           # Global styles

```│   ├── public/

Your_Personal_Accountant/│   │   └── index.html          # HTML template

├── 📁 Backend/                 # Flask API Server│   ├── package.json            # Node.js dependencies

│   ├── 🐍 app.py              # Main Flask application with all endpoints│   ├── tailwind.config.js      # Tailwind CSS configuration

│   ├── 🗄️ finance.db          # SQLite database (auto-generated)│   └── .env                    # Frontend environment variables

│   ├── 📄 requirements.txt     # Python dependencies├── README.md                   # This file

│   ├── 🔧 .env                # Environment variables├── start_frontend.bat          # Frontend launcher script

│   └── 📄 .env.example        # Environment template└── start_fullstack.bat         # Full application launcher

│

├── 📁 Frontend/                # React Application

│   ├── 📁 src/## 🚀 Quick Start

│   │   ├── 📁 components/      # React Components

│   │   │   ├── ⚛️ AssetCard.js        # Asset display with interactive features### Prerequisites

│   │   │   ├── 🤖 Chatbot.js          # AI chatbot with multi-model support- *Node.js* (v14 or higher)

│   │   │   ├── 💳 LiabilityCard.js    # Liability management with payments- *Python* (v3.8 or higher)

│   │   │   ├── ⏳ LoadingSpinner.js   # Loading animation component- *npm* or *yarn*

│   │   │   ├── 👤 ProfileMenu.js      # User profile with API key management

│   │   │   └── 💡 RecommendationCard.js # Financial recommendations### 1. Backend Setup (Flask)

│   │   │

│   │   ├── 📁 contexts/        # React Context Providersbash

│   │   │   └── 🔄 DataRefreshContext.js # Real-time data synchronization# Navigate to backend directory

│   │   │cd backend

│   │   ├── 📁 pages/           # Page Components

│   │   │   ├── 💰 AssetView.js        # Asset management interface# Install Python dependencies

│   │   │   ├── 📊 Dashboard.js        # Main dashboard with real-time datapip install -r requirements.txt

│   │   │   ├── 💳 LiabilityView.js    # Liability management with payments

│   │   │   ├── 🔐 Login.js            # Authentication interface# Start the Flask server

│   │   │   ├── 👤 Profile.js          # Complete profile managementpython app.py

│   │   │   ├── 📝 Register.js         # User registration

│   │   │   ├── 🔑 ResetPassword.js    # Password recovery

│   │   │   └── 💡 RecommendationView.js # AI recommendationsThe backend will be available at http://127.0.0.1:5000

│   │   │

│   │   ├── 📁 services/        # API Integration### 2. Frontend Setup (React)

│   │   │   ├── 🌐 api.js              # Complete backend API integration

│   │   │   └── 📊 mockData.js         # Demo data servicebash

│   │   │# Navigate to frontend directory

│   │   ├── 📁 utils/           # Utility Functionscd frontend

│   │   │   └── 🔐 auth.js             # Authentication utilities

│   │   │# Install Node.js dependencies

│   │   ├── ⚛️ App.js           # Main React application with routingnpm install

│   │   ├── 🎯 index.js         # React entry point

│   │   └── 🎨 index.css        # Global styles and responsive design# Start the React development server

│   │npm start

│   ├── 📁 public/

│   │   └── 📄 index.html       # HTML template

│   │The frontend will be available at http://localhost:3000

│   ├── 📦 package.json         # Node.js dependencies

│   ├── 🎨 tailwind.config.js   # Tailwind CSS configuration### 3. Demo Login

│   ├── 🎨 postcss.config.js    # PostCSS configuration

│   └── 🔧 .env                # Frontend environment variablesUse these credentials to access the demo:

│- *Email*: demo@example.com

├── 📚 Documentation/           # Project Documentation- *Password*: demo123

│   ├── 📄 PAYMENT_FEATURE_DOCUMENTATION.md

│   ├── 📄 REALTIME_UPDATES_DOCUMENTATION.md## 🎯 How to Use

│   └── 📄 test_*.py           # Testing scripts

│### 1. Dashboard Navigation

├── 🚫 .gitignore              # Comprehensive gitignore- Login with demo credentials

└── 📖 README.md               # This comprehensive documentation- View your financial overview on the main dashboard

```- Navigate between Assets, Liabilities, and Recommendations



## 🚀 Quick Start Guide### 2. AI Chatbot Interaction

- Click the chatbot icon in the bottom-right corner

### 📋 Prerequisites- Try these sample commands:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)  - "I spent $15 on lunch at Chipotle today"

- **Python** (v3.8 or higher) - [Download](https://www.python.org/)  - "I bought 10 shares of AAPL at $150"

- **npm** or **yarn** package manager  - "Help me understand my budget"

- **Cerebras AI API Key** - [Get yours here](https://cloud.cerebras.ai/)  - "What should I pay first?"



### 1. 🔧 Backend Setup (Flask)### 3. Financial Management

- *Assets*: Add savings accounts, investments, property

```bash- *Liabilities*: Track loans, credit cards, recurring payments

# Navigate to backend directory- *Recommendations*: Review AI-generated financial advice

cd Backend

## 🔧 Technology Stack

# Create virtual environment (recommended)

python -m venv venv### Frontend

source venv/bin/activate  # On Windows: venv\Scripts\activate- *React 18.2.0* - Modern JavaScript framework

- *Tailwind CSS 3.3.0* - Utility-first CSS framework

# Install Python dependencies- *React Router 6.3.0* - Client-side routing

pip install -r requirements.txt- *Axios* - HTTP client for API calls



# Set up environment variables### Backend

cp .env.example .env- *Flask 2.3.2* - Python web framework

# Edit .env with your configurations- *SQLite* - Lightweight database

- *Flask-CORS* - Cross-origin resource sharing

# Start the Flask server- *Cerebras Cloud SDK* - AI integration for Llama model

python app.py

```### AI Integration

- *Llama 4 Scout 17B* - Large language model for financial advice

🌐 **Backend will be available at:** `http://127.0.0.1:5000`- *Natural Language Processing* - Understanding financial queries

- *Structured Data Extraction* - Converting text to financial records

### 2. ⚛️ Frontend Setup (React)

## 📊 Database Schema

```bash

# Navigate to frontend directory### Core Tables

cd Frontend- *sessions* - Chat session management

- *messages* - Chat history storage

# Install Node.js dependencies- *expenses* - User expense records

npm install- *trades* - Investment transaction records



# Set up environment variables### Demo Data

cp .env.example .env- Sample assets: $8,700 total value

# Configure API endpoints if needed- Sample liabilities: $16,200 total amount

- Pre-loaded chat conversations

# Start the React development server- Realistic financial scenarios

npm start

```## 🔗 API Endpoints



🌐 **Frontend will be available at:** `http://localhost:3000`### Authentication

- POST /api/auth/login - User authentication

### 3. 🎯 Initial Configuration- POST /api/auth/register - User registration



1. **Register a new account** or use demo credentials### Financial Data

2. **Configure your Cerebras API Key**:- GET /api/dashboard - Dashboard overview data

   - Go to Profile settings- GET /api/assets - User assets list

   - Add your API key from [Cerebras Console](https://cloud.cerebras.ai/)- GET /api/liabilities - User liabilities list

   - Select your preferred AI model- GET /api/recommendations - Financial recommendations

3. **Start managing your finances!**

### AI Chatbot

## 🎮 How to Use- POST /api/sessions - Create chat session

- GET /api/sessions/<id>/messages - Get chat history

### 1. 📊 Dashboard Navigation- POST /api/chat - Send message to AI assistant

- **Login** with your credentials

- **View** your financial overview on the main dashboard## 🎨 UI/UX Features

- **Navigate** between Assets, Liabilities, and Recommendations

- **Real-time updates** keep everything synchronized### Design Elements

- *Gradient Backgrounds* - Professional blue color scheme

### 2. 🤖 AI Chatbot Interaction- *Interactive Cards* - Hover effects and animations

- *Responsive Grid* - Adapts to all screen sizes

The AI assistant supports natural language for all financial operations:- *Loading States* - Smooth user experience

- *Error Handling* - User-friendly error messages

```

💬 Sample Commands:### Accessibility

- *Keyboard Navigation* - Full keyboard support

💰 Expense Recording:- *Screen Reader Compatible* - ARIA labels and semantic HTML

"I spent $15 on lunch at Chipotle today"- *High Contrast* - Readable color combinations

"Paid $120 for electricity bill using credit card"- *Mobile Optimized* - Touch-friendly interface

"Bought groceries worth $85 with cash"

## 🔒 Security Features

📈 Investment Tracking:

"I bought 10 shares of AAPL at $150"- *Environment Variables* - Sensitive data protection

"Sold 5 shares of GOOGL at $2800"- *CORS Configuration* - Secure cross-origin requests

"Added $500 to my savings account"- *Input Validation* - Prevent malicious inputs

- *Session Management* - Secure chat sessions

💳 Liability Management:

"Pay off my credit card completely"## 🚀 Deployment

"Make a $200 payment on my car loan"

"Pay the minimum amount on my student loan"### Local Development

bash

💡 Financial Guidance:# Start backend

"Help me understand my budget"cd backend && python app.py

"What should I pay first?"

"Show me my current debt status"# Start frontend (in new terminal)

"Give me savings recommendations"cd frontend && npm start

```



### 3. 💳 Payment Management### Production Considerations

- Use environment variables for sensitive data

#### **Via Chatbot:**- Configure production database (PostgreSQL recommended)

- Natural language payment commands- Set up reverse proxy (nginx recommended)

- Automatic payment validation- Enable HTTPS/SSL certificates

- Real-time balance updates

## 🤝 Contributing

#### **Via Manual Interface:**

- **Full Payoff**: Pay remaining balance completely1. *Fork* the repository

- **Partial Payment**: Pay custom amount toward balance2. *Create* a feature branch (git checkout -b feature/amazing-feature)

- **Installment Payment**: Pay regular scheduled amount3. *Commit* your changes (git commit -m 'Add amazing feature')

- **Progress Tracking**: Visual progress bars with accurate calculations4. *Push* to the branch (git push origin feature/amazing-feature)

5. *Open* a Pull Request

### 4. 👤 Profile Management

## 📝 License

- **Personal Information**: Update name, email, financial details

- **API Key Management**: Configure and update Cerebras API keysThis project is licensed under the MIT License - see the LICENSE file for details.

- **Model Selection**: Choose from available AI models

- **Preferences**: Set currency, payment priorities## 🆘 Troubleshooting



## 🛠️ Technology Stack### Common Issues



### 🎯 Frontend Technologies*Backend not starting:*

- **React 18.2.0** - Modern JavaScript framework with hooksbash

- **React Router 6.x** - Client-side routing and navigation# Check Python version

- **Tailwind CSS 3.3.0** - Utility-first responsive CSS frameworkpython --version

- **Axios** - Promise-based HTTP client for API calls

- **React Context API** - State management for real-time updates# Install dependencies

pip install -r requirements.txt

### ⚙️ Backend Technologies

- **Flask 2.3.2** - Lightweight Python web framework# Check for port conflicts

- **SQLite** - Embedded relational databasenetstat -ano | findstr :5000

- **Flask-CORS** - Cross-origin resource sharing

- **Cerebras Cloud SDK** - AI model integration

- **JWT (PyJWT)** - JSON Web Token authentication*Frontend compilation errors:*

- **Werkzeug** - WSGI utilities and securitybash

# Clear npm cache

### 🤖 AI Integrationnpm cache clean --force

- **Cerebras Cloud Platform** - Enterprise AI infrastructure

- **Multiple LLM Models**: llama3.1-8b, llama-4-scout-17b, and more# Reinstall dependencies

- **Natural Language Processing** - Understanding financial queriesrm -rf node_modules package-lock.json

- **Structured Data Extraction** - Converting text to financial recordsnpm install

- **Prompt Injection Protection** - Advanced security measures



### 🗄️ Database Design*Database issues:*

- **Users Table** - Authentication and profile databash

- **Assets Table** - Financial assets with liquidity tracking# The SQLite database is created automatically

- **Liabilities Table** - Debts with payment scheduling# If corrupted, delete finance.db and restart the backend

- **Sessions Table** - Chat session management

- **Messages Table** - Conversation history

- **Real-time Relationships** - Normalized database design## 📞 Support



## 🔐 Security FeaturesFor support, email your-email@example.com or open an issue on GitHub.



### 🛡️ **AI Security (Advanced)**## 🎉 Acknowledgments

- **Multi-layer Prompt Injection Protection**

- **Input Sanitization** - Comprehensive cleaning and validation- *Cerebras* for Llama AI integration

- **Response Validation** - Strict format enforcement- *React* and *Flask* communities

- **Pattern Detection** - Malicious input recognition- *Tailwind CSS* for the beautiful UI framework

- **Conversation History Sanitization**- *OpenAI* for inspiration in AI assistant design



### 🔒 **Authentication Security**---

- **JWT Token Management** - Secure session handling

- **Password Hashing** - Werkzeug security utilities*Made with ❤ for better financial management*
- **API Key Encryption** - Secure storage of sensitive data
- **Session Validation** - Real-time authentication checks

### 🔧 **Application Security**
- **CORS Configuration** - Secure cross-origin requests
- **Environment Variables** - Sensitive data protection
- **Input Validation** - Server-side validation for all inputs
- **Error Handling** - Secure error messages without data leakage

## 📊 API Documentation

### 🔐 Authentication Endpoints
```http
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User authentication
POST   /api/auth/reset-password # Password recovery
POST   /api/auth/get-secret-key # Secret key retrieval
```

### 👤 Profile Management
```http
GET    /api/profile           # Get user profile
PUT    /api/profile           # Update user profile
GET    /api/models            # Get available AI models
```

### 📊 Financial Data
```http
GET    /api/dashboard         # Complete dashboard data
GET    /api/assets            # User assets list
POST   /api/assets            # Create new asset
PUT    /api/assets/:id        # Update asset
GET    /api/liabilities       # User liabilities list
POST   /api/liabilities       # Create new liability
PUT    /api/liabilities/:id   # Update liability
POST   /api/liabilities/:id/pay # Make payment
```

### 🤖 AI Assistant
```http
POST   /api/sessions          # Create chat session
GET    /api/sessions/:id/messages # Get chat history
POST   /api/chat             # Send message to AI
POST   /api/chat/reset       # Reset conversation
```

### 💡 Recommendations
```http
GET    /api/recommendations   # Get AI-generated financial advice
```

## 🎨 UI/UX Features

### 🎭 **Design System**
- **Consistent Color Palette** - Professional blue gradient theme
- **Responsive Grid Layout** - Mobile-first responsive design
- **Interactive Components** - Hover effects and smooth animations
- **Loading States** - Skeleton loading and spinners
- **Error Boundaries** - Graceful error handling

### ♿ **Accessibility**
- **WCAG 2.1 Compliance** - Web accessibility standards
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Compatible** - ARIA labels and semantic HTML
- **High Contrast Mode** - Readable color combinations
- **Mobile Optimized** - Touch-friendly interface

### 📱 **Responsive Design**
- **Mobile-First Approach** - Optimized for mobile devices
- **Tablet Support** - Perfect tablet experience
- **Desktop Enhanced** - Rich desktop features
- **Cross-Browser Compatibility** - Works on all modern browsers

## ⚡ Real-Time Features

### 🔄 **Live Data Synchronization**
- **Automatic Updates** - No manual refresh required
- **Context-Aware Refreshing** - Smart updates based on operations
- **Cross-Component Sync** - Consistent data across all views
- **Real-Time Balance Updates** - Instant payment reflections

### 📊 **Dynamic Progress Tracking**
- **Payment Progress Bars** - Visual payment completion tracking
- **Amount-Based Calculations** - Accurate progress based on actual payments
- **Real-Time Validation** - Instant payment amount validation
- **Status Indicators** - Clear visual status for all financial items

## 🧪 Testing & Quality

### 🔬 **Testing Framework**
```bash
# Backend Testing
cd Backend
python -m pytest test_*.py

# Frontend Testing  
cd Frontend
npm test
```

### 📋 **Available Test Scripts**
- `test_payment_feature.py` - Payment system testing
- `test_payment_progress.py` - Progress calculation testing
- `test_priority.py` - Priority scoring testing
- `test_realtime_updates.py` - Real-time sync testing
- `test_updates.py` - General update testing

## 🚀 Deployment

### 🏠 **Local Development**
```bash
# Terminal 1: Start Backend
cd Backend && python app.py

# Terminal 2: Start Frontend  
cd Frontend && npm start
```

### ☁️ **Production Deployment**

#### **Backend Deployment**
```bash
# Using Gunicorn (recommended)
pip install gunicorn
gunicorn app:app

# Using Docker
docker build -t personal-accountant-backend .
docker run -p 5000:5000 personal-accountant-backend
```

#### **Frontend Deployment**
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build

# Using Docker
docker build -t personal-accountant-frontend .
docker run -p 3000:3000 personal-accountant-frontend
```

### 🌐 **Environment Configuration**

#### **Backend Environment (.env)**
```env
DB_PATH=finance.db
CORS_ALLOW_ORIGINS=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
FLASK_ENV=development
FLASK_DEBUG=True
```

#### **Frontend Environment (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_USE_MOCK=false
GENERATE_SOURCEMAP=true
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 📝 **Contribution Guidelines**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 🐛 **Bug Reports**
- Use the issue tracker for bug reports
- Include detailed reproduction steps
- Provide environment information

### ✨ **Feature Requests**
- Describe the feature in detail
- Explain the use case and benefits
- Provide mockups or examples if possible

## 🆘 Troubleshooting

### ❗ **Common Issues**

#### **Backend Issues**
```bash
# Port already in use
lsof -ti:5000 | xargs kill -9

# Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Database issues
rm finance.db  # Recreated automatically
```

#### **Frontend Issues**
```bash
# Node modules corruption
rm -rf node_modules package-lock.json
npm install

# Build issues
npm run build --verbose

# Port conflicts
PORT=3001 npm start
```

#### **API Key Issues**
1. Verify API key format (starts with 'csk-')
2. Check Cerebras Console for valid keys
3. Ensure proper profile configuration
4. Test with different models

### 🔧 **Development Tips**
- Use browser DevTools for debugging
- Check browser console for errors
- Monitor network requests
- Use React Developer Tools
- Enable Flask debug mode for development

## 📚 Additional Resources

### 📖 **Documentation**
- [Cerebras API Documentation](https://cloud.cerebras.ai/docs)
- [React Documentation](https://reactjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 🎓 **Learning Resources**
- [Personal Finance Basics](https://www.investopedia.com/)
- [AI in Finance](https://www.mckinsey.com/industries/financial-services/our-insights)
- [React Best Practices](https://react.dev/learn)
- [Flask Best Practices](https://flask.palletsprojects.com/en/2.3.x/patterns/)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Your Personal Accountant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

### 🤖 **AI & Technology**
- **[Cerebras](https://cerebras.ai/)** - Advanced AI infrastructure and models
- **[OpenAI](https://openai.com/)** - Inspiration for AI assistant design
- **[React Team](https://reactjs.org/)** - Amazing frontend framework
- **[Flask Community](https://flask.palletsprojects.com/)** - Lightweight backend framework

### 🎨 **Design & UI**
- **[Tailwind CSS](https://tailwindcss.com/)** - Beautiful utility-first CSS
- **[Heroicons](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[Google Fonts](https://fonts.google.com/)** - Typography that makes a difference

### 💡 **Inspiration**
- Personal finance management best practices
- Modern web application design patterns
- AI-powered user experience innovations
- Financial technology industry standards

---

<div align="center">

### 🌟 Star this repository if it helped you manage your finances better!

**Made with ❤️ for better financial management**

[🌐 Website](https://your-website.com) • [📧 Email](mailto:your-email@example.com) • [🐛 Report Bug](https://github.com/your-username/Your_Personal_Accountant/issues) • [✨ Request Feature](https://github.com/your-username/Your_Personal_Accountant/issues)

</div>