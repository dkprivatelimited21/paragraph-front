import React, { useState, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Settings } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

// ✅ Karma utilities
const getKarmaColor = (karma) => {
  if (karma >= 1000) return "text-yellow-500";
  if (karma >= 500) return "text-green-500";
  if (karma >= 100) return "text-blue-500";
  return "text-gray-500";
};

const getKarmaLabel = (karma) => {
  if (karma >= 1000) return "Legend";
  if (karma >= 500) return "Expert";
  if (karma >= 100) return "Contributor";
  return "Newbie";
};

// ✅ Tabs configuration
const tabs = [
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "communities", label: "Communities" },
];

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalUpvotes: 0,
    joinedCommunities: 0,
  });

  const isOwnProfile = currentUser && currentUser.username === username;

  // ✅ Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}`);
      setProfile(response.data.user);

      setStats({
        totalPosts: response.data.recentPosts?.length || 0,
        totalComments: response.data.recentComments?.length || 0,
        totalUpvotes: response.data.user.karma || 0,
        joinedCommunities: response.data.user.communities?.length || 0,
      });
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("User not found");
        navigate("/");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [username, navigate]);

  // ✅ Fetch user content depending on active tab
  const fetchUserContent = useCallback(async () => {
    if (!profile) return;
    try {
      switch (activeTab) {
        case "posts":
          const postsRes = await api.get(`/posts?author=${profile._id}&limit=20`);
          setPosts(postsRes.data.posts);
          break;
        case "comments":
          const commentsRes = await api.get(`/comments/user/${profile._id}?limit=20`);
          setComments(commentsRes.data.comments);
          break;
        case "communities":
          setCommunities(profile.communities || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching user content:", error);
    }
  }, [activeTab, profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchUserContent();
  }, [fetchUserContent]);

  if (loading) return <LoadingSpinner />;

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-6">
          <img
            src={profile.avatar || "/default-avatar.png"}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
              </span>
              {profile.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Karma + Stats */}
        <div className="flex flex-wrap gap-6 mt-6">
          <div>
            <p className={`text-xl font-bold ${getKarmaColor(profile.karma)}`}>
              {profile.karma}
            </p>
            <p className="text-sm text-gray-500">{getKarmaLabel(profile.karma)}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.totalPosts}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.totalComments}</p>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.joinedCommunities}</p>
            <p className="text-sm text-gray-500">Communities</p>
          </div>
        </div>

        {/* Settings if own profile */}
        {isOwnProfile && (
          <div className="mt-4">
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <p className="text-gray-900 dark:text-white">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
          )}
        </div>
      )}

      {activeTab === "communities" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.length > 0 ? (
            communities.map((community) => (
              <Link
                to={`/c/${community.name}`}
                key={community._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {community.displayName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {community.description}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No communities joined yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
