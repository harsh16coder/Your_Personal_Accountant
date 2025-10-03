# Personal Accountant Budget Allocator

A comprehensive financial management application featuring an AI-powered chatbot for expense tracking, budget planning, and financial guidance. Built with React frontend and Flask backend, integrated with Llama AI for intelligent financial assistance.

## 🌟 Features

### 💰 Financial Management
- *Dashboard Overview*: Real-time visualization of assets, liabilities, and net worth
- *Asset Tracking*: Monitor savings accounts, investments, and valuable assets
- *Liability Management*: Track loans, credit cards, rent, and payment obligations
- *Smart Recommendations*: AI-generated financial advice and payment prioritization

### 🤖 AI-Powered Chatbot
- *Natural Language Processing*: Communicate with your personal finance assistant
- *Expense Recording*: Simply say "I spent $15 on lunch at Chipotle today"
- *Trade Logging*: Log stock purchases like "I bought 10 shares of AAPL at $150"
- *Financial Guidance*: Get personalized advice on budgeting and debt management
- *Session Persistence*: Chat history maintained during your session

### 🎨 User Experience
- *Responsive Design*: Works seamlessly on desktop, tablet, and mobile
- *Interactive Cards*: Hover effects and smooth animations
- *Gradient UI*: Modern blue-themed interface with professional aesthetics
- *Real-time Updates*: Live data synchronization between frontend and backend

## 🏗 Project Structure


Budget Allocator/
├── backend/                     # Flask API Server
│   ├── app.py                  # Main Flask application with all endpoints
│   ├── finance.db              # SQLite database
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   └── .env.example           # Environment template
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── AssetCard.js           # Asset display card
│   │   │   ├── Chatbot.js             # AI chatbot interface
│   │   │   ├── LiabilityCard.js       # Liability display card
│   │   │   ├── LoadingSpinner.js      # Loading animation
│   │   │   ├── ProfileMenu.js         # User profile management
│   │   │   └── RecommendationCard.js  # Financial recommendations
│   │   ├── pages/              # Page Components
│   │   │   ├── AssetView.js           # Asset management page
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   ├── LiabilityView.js       # Liability management page
│   │   │   ├── Login.js               # Authentication page
│   │   │   ├── Register.js            # User registration
│   │   │   └── RecommendationView.js  # Recommendations page
│   │   ├── services/           # API Services
│   │   │   ├── api.js                 # Backend API integration
│   │   │   └── mockData.js            # Demo data service
│   │   ├── App.js              # Main React application
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── .env                    # Frontend environment variables
├── README.md                   # This file
├── start_frontend.bat          # Frontend launcher script
└── start_fullstack.bat         # Full application launcher


## 🚀 Quick Start

### Prerequisites
- *Node.js* (v14 or higher)
- *Python* (v3.8 or higher)
- *npm* or *yarn*

### 1. Backend Setup (Flask)

bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py


The backend will be available at http://127.0.0.1:5000

### 2. Frontend Setup (React)

bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start


The frontend will be available at http://localhost:3000

### 3. Demo Login

Use these credentials to access the demo:
- *Email*: demo@example.com
- *Password*: demo123

## 🎯 How to Use

### 1. Dashboard Navigation
- Login with demo credentials
- View your financial overview on the main dashboard
- Navigate between Assets, Liabilities, and Recommendations

### 2. AI Chatbot Interaction
- Click the chatbot icon in the bottom-right corner
- Try these sample commands:
  - "I spent $15 on lunch at Chipotle today"
  - "I bought 10 shares of AAPL at $150"
  - "Help me understand my budget"
  - "What should I pay first?"

### 3. Financial Management
- *Assets*: Add savings accounts, investments, property
- *Liabilities*: Track loans, credit cards, recurring payments
- *Recommendations*: Review AI-generated financial advice

## 🔧 Technology Stack

### Frontend
- *React 18.2.0* - Modern JavaScript framework
- *Tailwind CSS 3.3.0* - Utility-first CSS framework
- *React Router 6.3.0* - Client-side routing
- *Axios* - HTTP client for API calls

### Backend
- *Flask 2.3.2* - Python web framework
- *SQLite* - Lightweight database
- *Flask-CORS* - Cross-origin resource sharing
- *Cerebras Cloud SDK* - AI integration for Llama model

### AI Integration
- *Llama 4 Scout 17B* - Large language model for financial advice
- *Natural Language Processing* - Understanding financial queries
- *Structured Data Extraction* - Converting text to financial records

## 📊 Database Schema

### Core Tables
- *sessions* - Chat session management
- *messages* - Chat history storage
- *expenses* - User expense records
- *trades* - Investment transaction records

### Demo Data
- Sample assets: $8,700 total value
- Sample liabilities: $16,200 total amount
- Pre-loaded chat conversations
- Realistic financial scenarios

## 🔗 API Endpoints

### Authentication
- POST /api/auth/login - User authentication
- POST /api/auth/register - User registration

### Financial Data
- GET /api/dashboard - Dashboard overview data
- GET /api/assets - User assets list
- GET /api/liabilities - User liabilities list
- GET /api/recommendations - Financial recommendations

### AI Chatbot
- POST /api/sessions - Create chat session
- GET /api/sessions/<id>/messages - Get chat history
- POST /api/chat - Send message to AI assistant

## 🎨 UI/UX Features

### Design Elements
- *Gradient Backgrounds* - Professional blue color scheme
- *Interactive Cards* - Hover effects and animations
- *Responsive Grid* - Adapts to all screen sizes
- *Loading States* - Smooth user experience
- *Error Handling* - User-friendly error messages

### Accessibility
- *Keyboard Navigation* - Full keyboard support
- *Screen Reader Compatible* - ARIA labels and semantic HTML
- *High Contrast* - Readable color combinations
- *Mobile Optimized* - Touch-friendly interface

## 🔒 Security Features

- *Environment Variables* - Sensitive data protection
- *CORS Configuration* - Secure cross-origin requests
- *Input Validation* - Prevent malicious inputs
- *Session Management* - Secure chat sessions

## 🚀 Deployment

### Local Development
bash
# Start backend
cd backend && python app.py

# Start frontend (in new terminal)
cd frontend && npm start


### Production Considerations
- Use environment variables for sensitive data
- Configure production database (PostgreSQL recommended)
- Set up reverse proxy (nginx recommended)
- Enable HTTPS/SSL certificates

## 🤝 Contributing

1. *Fork* the repository
2. *Create* a feature branch (git checkout -b feature/amazing-feature)
3. *Commit* your changes (git commit -m 'Add amazing feature')
4. *Push* to the branch (git push origin feature/amazing-feature)
5. *Open* a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

*Backend not starting:*
bash
# Check Python version
python --version

# Install dependencies
pip install -r requirements.txt

# Check for port conflicts
netstat -ano | findstr :5000


*Frontend compilation errors:*
bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install


*Database issues:*
bash
# The SQLite database is created automatically
# If corrupted, delete finance.db and restart the backend


## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🎉 Acknowledgments

- *Cerebras* for Llama AI integration
- *React* and *Flask* communities
- *Tailwind CSS* for the beautiful UI framework
- *OpenAI* for inspiration in AI assistant design

---

*Made with ❤ for better financial management*