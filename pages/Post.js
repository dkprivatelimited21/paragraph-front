import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import Comment from '../components/Comment';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Post = () => {
  const { postId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [sortBy, setSortBy] = useState('top');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      fetchComments();
    }
  }, [post, sortBy]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${postId}`);
      setPost(response.data.post);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Post not found');
        navigate('/');
      } else {
        toast.error('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await api.get(`/comments/post/${postId}?sort=${sortBy}`);
      setComments(response.data.comments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      await api.post('/comments', {
        content: newComment,
        postId: post._id
      });
      
      setNewComment('');
      toast.success('Comment posted!');
      fetchComments(); // Refresh comments
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Post not found
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Post */}
      <PostCard post={post} detailed={true} />

      {/* Comment Section */}
      <div className="mt-8">
        {/* Comment Form */}
        {isAuthenticated ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add a comment
            </h3>
            <form onSubmit={handleComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows="4"
                maxLength="10000"
                required
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {newComment.length}/10,000 characters • Markdown supported
                </p>
                <button
                  type="submit"
                  disabled={isCommenting || !newComment.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isCommenting ? 'Posting...' : 'Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to join the discussion
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Log In
            </button>
          </div>
        )}

        {/* Comments Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({post.commentCount})
          </h3>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="top">Top</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Comments */}
        {commentsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onReply={fetchComments}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;