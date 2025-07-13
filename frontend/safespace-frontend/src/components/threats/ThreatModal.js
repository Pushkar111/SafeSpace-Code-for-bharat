import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ShareIcon,
  LightBulbIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ThreatModal = ({ threat, isOpen, onClose, onSave, isSaved = false }) => {
  if (!threat) return null;

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: threat.title,
        text: threat.summary,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(
        `${threat.title}\n\n${threat.summary}\n\nStay safe with SafeSpace`
      );
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave?.(threat);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getThreatIcon(threat.category)}</span>
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getThreatLevelColor(
                            threat.level
                          )}`}
                        >
                          {threat.level.charAt(0).toUpperCase() + threat.level.slice(1)} Risk
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={handleSave}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isSaved ? (
                          <StarIconSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={handleShare}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShareIcon className="h-5 w-5 text-gray-400" />
                      </motion.button>
                      
                      <motion.button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mt-4">
                    {threat.title}
                  </h2>

                  <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{threat.location}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatTimeAgo(threat.timestamp)}</span>
                    </div>
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span>{threat.affectedPeople || 0} people affected</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                  {/* Threat Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Threat Details</h3>
                    <p className="text-gray-700 leading-relaxed">{threat.summary}</p>
                  </div>

                  {/* AI-Generated Safety Advice */}
                  {threat.aiAdvice && threat.aiAdvice.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                    >
                      <div className="flex items-center mb-3">
                        <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="text-lg font-semibold text-blue-900">
                          AI-Powered Safety Recommendations
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {threat.aiAdvice.map((advice, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex items-start"
                          >
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-blue-800 text-sm">{advice}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Mini Trend Chart Placeholder */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center mb-3">
                      <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">7-Day Trend</h4>
                    </div>
                    
                    <div className="h-20 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded flex items-end justify-center space-x-1 p-2">
                      {[3, 5, 4, 7, 6, 4, 2].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height * 8}px` }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="bg-primary-600 rounded-t w-4"
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Threat activity over the past week
                    </p>
                  </motion.div>

                  {/* Emergency Contacts */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="text-lg font-semibold text-red-900 mb-3">Emergency Contacts</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-red-800 font-medium">Police: 100</p>
                        <p className="text-red-800 font-medium">Fire: 101</p>
                      </div>
                      <div>
                        <p className="text-red-800 font-medium">Ambulance: 102</p>
                        <p className="text-red-800 font-medium">Disaster: 108</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Powered by SafeSpace AI</span>
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ThreatModal;
