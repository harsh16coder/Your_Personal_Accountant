import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../services/api';

const RecommendationView = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getRecommendations();
      setRecommendations(response);
      setError(null);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-primary-blue hover:text-dark-blue mb-2 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Payment Recommendations</h1>
            <p className="text-gray-600">Optimized payment schedule based on priority and budget</p>
          </div>
          <button
            onClick={fetchRecommendations}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition-colors duration-200"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {recommendations && (
          <>
            {/* Budget Overview */}
            <BudgetOverview recommendations={recommendations} />

            {/* Recommendation Cards */}
            <RecommendationList recommendations={recommendations.recommendations} />
          </>
        )}
      </div>
    </div>
  );
};

const BudgetOverview = ({ recommendations }) => {
  const utilizationPercentage = recommendations.total_income > 0 
    ? ((recommendations.available_budget - recommendations.remaining_budget) / recommendations.available_budget) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Monthly Income</h3>
        <p className="text-2xl font-bold text-gray-900">
          ${recommendations.total_income.toLocaleString()}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Available Budget</h3>
        <p className="text-2xl font-bold text-blue-600">
          ${recommendations.available_budget.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">70% of income allocated</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Remaining Budget</h3>
        <p className="text-2xl font-bold text-green-600">
          ${recommendations.remaining_budget.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">After recommended payments</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Budget Utilization</h3>
        <p className="text-2xl font-bold text-purple-600">
          {utilizationPercentage.toFixed(1)}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const RecommendationList = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-gray-600">You have no active liabilities requiring immediate attention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Payment Priority Recommendations ({recommendations.length} items)
      </h2>
      
      {recommendations.map((recommendation, index) => (
        <RecommendationCard 
          key={index} 
          recommendation={recommendation} 
          rank={index + 1}
        />
      ))}
    </div>
  );
};

const RecommendationCard = ({ recommendation, rank }) => {
  const { liability, priority_score, recommended_action, amount, urgency } = recommendation;
  
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionColor = (action) => {
    if (action?.includes('Pay this month')) return 'text-green-600';
    if (action?.includes('Defer')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return 'bg-red-500';
    if (rank <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start justify-between">
        {/* Left side - Liability info */}
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-full ${getRankColor(rank)} text-white flex items-center justify-center text-sm font-bold mr-3`}>
              {rank}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {liability.liability_type}
              </h3>
              <p className="text-sm text-gray-500">
                {liability.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Amount Due</p>
              <p className="text-sm font-semibold text-gray-900">
                ${amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Next Due</p>
              <p className="text-sm font-semibold text-gray-900">
                {liability.next_due_date ? new Date(liability.next_due_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Priority Score</p>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900 mr-2">
                  {priority_score}/100
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  priority_score >= 80 ? 'bg-red-500' :
                  priority_score >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
              <p className="text-sm font-semibold text-gray-900">
                {liability.installments_paid}/{liability.installments_total}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(urgency)}`}>
              {urgency} Priority
            </span>
            <span className={`text-sm font-medium ${getActionColor(recommended_action)}`}>
              Recommended: {recommended_action}
            </span>
          </div>
        </div>

        {/* Right side - Progress indicator */}
        <div className="ml-6">
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray={`${(liability.installments_paid / liability.installments_total) * 100}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {Math.round((liability.installments_paid / liability.installments_total) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Action bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Remaining: <span className="font-semibold">${liability.remaining_amount.toLocaleString()}</span>
          </div>
          {recommended_action?.includes('Pay this month') && (
            <button className="bg-primary-blue text-white px-4 py-2 rounded hover:bg-dark-blue transition-colors duration-200 text-sm">
              Schedule Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationView;