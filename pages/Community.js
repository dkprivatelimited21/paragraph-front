import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Settings, TrendingUp, Clock, MessageCircle } from 'lucide-react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Community = () => {
  const { communityName } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { joinCommunity } = useSocket();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchCommunity();
  }, [communityName]);

  useEffect(() => {
    if (community) {
      fetchPosts();
      joinCommunity(community._id);
    }
  }, [community, sortBy]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${communityName}`);
      setCommunity(response.data.community);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/404');
      } else {
        toast.error('Failed to load community');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.get(`/posts?community=${community._id}&sort=${sortBy}`);
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join communities');
      return;
    }

    setJoining(true);
    try {
      const endpoint = community.isMember ? 'leave' : 'join';
      await api.post(`/communities/${community._id}/${endpoint}`);
      
      setCommunity(prev => ({
        ...prev,
        isMember: !prev.isMember,
        memberCount: prev.isMember ? prev.memberCount - 1 : prev.memberCount + 1
      }));
      
      toast.success(community.isMember ? 'Left community' : 'Joined community!');
    } catch (error) {
      toast.error('Failed to update membership');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Community not found
        </h1>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Community Header */}
      <div 
        className="rounded-lg mb-6 text-white p-6"
        style={{ backgroundColor: community.settings.bannerColor }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">c/{community.displayName}</h1>
            <p className="text-white/90 mb-4">{community.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{community.memberCount.toLocaleString()} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{community.postCount} posts</span>
              </div>
              <span>Created {formatDistanceToNow(new Date(community.createdAt))} ago</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {isAuthenticated && (
              <>
                <button
                  onClick={handleJoinLeave}
                  disabled={joining}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    community.isMember
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {joining ? 'Loading...' : community.isMember ? 'Leave' : 'Join'}
                </button>
                
                {community.isMember && (
                  <Link
                    to={`/c/${communityName}/submit`}
                    className="inline-flex items-center px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Link>
                )}
                
                {community.isModerator && (
                  <Link
                    to={`/c/${communityName}/settings`}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>New</span>
              </button>
              
              <button
                onClick={() => setSortBy('top')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'top'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Top</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          {postsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No posts yet in this community
                  </p>
                  {community.isMember && (
                    <Link
                      to={`/c/${communityName}/submit`}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Be the first to post!
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Community Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About Community
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {community.description}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Members</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {community.memberCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Posts</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {community.postCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(community.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {community.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Community Rules */}
          {community.rules && community.rules.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Community Rules
              </h3>
              <div className="space-y-3">
                {community.rules.map((rule, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}. {rule.title}
                    </h4>
                    {rule.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {rule.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderators */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Moderators
            </h3>
            <div className="space-y-2">
              {community.moderators.map(mod => (
                <Link
                  key={mod._id}
                  to={`/u/${mod.username}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={mod.avatar}
                    alt={mod.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {mod.username}
                  </span>
                  {mod._id === community.creator && (
                    <span className="text-xs text-primary-600 bg-primary-100 dark:bg-primary-900/20 px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;