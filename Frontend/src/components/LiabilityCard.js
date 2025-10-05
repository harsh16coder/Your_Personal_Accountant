import React from 'react';

const LiabilityCard = ({ totalLiabilities, activeLiabilities, currency, onClick }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = () => {
    if (activeLiabilities === 0) return 'from-green-400 to-green-500';
    if (activeLiabilities <= 2) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getUrgencyText = () => {
    if (activeLiabilities === 0) return 'All Clear';
    if (activeLiabilities <= 2) return 'Manageable';
    return 'Needs Attention';
  };

  return (
    <div 
      className="group bg-gradient-to-br from-card-blue to-primary-blue rounded-xl p-6 cursor-pointer hover:from-primary-blue hover:to-dark-blue transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      onClick={onClick}
    >
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Liabilities</h3>
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
            {formatCurrency(totalLiabilities)}
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm text-blue-100">
              {activeLiabilities} active {activeLiabilities === 1 ? 'liability' : 'liabilities'}
            </span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getUrgencyColor()} text-white`}>
              {getUrgencyText()}
            </div>
          </div>
          <div className="h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white bg-opacity-40 rounded-full transition-all duration-1000" 
              style={{ width: `${activeLiabilities > 0 ? Math.min((activeLiabilities / 5) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-blue-100 group-hover:text-white transition-colors duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium">Manage Payments</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LiabilityCard;