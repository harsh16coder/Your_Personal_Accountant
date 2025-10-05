import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiabilities, createLiability, updateLiability, makeLiabilityPayment, getLiabilityTypes, getAssets } from '../services/api';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const LiabilityView = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingLiability, setEditingLiability] = useState(null);
  const [payingLiability, setPayingLiability] = useState(null);
  const navigate = useNavigate();
  const { getRefreshTrigger, triggerRefresh } = useDataRefresh();

  useEffect(() => {
    fetchLiabilities();
  }, []);

  // Listen for refresh triggers
  useEffect(() => {
    const refreshTrigger = getRefreshTrigger('liabilities');
    if (refreshTrigger > 0 && liabilities.length >= 0) { // Refresh if we have initial data or empty array
      fetchLiabilities();
    }
  }, [getRefreshTrigger('liabilities')]);

  const fetchLiabilities = async () => {
    try {
      setLoading(true);
      const response = await getLiabilities();
      setLiabilities(response.liabilities);
      setError(null);
    } catch (err) {
      setError('Failed to load liabilities');
      console.error('Liability data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiability = async (liabilityData) => {
    try {
      await createLiability(liabilityData);
      await fetchLiabilities();
      setShowAddForm(false);
      // Trigger refresh for other components
      triggerRefresh(['liabilities', 'dashboard', 'recommendations']);
    } catch (err) {
      console.error('Failed to add liability:', err);
    }
  };

  const handleEditLiability = async (liabilityData) => {
    try {
      await updateLiability(editingLiability.id, liabilityData);
      await fetchLiabilities();
      setShowEditForm(false);
      setEditingLiability(null);
      // Trigger refresh for other components
      triggerRefresh(['liabilities', 'dashboard', 'recommendations']);
    } catch (err) {
      console.error('Failed to update liability:', err);
    }
  };

  const openEditForm = (liability) => {
    setEditingLiability(liability);
    setShowEditForm(true);
  };

  const openPaymentForm = (liability) => {
    setPayingLiability(liability);
    setShowPaymentForm(true);
  };

  const handleMakePayment = async (paymentData) => {
    try {
      await makeLiabilityPayment(payingLiability.id, paymentData);
      await fetchLiabilities();
      setShowPaymentForm(false);
      setPayingLiability(null);
      // Trigger refresh for other components (payment affects assets, liabilities, dashboard, and recommendations)
      triggerRefresh(['liabilities', 'assets', 'dashboard', 'recommendations']);
    } catch (err) {
      console.error('Failed to make payment:', err);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handlePayInstallment = async (liabilityId) => {
    try {
      await makeLiabilityPayment(liabilityId, { payment_type: 'installment' });
      await fetchLiabilities();
      // Trigger refresh for other components
      triggerRefresh(['liabilities', 'assets', 'dashboard', 'recommendations']);
    } catch (err) {
      console.error('Failed to pay installment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading liabilities...</div>
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
            <h1 className="text-3xl font-bold text-gray-800">Liability Management</h1>
            <p className="text-gray-600">Track and manage your debts and obligations</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition-colors duration-200"
          >
            Add Liability
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Liabilities</h3>
            <p className="text-2xl font-bold text-gray-900">
              {liabilities.filter(l => !l.is_completed).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${liabilities.reduce((sum, l) => sum + (l.is_completed ? 0 : l.remaining_amount), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {liabilities.filter(l => l.is_completed).length}
            </p>
          </div>
        </div>

        {/* Liability Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <LiabilityTable 
            liabilities={liabilities} 
            onPayInstallment={handlePayInstallment}
            onMakePayment={openPaymentForm}
            onEdit={openEditForm}
          />
        </div>

        {/* Add Liability Modal */}
        {showAddForm && (
          <AddLiabilityModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAdd={handleAddLiability}
          />
        )}

        {/* Payment Modal */}
        {showPaymentForm && payingLiability && (
          <PaymentModal
            isOpen={showPaymentForm}
            onClose={() => {
              setShowPaymentForm(false);
              setPayingLiability(null);
            }}
            onPay={handleMakePayment}
            liability={payingLiability}
          />
        )}

        {/* Edit Liability Modal */}
        {showEditForm && editingLiability && (
          <EditLiabilityModal
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              setEditingLiability(null);
            }}
            onSave={handleEditLiability}
            liability={editingLiability}
          />
        )}
      </div>
    </div>
  );
};

const LiabilityTable = ({ liabilities, onPayInstallment, onMakePayment, onEdit }) => {
  if (liabilities.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">No liabilities recorded yet</p>
      </div>
    );
  }

  // Sort liabilities by priority score
  const sortedLiabilities = [...liabilities].sort((a, b) => b.priority - a.priority);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Liability Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Due
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedLiabilities.map((liability, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {liability.liability_type}
                  </div>
                  <div className="text-sm text-gray-500">
                    {liability.description}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  ${liability.liability_amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  ${liability.installment_amount.toLocaleString()} per {liability.frequency}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{liability.installments_paid}/{liability.installments_total} installments</span>
                      <span>${(liability.total_amount - liability.remaining_amount).toLocaleString()} / ${liability.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Amount Progress:</span>
                      <span>{Math.round(((liability.total_amount - liability.remaining_amount) / liability.total_amount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-blue h-2 rounded-full" 
                        style={{ width: `${((liability.total_amount - liability.remaining_amount) / liability.total_amount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {liability.next_due_date ? new Date(liability.next_due_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{liability.priority}</span>
                  <div className={`ml-2 w-2 h-2 rounded-full ${
                    liability.priority >= 80 ? 'bg-red-500' :
                    liability.priority >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-500">
                  Importance: {liability.importance_score}/100
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  liability.is_completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {liability.is_completed ? 'Completed' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(liability)}
                  className="text-primary-blue hover:text-dark-blue bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded"
                >
                  Edit
                </button>
                {!liability.is_completed && (
                  <>
                    <button
                      onClick={() => onPayInstallment(liability.id)}
                      className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                    >
                      Pay Installment
                    </button>
                    <button
                      onClick={() => onMakePayment(liability)}
                      className="text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded"
                    >
                      Make Payment
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddLiabilityModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    liability_type: '',
    custom_liability_type: '',
    liability_amount: '',
    installments_total: '1',
    frequency: 'monthly',
    due_date: '',
    priority_score: '50',
    interest_rate: '0',
    description: ''
  });
  const [availableLiabilityTypes, setAvailableLiabilityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLiabilityTypes();
      // Reset form when modal opens
      setFormData({
        liability_type: '',
        custom_liability_type: '',
        liability_amount: '',
        installments_total: '1',
        frequency: 'monthly',
        due_date: '',
        priority_score: '50',
        interest_rate: '0',
        description: ''
      });
      setShowCustomType(false);
    }
  }, [isOpen]);

  const fetchLiabilityTypes = async () => {
    try {
      const response = await getLiabilityTypes();
      setAvailableLiabilityTypes(response.liability_types || []);
    } catch (error) {
      console.error('Failed to fetch liability types:', error);
      // Fallback to default types
      setAvailableLiabilityTypes([
        "Credit Card",
        "Student Loan", 
        "Car Loan",
        "Mortgage",
        "Personal Loan",
        "Rent",
        "Utilities",
        "Insurance",
        "Subscription",
        "Other"
      ]);
    }
  };

  const handleLiabilityTypeChange = (value) => {
    setFormData({...formData, liability_type: value});
    setShowCustomType(value === 'Other' || value === 'Custom');
  };

  const getPriorityLabel = (score) => {
    if (score >= 80) return 'High Priority';
    if (score >= 50) return 'Medium Priority';
    return 'Low Priority';
  };

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const finalLiabilityType = showCustomType && formData.custom_liability_type 
        ? formData.custom_liability_type 
        : formData.liability_type;

      const liabilityData = {
        liability_type: finalLiabilityType,
        liability_amount: parseFloat(formData.liability_amount),
        installments_total: parseInt(formData.installments_total),
        frequency: formData.frequency,
        due_date: formData.due_date,
        priority_score: parseInt(formData.priority_score),
        interest_rate: parseFloat(formData.interest_rate),
        description: formData.description
      };

      await onAdd(liabilityData);
    } catch (error) {
      console.error('Failed to add liability:', error);
      alert('Failed to add liability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add New Liability</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liability Type</label>
            <select
              required
              value={formData.liability_type}
              onChange={(e) => handleLiabilityTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select liability type</option>
              {availableLiabilityTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
              <option value="Custom">+ Add Custom Type</option>
            </select>
          </div>

          {showCustomType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Liability Type</label>
              <input
                type="text"
                required
                value={formData.custom_liability_type}
                onChange={(e) => setFormData({...formData, custom_liability_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="Enter custom liability type"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.liability_amount}
              onChange={(e) => setFormData({...formData, liability_amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments</label>
              <input
                type="number"
                required
                min="1"
                value={formData.installments_total}
                onChange={(e) => setFormData({...formData, installments_total: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                required
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Due Date</label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Score: {formData.priority_score}/100
              <span className={`ml-2 text-sm font-medium ${getPriorityColor(parseInt(formData.priority_score))}`}>
                ({getPriorityLabel(parseInt(formData.priority_score))})
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.priority_score}
              onChange={(e) => setFormData({...formData, priority_score: e.target.value})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Priority</span>
              <span>Medium Priority</span>
              <span>High Priority</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.interest_rate}
              onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              rows="3"
              placeholder="Additional notes about this liability (optional)"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Liability'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditLiabilityModal = ({ isOpen, onClose, onSave, liability }) => {
  const [formData, setFormData] = useState({
    liability_type: '',
    liability_amount: '',
    installments_total: '1',
    frequency: 'monthly',
    due_date: '',
    priority_score: '50',
    interest_rate: '0',
    description: ''
  });
  const [availableLiabilityTypes, setAvailableLiabilityTypes] = useState([]);
  const [isCustomType, setIsCustomType] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && liability) {
      // Pre-populate form with liability data
      setFormData({
        liability_type: liability.liability_type || '',
        liability_amount: liability.liability_amount || '',
        installments_total: liability.installments_total || '1',
        frequency: liability.frequency || 'monthly',
        due_date: liability.due_date || '',
        priority_score: liability.priority_score || '50',
        interest_rate: liability.interest_rate || '0',
        description: liability.description || ''
      });
      fetchLiabilityTypes();
    }
  }, [isOpen, liability]);

  const fetchLiabilityTypes = async () => {
    try {
      const response = await getLiabilityTypes();
      const types = response.liability_types || [];
      setAvailableLiabilityTypes(types);
      
      // Check if current liability type is in the list
      if (liability && liability.liability_type && !types.includes(liability.liability_type)) {
        setIsCustomType(true);
      }
    } catch (error) {
      console.error('Failed to fetch liability types:', error);
    }
  };

  const handleLiabilityTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomType(true);
      setFormData({...formData, liability_type: ''});
    } else {
      setIsCustomType(false);
      setFormData({...formData, liability_type: value});
    }
  };

  const getPriorityLabel = (score) => {
    if (score >= 80) return 'High Priority';
    if (score >= 50) return 'Medium Priority';
    return 'Low Priority';
  };

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const liabilityData = {
        liability_type: formData.liability_type,
        total_amount: parseFloat(formData.liability_amount),
        installments_total: parseInt(formData.installments_total),
        frequency: formData.frequency,
        due_date: formData.due_date,
        priority_score: parseInt(formData.priority_score),
        interest_rate: parseFloat(formData.interest_rate),
        description: formData.description
      };

      await onSave(liabilityData);
    } catch (error) {
      console.error('Failed to update liability:', error);
      alert('Failed to update liability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Liability</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liability Type</label>
            {isCustomType ? (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={formData.liability_type}
                  onChange={(e) => setFormData({...formData, liability_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter liability type"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomType(false)}
                  className="text-sm text-primary-blue hover:text-dark-blue"
                >
                  Choose from list instead
                </button>
              </div>
            ) : (
              <select
                required
                value={formData.liability_type}
                onChange={handleLiabilityTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select liability type</option>
                {availableLiabilityTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
                <option value="custom">Other (specify)</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.liability_amount}
              onChange={(e) => setFormData({...formData, liability_amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments</label>
              <input
                type="number"
                required
                min="1"
                value={formData.installments_total}
                onChange={(e) => setFormData({...formData, installments_total: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                required
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Score: {formData.priority_score}/100
              <span className={`ml-2 text-sm font-medium ${getPriorityColor(parseInt(formData.priority_score))}`}>
                ({getPriorityLabel(parseInt(formData.priority_score))})
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.priority_score}
              onChange={(e) => setFormData({...formData, priority_score: e.target.value})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Priority</span>
              <span>Medium Priority</span>
              <span>High Priority</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.interest_rate}
              onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              rows="3"
              placeholder="Additional notes about this liability"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Liability'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, onPay, liability }) => {
  const [formData, setFormData] = useState({
    payment_type: 'installment',
    payment_amount: '',
    payment_account: 'Cash'
  });
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAssets();
      // Reset form when modal opens
      setFormData({
        payment_type: 'installment',
        payment_amount: '',
        payment_account: 'Cash'
      });
      setError(null);
    }
  }, [isOpen]);

  const fetchAvailableAssets = async () => {
    try {
      const response = await getAssets();
      // Filter liquid assets with positive balance
      const liquidAssets = response.assets.filter(asset => 
        asset.is_liquid && asset.asset_value > 0
      );
      setAvailableAssets(liquidAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      // Fallback to cash option
      setAvailableAssets([{ asset_type: 'Cash', asset_value: 0 }]);
    }
  };

  const getPaymentAmount = () => {
    if (formData.payment_type === 'installment') {
      return Math.min(liability.installment_amount, liability.remaining_amount);
    } else if (formData.payment_type === 'full') {
      return liability.remaining_amount;
    } else if (formData.payment_type === 'partial') {
      return parseFloat(formData.payment_amount) || 0;
    }
    return 0;
  };

  const getSelectedAsset = () => {
    return availableAssets.find(asset => 
      (asset.asset_type || asset.account) === formData.payment_account
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const paymentAmount = getPaymentAmount();
      const selectedAsset = getSelectedAsset();

      // Validate payment amount
      if (paymentAmount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      if (paymentAmount > liability.remaining_amount) {
        throw new Error('Payment amount cannot exceed remaining balance');
      }

      // Check asset balance
      if (selectedAsset && paymentAmount > selectedAsset.asset_value) {
        throw new Error(`Insufficient funds in ${selectedAsset.asset_type || selectedAsset.account}. Available: $${selectedAsset.asset_value.toFixed(2)}`);
      }

      const paymentData = {
        payment_type: formData.payment_type,
        payment_account: formData.payment_account,
        ...(formData.payment_type === 'partial' && { payment_amount: paymentAmount })
      };

      await onPay(paymentData);
    } catch (error) {
      setError(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const paymentAmount = getPaymentAmount();
  const selectedAsset = getSelectedAsset();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
        
        {/* Liability Summary */}
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h4 className="font-medium text-gray-800">{liability.liability_type}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <div>Total Amount: ${liability.total_amount.toLocaleString()}</div>
            <div>Amount Paid: ${(liability.total_amount - liability.remaining_amount).toLocaleString()}</div>
            <div>Remaining Balance: ${liability.remaining_amount.toLocaleString()}</div>
            <div>Regular Installment: ${liability.installment_amount.toLocaleString()}</div>
            <div>Progress: {Math.round(((liability.total_amount - liability.remaining_amount) / liability.total_amount) * 100)}% paid</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${((liability.total_amount - liability.remaining_amount) / liability.total_amount) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="installment"
                  checked={formData.payment_type === 'installment'}
                  onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
                  className="mr-2"
                />
                <span>Regular Installment (${Math.min(liability.installment_amount, liability.remaining_amount).toLocaleString()})</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={formData.payment_type === 'full'}
                  onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
                  className="mr-2"
                />
                <span>Pay Off Completely (${liability.remaining_amount.toLocaleString()})</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="partial"
                  checked={formData.payment_type === 'partial'}
                  onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
                  className="mr-2"
                />
                <span>Custom Amount</span>
              </label>
            </div>
          </div>

          {/* Custom Amount Input */}
          {formData.payment_type === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount ($)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max={liability.remaining_amount}
                value={formData.payment_amount}
                onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Payment Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay From</label>
            <select
              required
              value={formData.payment_account}
              onChange={(e) => setFormData({...formData, payment_account: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select payment source</option>
              {availableAssets.map((asset, index) => (
                <option key={index} value={asset.asset_type || asset.account}>
                  {asset.asset_type || asset.account} (${asset.asset_value.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Summary */}
          {paymentAmount > 0 && (
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span className="font-medium">${paymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining After Payment:</span>
                  <span className="font-medium">${(liability.remaining_amount - paymentAmount).toLocaleString()}</span>
                </div>
                {selectedAsset && (
                  <div className="flex justify-between">
                    <span>New {selectedAsset.asset_type || selectedAsset.account} Balance:</span>
                    <span className="font-medium">${(selectedAsset.asset_value - paymentAmount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading || paymentAmount <= 0}
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay $${paymentAmount.toLocaleString()}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiabilityView;