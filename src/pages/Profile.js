import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Trophy, 
  MessageSquare, 
  FileText,
  Users,
  Settings,
  ExternalLink,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalUpvotes: 0,
    joinedCommunities: 0
  });

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchUserContent();
    }
  }, [profile, activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}`);
      setProfile(response.data.user);
      
      // Calculate stats
      setStats({
        totalPosts: response.data.recentPosts.length,
        totalComments: response.data.recentComments.length,
        totalUpvotes: response.data.user.karma || 0,
        joinedCommunities: response.data.user.communities?.length || 0
      });
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('User not found');
        navigate('/');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      switch (activeTab) {
        case 'posts':
          const postsRes = await api.get(`/posts?author=${profile._id}&limit=20`);
          setPosts(postsRes.data.posts);
          break;
        case 'comments':
          const commentsRes = await api.get(`/comments/user/${profile._id}?limit=20`);
          setComments(commentsRes.data.comments);
          break;
        case 'communities':
          // Communities are already in the profile data
          setCommunities(profile.communities || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const getKarmaColor = (karma) => {
    if (karma >= 10000) return 'text-purple-600';
    if (karma >= 5000) return 'text-yellow-600';
    if (karma >= 1000) return 'text-blue-600';
    if (karma >= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  const getKarmaLabel = (karma) => {
    if (karma >= 10000) return 'Legend';
    if (karma >= 5000) return 'Expert';
    if (karma >= 1000) return 'Veteran';
    if (karma >= 100) return 'Active';
    return 'Newcomer';
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, count: stats.totalPosts },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: stats.totalComments },
    { id: 'communities', label: 'Communities', icon: Users, count: stats.joinedCommunities }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          User not found
        </h1>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 sticky top-20">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-primary-100 dark:ring-primary-900"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.username}
              </h1>
              
              {/* Karma Badge */}
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getKarmaColor(profile.karma)} bg-gray-100 dark:bg-gray-700`}>
                <Trophy className="w-4 h-4" />
                <span>{profile.karma.toLocaleString()} karma</span>
              </div>
              <p className={`text-xs ${getKarmaColor(profile.karma)} mt-1`}>
                {getKarmaLabel(profile.karma)}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-3 mb-6">
              {profile.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 truncate flex items-center space-x-1"
                  >
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalPosts}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalComments}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Comments</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-primary-600">
                  {profile.karma}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Karma</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.joinedCommunities}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Communities</div>
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Send Message
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Follow
                </button>
              </div>
            )}

            {/* Achievements */}
            {profile.karma > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Achievements
                </h3>
                <div className="space-y-2">
                  {profile.karma >= 100 && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        100+ Karma
                      </span>
                    </div>
                  )}
                  {stats.totalPosts >= 10 && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        10+ Posts
                      </span>
                    </div>
                  )}
                  {stats.joinedCommunities >= 5 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        5+ Communities
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Header Mobile */}
          <div className="lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-16 h-16 rounded-full ring-4 ring-primary-100 dark:ring-primary-900"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getKarmaColor(profile.karma)} bg-gray-100 dark:bg-gray-700`}>
                  <Trophy className="w-3 h-3" />
                  <span>{profile.karma.toLocaleString()} karma</span>
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  to="/settings"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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

            {/* Tab Content */}
            <div className="p-6">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard key={post._id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? "You haven't posted anything yet" : `${profile.username} hasn't posted anything yet`}
                      </p>
                      {isOwnProfile && (
                        <Link
                          to="/"
                          className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Create Your First Post
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            to={`/post/${comment.post._id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            {comment.post.title}
                          </Link>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt))} ago
                          </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm">
                          {comment.content}
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{comment.upvotes - comment.downvotes} points</span>
                          <span>{comment.children?.length || 0} replies</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? "You haven't commented yet" : `${profile.username} hasn't commented yet`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Communities Tab */}
              {activeTab === 'communities' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.length > 0 ? (
                    communities.map(community => (
                      <div key={community._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: community.settings?.bannerColor || '#3B82F6' }}
                          />
                          <div className="flex-1">
                            <Link
                              to={`/c/${community.name}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                            >
                              c/{community.displayName}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {community.memberCount.toLocaleString()} members
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {community.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? "You haven't joined any communities yet" : `${profile.username} hasn't joined any communities yet`}
                      </p>
                      {isOwnProfile && (
                        <Link
                          to="/search?type=communities"
                          className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Explore Communities
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;