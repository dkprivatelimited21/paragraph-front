import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const CreatePost = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: ""
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [communityLoading, setCommunityLoading] = useState(true);

  const fetchCommunity = useCallback(async () => {
    try {
      const response = await api.get(`/communities/${communityName}`);
      setCommunity(response.data.community);

      if (!response.data.community.isMember) {
        toast.error("You must join this community to post");
        navigate(`/c/${communityName}`);
      }
    } catch (error) {
      toast.error("Community not found");
      navigate("/");
    } finally {
      setCommunityLoading(false);
    }
  }, [communityName, navigate]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await api.post("/posts", {
        title: formData.title,
        content: formData.content,
        communityId: community._id,
        tags
      });

      toast.success("Post created successfully!");
      navigate(`/post/${response.data.post._id}`);
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (communityLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create a post in c/{community.displayName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Share your thoughts with the community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="An interesting title for your post"
              maxLength="300"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.title.length}/300 characters
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content * (Markdown supported)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? "Edit" : "Preview"}</span>
              </button>
            </div>

            {showPreview ? (
              <div className="w-full min-h-[200px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {formData.content || "*Preview will appear here...*"}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="What's on your mind? You can use **markdown** formatting!"
                rows="10"
                maxLength="40000"
                required
              />
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.content.length}/40,000 characters
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="technology, discussion, help (comma-separated)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/c/${communityName}`)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !formData.title.trim() || !formData.content.trim()
              }
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? "Creating..." : "Create Post"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
