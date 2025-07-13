import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ThreatCard = ({ threat, onClick, onSave, isSaved = false, index = 0 }) => {
  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatIcon = (category) => {
    switch (category) {
      case 'crime':
        return '🚨';
      case 'natural':
        return '🌊';
      case 'traffic':
        return '🚗';
      case 'riot':
        return '👥';
      case 'fire':
        return '🔥';
      case 'medical':
        return '🏥';
      default:
        return '⚠️';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const threatTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - threatTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden group"
      onClick={() => onClick?.(threat)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header with threat level indicator */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getThreatIcon(threat.category)}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getThreatLevelColor(
                threat.level
              )}`}
            >
              {threat.level.charAt(0).toUpperCase() + threat.level.slice(1)} Risk
            </span>
          </div>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(threat);
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSaved ? (
              <StarIconSolid className="h-5 w-5 text-yellow-500" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" />
            )}
          </motion.button>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {threat.title}
        </h4>

        {/* Location and time */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{threat.location}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{formatTimeAgo(threat.timestamp)}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {threat.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            <span>{threat.affectedPeople || 0} people affected</span>
          </div>
          
          <motion.div
            className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700"
            whileHover={{ x: 2 }}
          >
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            <span>View AI Advice</span>
          </motion.div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  );
};

export default ThreatCard;
