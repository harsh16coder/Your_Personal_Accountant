// Mock data service for frontend development
const mockUsers = [
  {
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    name: 'Demo User',
    currency_preference: 'USD',
    monthly_salary: 5000,
    other_income: 500,
    created_at: '2024-01-01T00:00:00.000Z'
  }
];

const mockAssets = [
  {
    id: 1,
    user_id: 1,
    asset_type: 'Salary',
    asset_value: 5000,
    date_received: '2024-09-01',
    description: 'Monthly salary deposit',
    created_at: '2024-09-01T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: 1,
    asset_type: 'Investment',
    asset_value: 2500,
    date_received: '2024-08-15',
    description: 'Stock portfolio gains',
    created_at: '2024-08-15T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: 1,
    asset_type: 'Business Income',
    asset_value: 1200,
    date_received: '2024-09-10',
    description: 'Freelance project payment',
    created_at: '2024-09-10T00:00:00.000Z'
  }
];

const mockLiabilities = [
  {
    id: 1,
    user_id: 1,
    liability_type: 'Education',
    liability_amount: 5000,
    installments_total: 10,
    installments_paid: 3,
    installment_amount: 500,
    frequency: 'monthly',
    due_date: '2024-10-15',
    next_due_date: '2024-10-15',
    importance_score: 90,
    priority: 95,
    remaining_amount: 3500,
    is_completed: false,
    description: 'University tuition fees',
    created_at: '2024-07-01T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: 1,
    liability_type: 'EMI/Loan',
    liability_amount: 15000,
    installments_total: 24,
    installments_paid: 8,
    installment_amount: 625,
    frequency: 'monthly',
    due_date: '2024-10-05',
    next_due_date: '2024-10-05',
    importance_score: 75,
    priority: 82,
    remaining_amount: 10000,
    is_completed: false,
    description: 'Car loan EMI',
    created_at: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 3,
    user_id: 1,
    liability_type: 'Credit Card',
    liability_amount: 2000,
    installments_total: 4,
    installments_paid: 1,
    installment_amount: 500,
    frequency: 'monthly',
    due_date: '2024-10-25',
    next_due_date: '2024-10-25',
    importance_score: 85,
    priority: 88,
    remaining_amount: 1500,
    is_completed: false,
    description: 'Credit card outstanding',
    created_at: '2024-09-01T00:00:00.000Z'
  },
  {
    id: 4,
    user_id: 1,
    liability_type: 'Rent',
    liability_amount: 1200,
    installments_total: 1,
    installments_paid: 0,
    installment_amount: 1200,
    frequency: 'monthly',
    due_date: '2024-10-01',
    next_due_date: '2024-10-01',
    importance_score: 95,
    priority: 98,
    remaining_amount: 1200,
    is_completed: false,
    description: 'Monthly apartment rent',
    created_at: '2024-09-01T00:00:00.000Z'
  }
];

