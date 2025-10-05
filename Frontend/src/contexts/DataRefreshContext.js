import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context for data refresh events
const DataRefreshContext = createContext();

// Custom hook to use the data refresh context
export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

// Provider component
export const DataRefreshProvider = ({ children }) => {
  const [refreshTriggers, setRefreshTriggers] = useState({
    dashboard: 0,
    assets: 0,
    liabilities: 0,
    recommendations: 0
  });

  // Function to trigger refresh for specific data types
  const triggerRefresh = useCallback((dataTypes) => {
    setRefreshTriggers(prev => {
      const newTriggers = { ...prev };
      
      // If dataTypes is a string, convert to array
      const types = Array.isArray(dataTypes) ? dataTypes : [dataTypes];
      
      types.forEach(type => {
        if (newTriggers.hasOwnProperty(type)) {
          newTriggers[type] = prev[type] + 1;
        }
      });
      
      return newTriggers;
    });
  }, []);

  // Function to trigger refresh for all data
  const triggerRefreshAll = useCallback(() => {
    setRefreshTriggers(prev => ({
      dashboard: prev.dashboard + 1,
      assets: prev.assets + 1,
      liabilities: prev.liabilities + 1,
      recommendations: prev.recommendations + 1
    }));
  }, []);

  // Function to get refresh trigger count for a specific data type
  const getRefreshTrigger = useCallback((dataType) => {
    return refreshTriggers[dataType] || 0;
  }, [refreshTriggers]);

  const value = {
    triggerRefresh,
    triggerRefreshAll,
    getRefreshTrigger,
    refreshTriggers
  };

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
};

// Helper function to determine which data types to refresh based on operation
export const getDataTypesToRefresh = (operation, table) => {
  const refreshMap = {
    // Asset operations
    assets: ['assets', 'dashboard'],
    // Liability operations  
    liabilities: ['liabilities', 'dashboard', 'recommendations'],
    // Payment operations
    payment: ['liabilities', 'assets', 'dashboard', 'recommendations'],
    // Income operations
    users: ['dashboard'],
    income: ['dashboard'],
    // Expense operations
    expenses: ['assets', 'dashboard'],
    // Trade operations
    trades: ['assets', 'dashboard']
  };

  return refreshMap[table] || ['dashboard'];
};