import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import { clearStoredChatSession } from './Chatbot';
import { getSecretKey } from '../services/api';

const ProfileMenu = ({ user, onProfileUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [secretKeyData, setSecretKeyData] = useState({ password: '', secretKey: '', error: '', loading: false });
  const [editData, setEditData] = useState({
    name: user?.name || '',
    currency_preference: user?.currency_preference || 'USD',
    monthly_salary: user?.monthly_salary || 0,
    other_income: user?.other_income || 0
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth(); // Clear all authentication data
    clearStoredChatSession(); // Clear chat session data
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API call
      console.log('Saving profile:', editData);
      setIsEditing(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleGetSecretKey = async () => {
    if (!secretKeyData.password) {
      setSecretKeyData(prev => ({ ...prev, error: 'Password is required' }));
      return;
    }

    setSecretKeyData(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await getSecretKey({ password: secretKeyData.password });
      setSecretKeyData(prev => ({ 
        ...prev, 
        secretKey: response.secret_key, 
        loading: false 
      }));
    } catch (error) {
      setSecretKeyData(prev => ({ 
        ...prev, 
        error: error.response?.data?.error || 'Failed to retrieve secret key',
        loading: false 
      }));
    }
  };

  const handleCloseSecretKey = () => {
    setShowSecretKey(false);
    setSecretKeyData({ password: '', secretKey: '', error: '', loading: false });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency_preference || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card-blue rounded-lg shadow-lg">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-primary-blue transition-colors duration-200 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">User Profile</h3>
          <div className="text-sm text-blue-100">Settings</div>
          <div className="mt-2">
            <svg 
              className={`w-5 h-5 text-white mx-auto transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="bg-white rounded-b-lg p-4 border-t-2 border-primary-blue">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-card-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800">{user?.name || 'User'}</h4>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{user?.currency_preference || 'USD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Salary:</span>
                  <span className="font-medium">{formatCurrency(user?.monthly_salary || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Income:</span>
                  <span className="font-medium">{formatCurrency(user?.other_income || 0)}</span>
                </div>
              </div>

              {/* Custom Preferences */}
              <div className="border-t pt-3">
                <h5 className="font-medium text-gray-800 mb-2">Custom Preferences</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Liquid Asset selling priority</p>
                  <p>• Liabilities Payment Priority</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Manage Profile & API Key
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200"
                >
                  Quick Edit Profile
                </button>
                <button
                  onClick={() => setShowSecretKey(true)}
                  className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                  View Secret Key
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-center">Edit Profile</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={editData.currency_preference}
                    onChange={(e) => setEditData({...editData, currency_preference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary</label>
                  <input
                    type="number"
                    value={editData.monthly_salary}
                    onChange={(e) => setEditData({...editData, monthly_salary: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Income</label>
                  <input
                    type="number"
                    value={editData.other_income}
                    onChange={(e) => setEditData({...editData, other_income: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Secret Key Modal */}
      {showSecretKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V7a2 2 0 012-2m6 2a2 2 0 00-2-2m0 0a2 2 0 00-2-2v6a2 2 0 002 2h6M7 7h6v6H7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">View Secret Key</h3>
              <p className="text-gray-600 mb-4">Enter your password to view your secret key</p>
              
              {!secretKeyData.secretKey ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={secretKeyData.password}
                      onChange={(e) => setSecretKeyData(prev => ({ ...prev, password: e.target.value, error: '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  
                  {secretKeyData.error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                      {secretKeyData.error}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleGetSecretKey}
                      disabled={secretKeyData.loading}
                      className="flex-1 bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-dark-blue disabled:opacity-50 transition-colors duration-200"
                    >
                      {secretKeyData.loading ? 'Verifying...' : 'Show Secret Key'}
                    </button>
                    <button
                      onClick={handleCloseSecretKey}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">{secretKeyData.secretKey}</p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <p className="text-xs text-yellow-700">
                          Use this secret key to reset your password if you forget it.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCloseSecretKey}
                    className="w-full bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-dark-blue transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;