const mockChatMessages = [
  {
    type: 'bot',
    content: 'Hello Demo User! Welcome to your Personal Accountant. I can see you have some liabilities to manage. Would you like me to help you prioritize them?',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    type: 'user',
    content: 'Yes, please help me understand which payments I should prioritize.',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    type: 'bot',
    content: 'Based on your current data, here\'s what I recommend:\n\n1. **Rent** - Due Oct 1st (Priority: 98/100)\n2. **Education** - Due Oct 15th (Priority: 95/100)\n3. **Credit Card** - Due Oct 25th (Priority: 88/100)\n4. **Car Loan** - Due Oct 5th (Priority: 82/100)\n\nYour rent has the highest priority due to its importance and due date. Would you like me to create a payment schedule?',
    timestamp: new Date(Date.now() - 3400000)
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAPI = {
  // Auth functions
  login: async (credentials) => {
    await delay(500);
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      return {
        access_token: 'mock_jwt_token_12345',
        user: mockUsers[0]
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    await delay(800);
    const newUser = {
      ...mockUsers[0],
      ...userData,
      id: Date.now()
    };
    return {
      access_token: 'mock_jwt_token_' + Date.now(),
      secret_key: 'mock-secret-key-' + Math.random().toString(36).substr(2, 9),
      user: newUser
    };
  },

  // Dashboard functions
  getDashboard: async () => {
    await delay(300);
    const totalAssets = mockAssets.reduce((sum, asset) => sum + asset.asset_value, 0);
    const activeLiabilities = mockLiabilities.filter(l => !l.is_completed);
    const totalLiabilities = activeLiabilities.reduce((sum, l) => sum + l.remaining_amount, 0);
    const highPriorityLiabilities = activeLiabilities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(liability => ({ liability, priority_score: liability.priority }));

    return {
      user: mockUsers[0],
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: totalAssets - totalLiabilities,
      active_liabilities_count: activeLiabilities.length,
      high_priority_liabilities: highPriorityLiabilities
    };
  },

  // Asset functions
  getAssets: async () => {
    await delay(400);
    return { assets: mockAssets };
  },

  getTentativeAssets: async () => {
    await delay(300);
    return { tentative_assets: [] };
  },

  createAsset: async (assetData) => {
    await delay(500);
    const newAsset = {
      ...assetData,
      id: Date.now(),
      user_id: 1,
      created_at: new Date().toISOString()
    };
    mockAssets.push(newAsset);
    return { asset: newAsset };
  },

  // Liability functions
  getLiabilities: async () => {
    await delay(400);
    return { liabilities: mockLiabilities };
  },

  createLiability: async (liabilityData) => {
    await delay(600);
    const newLiability = {
      ...liabilityData,
      id: Date.now(),
      user_id: 1,
      installments_paid: 0,
      priority: Math.floor(Math.random() * 40) + 60,
      remaining_amount: liabilityData.liability_amount,
      is_completed: false,
      created_at: new Date().toISOString()
    };
    if (!newLiability.installment_amount) {
      newLiability.installment_amount = newLiability.liability_amount / newLiability.installments_total;
    }
    mockLiabilities.push(newLiability);
    return { liability: newLiability };
  },

  payInstallment: async (liabilityId) => {
    await delay(400);
    const liability = mockLiabilities.find(l => l.id === parseInt(liabilityId));
    if (liability && liability.installments_paid < liability.installments_total) {
      liability.installments_paid += 1;
      liability.remaining_amount = (liability.installments_total - liability.installments_paid) * liability.installment_amount;
      if (liability.installments_paid >= liability.installments_total) {
        liability.is_completed = true;
        liability.remaining_amount = 0;
      }
    }
    return { liability };
  },

  // Recommendations
  getRecommendations: async () => {
    await delay(500);
    const user = mockUsers[0];
    const totalIncome = user.monthly_salary + user.other_income;
    const availableBudget = totalIncome * 0.7;
    
    const activeLiabilities = mockLiabilities.filter(l => !l.is_completed);
    const recommendations = activeLiabilities
      .sort((a, b) => b.priority - a.priority)
      .map(liability => ({
        liability,
        priority_score: liability.priority,
        recommended_action: availableBudget >= liability.installment_amount ? 'Pay this month' : 'Defer or partial payment',
        amount: liability.installment_amount,
        urgency: liability.priority > 90 ? 'High' : liability.priority > 75 ? 'Medium' : 'Low'
      }));

    let remainingBudget = availableBudget;
    recommendations.forEach(rec => {
      if (rec.recommended_action === 'Pay this month') {
        remainingBudget -= rec.amount;
      }
    });

    return {
      total_income: totalIncome,
      available_budget: availableBudget,
      remaining_budget: Math.max(0, remainingBudget),
      recommendations
    };
  },

  // Chat functions
  sendChatMessage: async (messageData) => {
    await delay(800);
    
    // Simple response logic based on message content
    const message = messageData.message.toLowerCase();
    let response = '';
    
    if (message.includes('hello') || message.includes('hi')) {
      response = 'Hello! I\'m your Personal Finance Assistant. I can help you manage your budget, prioritize payments, and provide financial advice. What would you like to know?';
    } else if (message.includes('recommend') || message.includes('priority')) {
      response = 'Based on your current liabilities, I recommend paying your rent first (due Oct 1st), followed by education fees (due Oct 15th). These have the highest priority scores. Would you like me to create a detailed payment schedule?';
    } else if (message.includes('budget') || message.includes('money')) {
      response = 'Your monthly income is $5,500 ($5,000 salary + $500 other income). With 70% allocated for expenses and debt payments ($3,850), you have good flexibility. Would you like me to analyze your spending capacity?';
    } else if (message.includes('help')) {
      response = 'I can help you with:\n• Prioritizing debt payments\n• Creating budget plans\n• Analyzing your financial situation\n• Setting up payment schedules\n• Tracking your assets and liabilities\n\nWhat specific area would you like assistance with?';
    } else {
      response = 'I understand you\'re asking about financial planning. Could you be more specific? I can help with budgeting, debt management, payment priorities, or general financial advice.';
    }

    return {
      response,
      conversation_state: messageData.conversation_state || {},
      user_context: {
        user: mockUsers[0],
        total_assets: mockAssets.reduce((sum, a) => sum + a.asset_value, 0),
        total_liabilities: mockLiabilities.reduce((sum, l) => sum + l.remaining_amount, 0)
      }
    };
  },

  // Get initial chat messages for demo
  getChatHistory: async () => {
    await delay(200);
    return mockChatMessages;
  }
};