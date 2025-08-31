import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Plus, Filter } from "lucide-react";
import PostCard from "../components/PostCard";
import CommunityCard from "../components/CommunityCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [timeframe, setTimeframe] = useState("all");

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
  <div className="p-10">
    <h1 className="text-3xl font-bold text-red-600">Hello Homepage 🚀</h1>
  </div>
);
};

export default Home;
