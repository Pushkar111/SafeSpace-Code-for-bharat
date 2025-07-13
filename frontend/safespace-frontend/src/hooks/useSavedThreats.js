import { useState, useEffect } from 'react';
import { getSavedThreats, saveThreat } from '../utils/api';
import toast from 'react-hot-toast';

export const useSavedThreats = () => {
  const [savedThreats, setSavedThreats] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedThreats();
  }, []);

  const loadSavedThreats = async () => {
    try {
      setIsLoading(true);
      const threats = await getSavedThreats();
      setSavedThreats(new Set(threats.map(t => t.id)));
    } catch (error) {
      console.error('Failed to load saved threats:', error);
      // Use localStorage as fallback
      const localSaved = localStorage.getItem('savedThreats');
      if (localSaved) {
        setSavedThreats(new Set(JSON.parse(localSaved)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveThreat = async (threatId) => {
    try {
      const wasSaved = savedThreats.has(threatId);
      
      if (wasSaved) {
        // Remove from saved
        setSavedThreats(prev => {
          const newSet = new Set(prev);
          newSet.delete(threatId);
          return newSet;
        });
        toast.success('Removed from saved threats');
      } else {
        // Add to saved
        await saveThreat(threatId);
        setSavedThreats(prev => new Set([...prev, threatId]));
        toast.success('Threat saved successfully');
      }

      // Update localStorage as backup
      const newSavedArray = Array.from(savedThreats);
      if (!wasSaved) {
        newSavedArray.push(threatId);
      } else {
        const index = newSavedArray.indexOf(threatId);
        if (index > -1) {
          newSavedArray.splice(index, 1);
        }
      }
      localStorage.setItem('savedThreats', JSON.stringify(newSavedArray));

    } catch (error) {
      toast.error('Failed to save threat');
      console.error('Error saving threat:', error);
    }
  };

  const isThreatSaved = (threatId) => {
    return savedThreats.has(threatId);
  };

  return {
    savedThreats,
    isLoading,
    toggleSaveThreat,
    isThreatSaved,
    refreshSavedThreats: loadSavedThreats,
  };
};

export default useSavedThreats;
