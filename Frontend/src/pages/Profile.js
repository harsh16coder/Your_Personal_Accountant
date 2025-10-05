import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getAvailableModels } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    monthly_income: '',
    currency_preference: 'USD',
    cerebras_api_key: '',
    selected_model: 'llama3.1-8b'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.has_api_key && editMode) {
      fetchAvailableModels();
    }
  }, [profile?.has_api_key, editMode]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setProfile(response.profile);
      setFormData({
        name: response.profile.name || '',
        monthly_income: response.profile.monthly_income || '',
        currency_preference: response.profile.currency_preference || 'USD',
        cerebras_api_key: '',  // Don't pre-fill for security
        selected_model: response.profile.selected_model || 'llama3.1-8b'
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModels = async () => {
    if (!profile?.has_api_key) {
      return; // Can't fetch models without API key
    }
    
    try {
      setLoadingModels(true);
      const response = await getAvailableModels();
      setAvailableModels(response.models || []);
    } catch (err) {
      console.error('Failed to fetch available models:', err);
      // Don't show error for models - it's not critical
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const updateData = {
        name: formData.name,
        monthly_income: parseFloat(formData.monthly_income) || 0,
        currency_preference: formData.currency_preference,
        selected_model: formData.selected_model
      };

      // Only include API key if it's provided
      if (formData.cerebras_api_key.trim()) {
        updateData.cerebras_api_key = formData.cerebras_api_key.trim();
      }

      await updateProfile(updateData);
      await fetchProfile(); // Refresh profile data
      setEditMode(false);
      setFormData(prev => ({ ...prev, cerebras_api_key: '' })); // Clear API key field
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: profile?.name || '',
      monthly_income: profile?.monthly_income || '',
      currency_preference: profile?.currency_preference || 'USD',
      cerebras_api_key: '',
      selected_model: profile?.selected_model || 'llama3.1-8b'
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition-colors duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <div className="p-6">
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthly_income}
                        onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency Preference</label>
                      <select
                        value={formData.currency_preference}
                        onChange={(e) => setFormData({...formData, currency_preference: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Assistant Configuration</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Cerebras API Key Required</p>
                        <p className="text-sm text-blue-700 mt-1">
                          To use the AI-powered financial assistant, you need a Cerebras API key. 
                          Get your free API key from{' '}
                          <a href="https://cloud.cerebras.ai/" target="_blank" rel="noopener noreferrer" className="font-medium underline">
                            cloud.cerebras.ai
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cerebras API Key
                      {profile?.has_api_key && (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Configured
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={formData.cerebras_api_key}
                        onChange={(e) => setFormData({...formData, cerebras_api_key: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        placeholder={profile?.has_api_key ? "Enter new API key to update" : "csk-..."}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showApiKey ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {profile?.has_api_key ? (
                        <>Current key: {profile.api_key_preview}</>
                      ) : (
                        <>API key must start with 'csk-'. Leave empty to keep current key.</>
                      )}
                    </p>
                  </div>

                  {/* Model Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model Selection
                    </label>
                    {profile?.has_api_key ? (
                      <div>
                        <select
                          value={formData.selected_model}
                          onChange={(e) => setFormData({...formData, selected_model: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                          disabled={loadingModels}
                        >
                          <option value="llama3.1-8b">llama3.1-8b (Default)</option>
                          {availableModels.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                        {loadingModels && (
                          <p className="text-xs text-blue-600 mt-1">Loading available models...</p>
                        )}
                        {!loadingModels && availableModels.length === 0 && profile?.has_api_key && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Unable to fetch models. Using default model.
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Choose which AI model to use for financial assistance. Different models may have different capabilities.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          Configure your API key first to see available models
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue disabled:opacity-50 transition-colors duration-200"
                  >
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* View Mode */}
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg text-gray-800">{profile?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-800">{profile?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Monthly Income</label>
                      <p className="text-lg text-gray-800">
                        {profile?.monthly_income ? `$${profile.monthly_income.toLocaleString()}` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Currency Preference</label>
                      <p className="text-lg text-gray-800">{profile?.currency_preference}</p>
                    </div>
                  </div>
                </div>

                {/* API Configuration Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Assistant Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${profile?.has_api_key ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className={`font-medium ${profile?.has_api_key ? 'text-green-700' : 'text-red-700'}`}>
                          {profile?.has_api_key ? 'API Key Configured' : 'API Key Required'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {profile?.has_api_key 
                            ? `Current key: ${profile.api_key_preview}` 
                            : 'Configure your Cerebras API key to use the AI assistant'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {profile?.has_api_key && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Selected AI Model</label>
                        <p className="text-lg text-gray-800">{profile?.selected_model || 'llama3.1-8b'}</p>
                        <p className="text-sm text-gray-600">The AI model currently being used for financial assistance</p>
                      </div>
                    )}
                  </div>
                  
                  {!profile?.has_api_key && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Action Required</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            The AI assistant requires a Cerebras API key to function. Get your free key from{' '}
                            <a href="https://cloud.cerebras.ai/" target="_blank" rel="noopener noreferrer" className="font-medium underline">
                              cloud.cerebras.ai
                            </a>{' '}
                            and add it to your profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Member Since</label>
                      <p className="text-lg text-gray-800">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-lg text-gray-800">
                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;