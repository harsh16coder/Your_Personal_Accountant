import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, getTentativeAssets, createAsset, createTentativeAsset, updateAsset, getAssetTypes } from '../services/api';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const AssetView = () => {
  const [assets, setAssets] = useState([]);
  const [tentativeAssets, setTentativeAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const navigate = useNavigate();
  const { getRefreshTrigger, triggerRefresh } = useDataRefresh();

  useEffect(() => {
    fetchAssetData();
  }, []);

  // Listen for refresh triggers
  useEffect(() => {
    const refreshTrigger = getRefreshTrigger('assets');
    if (refreshTrigger > 0 && assets.length >= 0) { // Refresh if we have initial data or empty array
      fetchAssetData();
    }
  }, [getRefreshTrigger('assets')]);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      const [assetsResponse, tentativeResponse] = await Promise.all([
        getAssets(),
        getTentativeAssets()
      ]);
      setAssets(assetsResponse.assets);
      setTentativeAssets(tentativeResponse.tentative_assets);
      setError(null);
    } catch (err) {
      setError('Failed to load asset data');
      console.error('Asset data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (assetData) => {
    try {
      if (activeTab === 'current') {
        await createAsset(assetData);
      } else {
        await createTentativeAsset(assetData);
      }
      await fetchAssetData();
      setShowAddForm(false);
      // Trigger refresh for other components
      triggerRefresh(['assets', 'dashboard']);
    } catch (err) {
      console.error('Failed to add asset:', err);
    }
  };

  const handleEditAsset = async (assetData) => {
    try {
      await updateAsset(editingAsset.id, assetData);
      await fetchAssetData();
      setShowEditForm(false);
      setEditingAsset(null);
      // Trigger refresh for other components
      triggerRefresh(['assets', 'dashboard']);
    } catch (err) {
      console.error('Failed to update asset:', err);
    }
  };

  const openEditForm = (asset) => {
    setEditingAsset(asset);
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading assets...</div>
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
            <h1 className="text-3xl font-bold text-gray-800">Asset Management</h1>
            <p className="text-gray-600">Track your current and future assets</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition-colors duration-200"
          >
            Add Asset
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'border-primary-blue text-primary-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Assets ({assets.length})
              </button>
              <button
                onClick={() => setActiveTab('future')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'future'
                    ? 'border-primary-blue text-primary-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Expected Assets ({tentativeAssets.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Asset Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {activeTab === 'current' ? (
            <CurrentAssetsTable assets={assets} onEdit={openEditForm} />
          ) : (
            <TentativeAssetsTable assets={tentativeAssets} />
          )}
        </div>

        {/* Add Asset Modal */}
        {showAddForm && (
          <AddAssetModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAdd={handleAddAsset}
            type={activeTab}
          />
        )}

        {/* Edit Asset Modal */}
        {showEditForm && editingAsset && (
          <EditAssetModal
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              setEditingAsset(null);
            }}
            onSave={handleEditAsset}
            asset={editingAsset}
          />
        )}
      </div>
    </div>
  );
};

