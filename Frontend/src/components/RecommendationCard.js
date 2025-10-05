import React from 'react';

const RecommendationCard = ({ highPriorityLiabilities, onClick }) => {
  const getRecommendationStatus = () => {
    const count = highPriorityLiabilities.length;
    if (count === 0) return { text: 'All Caught Up!', color: 'from-green-400 to-green-500', icon: 'check' };
    if (count <= 2) return { text: 'Minor Attention', color: 'from-yellow-400 to-orange-500', icon: 'clock' };
    return { text: 'Immediate Action', color: 'from-red-400 to-red-500', icon: 'exclamation' };
  };

  const status = getRecommendationStatus();

  const getIcon = () => {
    switch (status.icon) {
      case 'check':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
      case 'clock':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'exclamation':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
    }
  };

  return (
    <div 
      className="group bg-gradient-to-br from-card-blue to-primary-blue rounded-xl p-6 cursor-pointer hover:from-primary-blue hover:to-dark-blue transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      onClick={onClick}
    >
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recommended</h3>
            <h4 className="text-sm font-medium text-blue-100">Payment Strategy</h4>
          </div>
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon()}
            </svg>
          </div>
        </div>
        
        <div className="mb-4">
          <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-3 bg-gradient-to-r ${status.color} group-hover:scale-110 transition-transform duration-300`}>
            {status.text}
          </div>
          
          <div className="text-white mb-2">
            {highPriorityLiabilities.length > 0 ? (
              <div>
                <div className="text-sm text-blue-100 mb-2">
                  {highPriorityLiabilities.length} high priority {highPriorityLiabilities.length === 1 ? 'item' : 'items'}
                </div>
                <div className="space-y-1">
                  {highPriorityLiabilities.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-xs text-blue-100 bg-white bg-opacity-10 rounded px-2 py-1">
                      {item.liability?.liability_type || 'Payment'} - Priority: {item.priority_score || 'High'}
                    </div>
                  ))}
                  {highPriorityLiabilities.length > 2 && (
                    <div className="text-xs text-blue-200">
                      +{highPriorityLiabilities.length - 2} more items
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-blue-100">
                Great job! No urgent payments pending.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-blue-100 group-hover:text-white transition-colors duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-sm font-medium">View Strategy</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;