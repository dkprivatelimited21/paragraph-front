import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import toast from "react-hot-toast";

const Community = () => {
  const { communityName } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // ✅ Fetch community
  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communities/${communityName}`);
      setCommunity(response.data.community);
    } catch (error) {
      toast.error("Community not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [communityName, navigate]);

  // ✅ Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get(`/posts?community=${communityName}`);
      setPosts(response.data.posts);
    } catch (error) {
      toast.error("Failed to load posts");
    }
  }, [communityName]);

  // ✅ Join community
  const joinCommunity = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to join a community");
      navigate("/login");
      return;
    }
    try {
      setJoining(true);
      await api.post(`/communities/${communityName}/join`);
      toast.success("Joined community!");
      fetchCommunity();
    } catch (error) {
      toast.error("Failed to join community");
    } finally {
      setJoining(false);
    }
  }, [isAuthenticated, communityName, navigate, fetchCommunity]);

  // ✅ Effects
  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) return <LoadingSpinner />;

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Community header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {community.displayName || community.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{community.description}</p>
        <div className="flex items-center mt-4">
          <button
            onClick={joinCommunity}
            disabled={joining}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Community"}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No posts in this community yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Community;