const CurrentAssetsTable = ({ assets, onEdit }) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <p className="text-gray-500">No assets recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Received
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assets.map((asset, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {asset.asset_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${asset.asset_value.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(asset.date_received).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {asset.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(asset)}
                  className="text-primary-blue hover:text-dark-blue bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TentativeAssetsTable = ({ assets }) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <p className="text-gray-500">No expected assets recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expected Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expected Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assets.map((asset, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {asset.asset_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${asset.asset_amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(asset.expected_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {asset.description || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddAssetModal = ({ isOpen, onClose, onAdd, type }) => {
  const [formData, setFormData] = useState({
    asset_type: '',
    custom_asset_type: '',
    amount: '',
    date: '',
    description: ''
  });
  const [availableAssetTypes, setAvailableAssetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssetTypes();
      // Reset form when modal opens
      setFormData({
        asset_type: '',
        custom_asset_type: '',
        amount: '',
        date: '',
        description: ''
      });
      setShowCustomType(false);
    }
  }, [isOpen]);

  const fetchAssetTypes = async () => {
    try {
      const response = await getAssetTypes();
      setAvailableAssetTypes(response.asset_types || []);
    } catch (error) {
      console.error('Failed to fetch asset types:', error);
      // Fallback to default types
      setAvailableAssetTypes([
        "Cash",
        "Savings Account", 
        "Checking Account",
        "Investment Account",
        "Real Estate",
        "Stock Portfolio",
        "Retirement Fund",
        "Vehicle",
        "Other"
      ]);
    }
  };

  const handleAssetTypeChange = (value) => {
    setFormData({...formData, asset_type: value});
    setShowCustomType(value === 'Other' || value === 'Custom');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const finalAssetType = showCustomType && formData.custom_asset_type 
        ? formData.custom_asset_type 
        : formData.asset_type;

      const assetData = {
        asset_type: finalAssetType,
        asset_description: formData.description,
        account: finalAssetType, // Use asset type as account name for now
        is_liquid: true // Default to liquid assets
      };

      if (type === 'current') {
        assetData.asset_value = parseFloat(formData.amount);
        assetData.date_received = formData.date;
      } else {
        assetData.asset_amount = parseFloat(formData.amount);
        assetData.expected_date = formData.date;
      }

      await onAdd(assetData);
    } catch (error) {
      console.error('Failed to add asset:', error);
      alert('Failed to add asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Add {type === 'current' ? 'Current' : 'Expected'} Asset
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
            <select
              required
              value={formData.asset_type}
              onChange={(e) => handleAssetTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select asset type</option>
              {availableAssetTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
              <option value="Custom">+ Add Custom Type</option>
            </select>
          </div>

          {showCustomType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Asset Type</label>
              <input
                type="text"
                required
                value={formData.custom_asset_type}
                onChange={(e) => setFormData({...formData, custom_asset_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="Enter custom asset type"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'current' ? 'Asset Value' : 'Expected Amount'} ($)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'current' ? 'Date Received' : 'Expected Date'}
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              rows="3"
              placeholder="Describe the asset (optional)"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Asset'}
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

const EditAssetModal = ({ isOpen, onClose, onSave, asset }) => {
  const [formData, setFormData] = useState({
    asset_type: '',
    asset_value: '',
    date_received: '',
    asset_description: ''
  });
  const [availableAssetTypes, setAvailableAssetTypes] = useState([]);
  const [isCustomType, setIsCustomType] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      // Pre-populate form with asset data
      setFormData({
        asset_type: asset.asset_type || '',
        asset_value: asset.asset_value || '',
        date_received: asset.date_received || '',
        asset_description: asset.asset_description || ''
      });
      fetchAssetTypes();
    }
  }, [isOpen, asset]);

  const fetchAssetTypes = async () => {
    try {
      const response = await getAssetTypes();
      const types = response.asset_types || [];
      setAvailableAssetTypes(types);
      
      // Check if current asset type is in the list
      if (asset && asset.asset_type && !types.includes(asset.asset_type)) {
        setIsCustomType(true);
      }
    } catch (error) {
      console.error('Failed to fetch asset types:', error);
    }
  };

  const handleAssetTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomType(true);
      setFormData({...formData, asset_type: ''});
    } else {
      setIsCustomType(false);
      setFormData({...formData, asset_type: value});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assetData = {
        asset_type: formData.asset_type,
        asset_value: parseFloat(formData.asset_value),
        date_received: formData.date_received,
        asset_description: formData.asset_description
      };

      await onSave(assetData);
    } catch (error) {
      console.error('Failed to update asset:', error);
      alert('Failed to update asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Asset</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
            {isCustomType ? (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={formData.asset_type}
                  onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter asset type"
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
                value={formData.asset_type}
                onChange={handleAssetTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select asset type</option>
                {availableAssetTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="custom">Other (specify)</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Value ($)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.asset_value}
              onChange={(e) => setFormData({...formData, asset_value: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
            <input
              type="date"
              required
              value={formData.date_received}
              onChange={(e) => setFormData({...formData, date_received: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Description</label>
            <textarea
              value={formData.asset_description}
              onChange={(e) => setFormData({...formData, asset_description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              rows="3"
              placeholder="Describe your asset"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-blue text-white py-2 rounded hover:bg-dark-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Asset'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetView;