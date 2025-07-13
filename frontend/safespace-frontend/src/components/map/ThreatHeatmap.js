import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { getLocationFromIP } from '../../utils/api';

// Mock data for demonstration - replace with real API data
const mockThreatData = [
  {
    id: 1,
    city: 'Delhi',
    coordinates: [77.2090, 28.6139],
    threatLevel: 'high',
    threatCount: 15,
    recentThreats: ['Air pollution alert', 'Traffic congestion', 'Construction hazard'],
  },
  {
    id: 2,
    city: 'Mumbai',
    coordinates: [72.8777, 19.0760],
    threatLevel: 'medium',
    threatCount: 8,
    recentThreats: ['Heavy rainfall warning', 'Local flooding'],
  },
  {
    id: 3,
    city: 'Bangalore',
    coordinates: [77.5946, 12.9716],
    threatLevel: 'low',
    threatCount: 3,
    recentThreats: ['Minor road closure'],
  },
  {
    id: 4,
    city: 'Chennai',
    coordinates: [80.2707, 13.0827],
    threatLevel: 'medium',
    threatCount: 6,
    recentThreats: ['Cyclone watch', 'Power outage'],
  },
  {
    id: 5,
    city: 'Kolkata',
    coordinates: [88.3639, 22.5726],
    threatLevel: 'high',
    threatCount: 12,
    recentThreats: ['Festival crowd alert', 'Traffic diversions'],
  },
];

const ThreatHeatmap = ({ onCitySelect, selectedCity }) => {
  const [threats, setThreats] = useState(mockThreatData);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshThreatData = async () => {
    try {
      // In a real app, this would fetch from your FastAPI backend
      // const data = await getThreats();
      // setThreats(data);
      
      // For now, we'll use mock data with some randomization
      const updatedThreats = mockThreatData.map(threat => ({
        ...threat,
        threatCount: Math.max(1, threat.threatCount + Math.floor(Math.random() * 3) - 1),
      }));
      setThreats(updatedThreats);
    } catch (error) {
      console.error('Failed to refresh threat data:', error);
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Get user's location
        const location = await getLocationFromIP();
        setUserLocation(location);

        // Fetch threat data
        await refreshThreatData();
      } catch (error) {
        console.error('Failed to initialize map:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshThreatData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-500 border-red-600';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600';
      case 'low':
        return 'bg-green-500 border-green-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getThreatSize = (threatCount) => {
    if (threatCount > 10) return 'w-6 h-6';
    if (threatCount > 5) return 'w-5 h-5';
    return 'w-4 h-4';
  };

  const handleCityClick = (threat) => {
    onCitySelect?.(threat);
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading threat map...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-primary-600 mr-2" />
            India Threat Heatmap
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-gray-600">High Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-gray-600">Medium Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-gray-600">Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified map visualization */}
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        {/* India outline (simplified representation) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80 opacity-20">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <path
                d="M100 80 Q120 60 140 80 L180 100 Q200 90 220 100 L280 120 Q320 140 340 180 L360 220 Q350 260 330 280 L300 320 Q280 340 250 330 L200 320 Q150 310 120 280 L80 240 Q70 200 80 160 L100 120 Q90 100 100 80 Z"
                fill="currentColor"
                className="text-gray-300"
              />
            </svg>
          </div>
        </div>

        {/* City markers */}
        {threats.map((threat, index) => (
          <motion.div
            key={threat.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (threat.coordinates[0] - 68) * 4}%`,
              top: `${80 - (threat.coordinates[1] - 8) * 4}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCityClick(threat)}
          >
            <div className="relative">
              <div
                className={`${getThreatColor(threat.threatLevel)} ${getThreatSize(
                  threat.threatCount
                )} rounded-full border-2 shadow-lg`}
              >
                <MapPinIcon className="w-full h-full text-white p-1" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {threat.city}: {threat.threatCount} threats
              </div>
            </div>
          </motion.div>
        ))}

        {/* User location marker */}
        {userLocation && userLocation.coordinates && (
          <motion.div
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (userLocation.coordinates[0] - 68) * 4}%`,
              top: `${80 - (userLocation.coordinates[1] - 8) * 4}%`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-blue-400 rounded-full animate-ping absolute"></div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Your Location
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Map controls */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <motion.button
              onClick={refreshThreatData}
              className="text-primary-600 hover:text-primary-700 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh
            </motion.button>
          </div>
          <div className="text-xs">
            Auto-refresh: 30s
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatHeatmap;
