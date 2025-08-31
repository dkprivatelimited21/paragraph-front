import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post, detailed = false }) => {
  const { isAuthenticated } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    score: post.score,
    userVote: post.userVote
  });
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await api.post(`/posts/${post._id}/vote`, { voteType });
      setVotes(prev => ({
        ...response.data,
        userVote: prev.userVote === voteType ? null : voteType
      }));
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Link
              to={`/c/${post.community.name}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              c/{post.community.displayName}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Posted by{' '}
              <Link
                to={`/u/${post.author.username}`}
                className="hover:underline"
              >
                u/{post.author.username}
              </Link>
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>
          
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <Link to={`/post/${post._id}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2">
            {post.title}
          </h2>
        </Link>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none mb-4">
          <ReactMarkdown>
            {detailed ? post.content : truncateContent(post.content)}
          </ReactMarkdown>
        </div>

        {!detailed && post.content.length > 300 && (
          <Link
            to={`/post/${post._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Read more →
          </Link>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('up')}
                disabled={isVoting}
                className={`p-1 rounded ${
                  votes.userVote === 'up'
                    ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                {votes.score}
              </span>
              <button
                onClick={() => handleVote('down')}
                disabled={isVoting}
                className={`p-1 rounded ${
                  votes.userVote === 'down'
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comments */}
            <Link
              to={`/post/${post._id}`}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.commentCount}</span>
            </Link>

            {/* Share */}
            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>

            {/* Bookmark */}
            {isAuthenticated && (
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;