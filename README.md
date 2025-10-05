# 💰 Your Personal Accountant

A comprehensive AI-powered personal finance management application featuring an intelligent chatbot, advanced payment systems, real-time updates, and multi-model LLM support. Built with React frontend and Flask backend, integrated with Cerebras Cloud for intelligent financial assistance.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/Your_Personal_Accountant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.2-green.svg)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

## 🌟 Key Features

### 🤖 AI-Powered Financial Assistant
- Natural Language Processing for intuitive communication
- Multi-Model LLM Support (Cerebras AI models)
- User-Configurable API Keys
- Intelligent Expense Recording and Trade Logging
- Personalized Financial Guidance
- Security-First Design with prompt injection protection

### 💳 Advanced Payment Management
- Flexible payment options (full payoff, partial, installments)
- Payment progress tracking with accurate calculations
- Multiple payment methods (chatbot or manual interface)
- Dynamic payment validation
- Complete transaction history

### 📊 Comprehensive Financial Dashboard
- Real-time overview of assets, liabilities, and net worth
- Asset management (savings, investments, properties)
- Smart liability tracking with priority scoring
- AI-generated financial recommendations
- Interactive financial cards with hover effects

### 🔄 Real-Time Data Synchronization
- Live updates across all components
- Context-aware refreshing
- No manual refresh required
- Cross-component synchronization

## 📚 Documentation

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Quick setup and installation
- **[Project Architecture](docs/ARCHITECTURE.md)** - Technical structure and design
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Features Guide](docs/FEATURES.md)** - Detailed feature documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Security](docs/SECURITY.md)** - Security features and best practices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Cerebras AI API Key - [Get yours here](https://cloud.cerebras.ai/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/Your_Personal_Accountant.git
cd Your_Personal_Accountant
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configurations
python app.py
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend: http://127.0.0.1:5000

### Demo Login
- **Email**: demo@example.com
- **Password**: demo123

## 🛠️ Technology Stack

**Frontend:** React 18.2.0, Tailwind CSS, React Router, Axios  
**Backend:** Flask 2.3.2, SQLite, Flask-CORS, JWT  
**AI Integration:** Cerebras Cloud SDK, Llama 4 Scout 17B

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical information.

## 📖 Usage Examples

### AI Chatbot Commands
```
💬 "I spent $15 on lunch at Chipotle today"
📈 "I bought 10 shares of AAPL at $150"
💳 "Pay off my credit card completely"
💡 "Help me understand my budget"
```

See [FEATURES.md](docs/FEATURES.md) for complete usage guide.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: your-email@example.com
- 🐛 [Report Bug](https://github.com/your-username/Your_Personal_Accountant/issues)
- ✨ [Request Feature](https://github.com/your-username/Your_Personal_Accountant/issues)
- 📖 [Documentation](docs/)

## 🙏 Acknowledgments

- **[Cerebras](https://cerebras.ai/)** - Advanced AI infrastructure
- **[React Team](https://reactjs.org/)** - Frontend framework
- **[Flask Community](https://flask.palletsprojects.com/)** - Backend framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Beautiful UI framework

---

<div align="center">

**Made with ❤️ for better financial management**

[🌐 Website](https://your-website.com) • [📧 Email](mailto:your-email@example.com) • [🐛 Issues](https://github.com/your-username/Your_Personal_Accountant/issues)

⭐ Star this repository if it helped you manage your finances better!

</div>
