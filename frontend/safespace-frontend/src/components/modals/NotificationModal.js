import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import { updateNotificationSettings } from '../../utils/api';
import toast from 'react-hot-toast';

const NotificationModal = ({ isOpen, onClose, currentSettings = {} }) => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    location: true,
    emergency: true,
    digest: false,
    ...currentSettings
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateNotificationSettings(settings);
      toast.success('Notification settings updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <motion.button
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        ${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
      `}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
          transition-transform duration-200 ease-in-out
        `}
        animate={{ x: enabled ? 28 : 4 }}
      />
    </motion.button>
  );

  const settingsConfig = [
    {
      key: 'emergency',
      title: 'Emergency Alerts',
      description: 'Critical safety alerts in your area',
      icon: BellIcon,
      color: 'text-red-500',
      required: true
    },
    {
      key: 'location',
      title: 'Location-based Alerts',
      description: 'Threats near your current location',
      icon: MapPinIcon,
      color: 'text-blue-500'
    },
    {
      key: 'email',
      title: 'Email Notifications',
      description: 'Receive updates via email',
      icon: EnvelopeIcon,
      color: 'text-green-500'
    },
    {
      key: 'push',
      title: 'Push Notifications',
      description: 'Browser push notifications',
      icon: DevicePhoneMobileIcon,
      color: 'text-purple-500'
    },
    {
      key: 'sms',
      title: 'SMS Alerts',
      description: 'Text message notifications',
      icon: DevicePhoneMobileIcon,
      color: 'text-orange-500'
    },
    {
      key: 'digest',
      title: 'Daily Digest',
      description: 'Summary of daily safety updates',
      icon: ClockIcon,
      color: 'text-indigo-500'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Settings"
      size="md"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {settingsConfig.map((config) => {
            const Icon = config.icon;
            return (
              <div
                key={config.key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                      {config.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings[config.key]}
                  onChange={() => !config.required && handleToggle(config.key)}
                />
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                <CheckIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Privacy Note
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                We respect your privacy. You can change these settings anytime. 
                Emergency alerts cannot be disabled for your safety.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
