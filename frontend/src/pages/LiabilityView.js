import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiabilities, createLiability, payInstallment } from '../services/api';

const LiabilityView = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiabilities();
  }, []);

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
    } catch (err) {
      console.error('Failed to add liability:', err);
    }
  };

  const handlePayInstallment = async (liabilityId) => {
    try {
      await payInstallment(liabilityId);
      await fetchLiabilities();
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

          <LiabilityTable liabilities={liabilities} onPayInstallment={handlePayInstallment} />
        </div>

        {/* Add Liability Modal */}
        {showAddForm && (
          <AddLiabilityModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAdd={handleAddLiability}
          />
        )}
      </div>
    </div>
  );
};

const LiabilityTable = ({ liabilities, onPayInstallment }) => {
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
                      <span>{liability.installments_paid}/{liability.installments_total}</span>
                      <span>{Math.round((liability.installments_paid / liability.installments_total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-blue h-2 rounded-full" 
                        style={{ width: `${(liability.installments_paid / liability.installments_total) * 100}%` }}
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {!liability.is_completed && (
                  <button
                    onClick={() => onPayInstallment(liability.id)}
                    className="text-primary-blue hover:text-dark-blue bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded"
                  >
                    Pay Installment
                  </button>
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
    liability_amount: '',
    installments_total: '1',
    frequency: 'monthly',
    due_date: '',
    importance_score: '50',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const liabilityData = {
      liability_type: formData.liability_type,
      liability_amount: parseFloat(formData.liability_amount),
      installments_total: parseInt(formData.installments_total),
      frequency: formData.frequency,
      due_date: formData.due_date,
      importance_score: parseInt(formData.importance_score),
      description: formData.description
    };

    onAdd(liabilityData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add New Liability</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liability Type</label>
            <select
              required
              value={formData.liability_type}
              onChange={(e) => setFormData({...formData, liability_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select type</option>
              <option value="Education">Education</option>
              <option value="EMI/Loan">EMI/Loan</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Insurance">Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.liability_amount}
              onChange={(e) => setFormData({...formData, liability_amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

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
            </select>
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
              Importance Score (1-100)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.importance_score}
              onChange={(e) => setFormData({...formData, importance_score: e.target.value})}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600 mt-1">
              {formData.importance_score}/100
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              rows="2"
              placeholder="Additional notes about this liability"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200"
            >
              Add Liability
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