import React, { useState, useEffect, useCallback } from "react";

import { Link } from 'react-router-dom';
import { TrendingUp, Plus, Filter } from 'lucide-react';
import PostCard from '../components/PostCard';
import CommunityCard from '../components/CommunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [timeframe, setTimeframe] = useState('all');

  const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const [postsRes, communitiesRes] = await Promise.all([
      api.get(`/posts?sort=${sortBy}&timeframe=${timeframe}&limit=20`),
      api.get("/communities?sort=trending&limit=5")
    ]);

    setPosts(postsRes.data.posts);
    setCommunities(communitiesRes.data.communities);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
}, [sortBy, timeframe]);

useEffect(() => {
  fetchData();
}, [fetchData]);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
              Home Feed
            </h1>
            
            {isAuthenticated && (
              <Link
                to="/c/general/submit"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="top">Top</option>
                <option value="trending">Trending</option>
                <option value="commented">Most Commented</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No posts found</p>
                {isAuthenticated && (
                  <Link
                    to="/create-community"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create a Community
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Trending Communities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trending Communities
              </h2>
            </div>
            <div className="space-y-3">
              {communities.map(community => (
                <CommunityCard key={community._id} community={community} compact />
              ))}
            </div>
            <Link
              to="/search?type=communities"
              className="block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all communities →
            </Link>
          </div>

          {/* Create Community CTA */}
          {isAuthenticated && (
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Create a Community</h3>
              <p className="text-primary-100 text-sm mb-4">
                Build a place for like-minded people to connect and share ideas.
              </p>
              <Link
                to="/create-community"
                className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;