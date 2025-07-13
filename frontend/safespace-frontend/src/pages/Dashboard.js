import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThreatHeatmap from '../components/map/ThreatHeatmap';
import ThreatFeed from '../components/threats/ThreatFeed';
import CitySearchInput from '../components/map/CitySearchInput';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MapIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const stats = [
    {
      title: 'Active Threats',
      value: '23',
      change: '+3 from yesterday',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600 bg-red-100',
    },
    {
      title: 'Cities Monitored',
      value: '150+',
      change: 'Across India',
      icon: MapIcon,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Safety Score',
      value: '87%',
      change: '+2% this week',
      icon: ShieldCheckIcon,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Alerts Sent',
      value: '1.2K',
      change: 'Last 24 hours',
      icon: BellIcon,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              SafeSpace Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Real-time threat intelligence and AI-powered safety recommendations for Indian cities
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* City Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Search for City Threats
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CitySearchInput
                  onCitySelect={setSelectedCity}
                  selectedCity={selectedCity}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search threats..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <ThreatHeatmap
              onCitySelect={setSelectedCity}
              selectedCity={selectedCity}
            />
          </motion.div>

          {/* Quick Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-6"
          >
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Feed</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Analysis</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alert System</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">New high-risk alert</p>
                  <p className="text-gray-500">Delhi - Air pollution</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Traffic disruption</p>
                  <p className="text-gray-500">Mumbai - Highway blocked</p>
                  <p className="text-xs text-gray-400">15 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Safety advisory</p>
                  <p className="text-gray-500">Bangalore - Weather alert</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Threat Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <ThreatFeed
            selectedCity={selectedCity}
            searchFilter={searchFilter}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
