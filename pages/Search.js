import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, FileText, Hash } from 'lucide-react';
import PostCard from '../components/PostCard';
import CommunityCard from '../components/CommunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState({
    posts: [],
    communities: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    const type = searchParams.get('type') || 'posts';
    
    if (searchQuery) {
      setQuery(searchQuery);
      setActiveTab(type);
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [postsRes, communitiesRes, usersRes] = await Promise.all([
        api.get(`/posts?search=${encodeURIComponent(searchQuery)}&limit=20`),
        api.get(`/communities?search=${encodeURIComponent(searchQuery)}&limit=10`),
        api.get(`/users/search/users?q=${encodeURIComponent(searchQuery)}&limit=10`)
      ]);

      setResults({
        posts: postsRes.data.posts,
        communities: communitiesRes.data.communities,
        users: usersRes.data.users
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim(), type: activeTab });
    }
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, count: results.posts.length },
    { id: 'communities', label: 'Communities', icon: Hash, count: results.communities.length },
    { id: 'users', label: 'Users', icon: Users, count: results.users.length }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for posts, communities, or users..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </form>

        {/* Search Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {results.posts.length > 0 ? (
                results.posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {query ? `No posts found for "${query}"` : 'Search for posts'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.communities.length > 0 ? (
                results.communities.map(community => (
                  <CommunityCard key={community._id} community={community} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {query ? `No communities found for "${query}"` : 'Search for communities'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {results.users.length > 0 ? (
                results.users.map(user => (
                  <div
                    key={user._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.karma} karma
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/u/${user.username}`)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {query ? `No users found for "${query}"` : 'Search for users'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;