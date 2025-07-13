import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ThreatCard from './ThreatCard';
import ThreatModal from './ThreatModal';
import { getThreats, saveThreat, getSavedThreats } from '../../utils/api';
import toast from 'react-hot-toast';

const ThreatFeed = ({ selectedCity, searchFilter }) => {
  const [threats, setThreats] = useState([]);
  const [filteredThreats, setFilteredThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedThreats, setSavedThreats] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'crime', label: 'Crime', icon: '🚨' },
    { value: 'natural', label: 'Natural', icon: '🌊' },
    { value: 'traffic', label: 'Traffic', icon: '🚗' },
    { value: 'riot', label: 'Riots', icon: '👥' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'medical', label: 'Medical', icon: '🏥' },
  ];

  const riskLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'high', label: 'High Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'low', label: 'Low Risk' },
  ];

  const loadSavedThreats = useCallback(async () => {
    try {
      const saved = await getSavedThreats();
      setSavedThreats(new Set(saved.map(t => t.id)));
    } catch (error) {
      console.error('Failed to load saved threats:', error);
      // Use localStorage as fallback
      const localSaved = localStorage.getItem('savedThreats');
      if (localSaved) {
        setSavedThreats(new Set(JSON.parse(localSaved)));
      }
    }
  }, []);

  const loadThreats = useCallback(async () => {
    setIsLoading(true);
    try {
      const location = selectedCity?.city || selectedCity?.name || 'Delhi';
      const threatsData = await getThreats(location);
      setThreats(threatsData);
    } catch (error) {
      console.error('Failed to load threats:', error);
      toast.error('Failed to load threats');
      setThreats([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadSavedThreats();
    loadThreats();
  }, [loadSavedThreats, loadThreats]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...threats];

      // Filter by category
      if (filterCategory !== 'all') {
        filtered = filtered.filter(threat => threat.category === filterCategory);
      }

      // Filter by level
      if (filterLevel !== 'all') {
        filtered = filtered.filter(threat => threat.level === filterLevel);
      }

      // Filter by city
      if (selectedCity) {
        filtered = filtered.filter(threat => 
          threat.location.toLowerCase().includes(selectedCity.city?.toLowerCase() || selectedCity.name?.toLowerCase() || '')
        );
      }

      // Filter by search term
      if (searchFilter) {
        filtered = filtered.filter(threat =>
          threat.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          threat.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
          threat.location.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setFilteredThreats(filtered);
    };

    applyFilters();
  }, [threats, filterCategory, filterLevel, selectedCity, searchFilter]);

  const handleThreatClick = (threat) => {
    setSelectedThreat(threat);
    setIsModalOpen(true);
  };

  const handleSaveThreat = async (threat) => {
    try {
      if (savedThreats.has(threat.id)) {
        // Remove from saved (this would need a delete API)
        setSavedThreats(prev => {
          const newSet = new Set(prev);
          newSet.delete(threat.id);
          return newSet;
        });
        toast.success('Removed from saved threats');
        
        // Update localStorage
        const savedArray = Array.from(savedThreats);
        const index = savedArray.indexOf(threat.id);
        if (index > -1) {
          savedArray.splice(index, 1);
          localStorage.setItem('savedThreats', JSON.stringify(savedArray));
        }
      } else {
        // Add to saved
        await saveThreat(threat.id);
        setSavedThreats(prev => new Set([...prev, threat.id]));
        toast.success('Threat saved successfully');
        
        // Update localStorage
        const savedArray = Array.from(savedThreats);
        savedArray.push(threat.id);
        localStorage.setItem('savedThreats', JSON.stringify(savedArray));
      }
    } catch (error) {
      toast.error('Failed to save threat');
      console.error('Error saving threat:', error);
    }
  };

  const refreshThreats = async () => {
    await loadThreats();
    toast.success('Threats updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Threat Intelligence Feed</h2>
            <p className="text-gray-600 mt-1">
              Real-time safety alerts and AI-powered recommendations
            </p>
          </div>
          
          <motion.button
            onClick={refreshThreats}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FunnelIcon className="h-4 w-4 inline mr-1" />
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {riskLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Threat count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredThreats.length} of {threats.length} threats
          {selectedCity && ` in ${selectedCity.city || selectedCity.name}`}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && threats.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading threats...</p>
          </div>
        </div>
      )}

      {/* Threat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredThreats.map((threat, index) => (
            <ThreatCard
              key={threat.id}
              threat={threat}
              index={index}
              onClick={handleThreatClick}
              onSave={handleSaveThreat}
              isSaved={savedThreats.has(threat.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {!isLoading && filteredThreats.length === 0 && threats.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No threats found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for updates.
          </p>
        </motion.div>
      )}

      {/* No data state */}
      {!isLoading && threats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No threat data available</h3>
          <p className="text-gray-600">
            Unable to fetch threat data at the moment. Please try again later.
          </p>
        </motion.div>
      )}

      {/* Threat details modal */}
      <ThreatModal
        threat={selectedThreat}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveThreat}
        isSaved={selectedThreat ? savedThreats.has(selectedThreat.id) : false}
      />
    </div>
  );
};

export default ThreatFeed;
