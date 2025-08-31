import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Reply, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Comment = ({ comment, depth = 0, onReply }) => {
  const { isAuthenticated, user } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    score: comment.score,
    userVote: comment.userVote
  });
  const [isVoting, setIsVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await api.post(`/comments/${comment._id}/vote`, { voteType });
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsReplying(true);
    try {
      await api.post('/comments', {
        content: replyContent,
        postId: comment.post,
        parentId: comment._id
      });
      
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Reply posted!');
      
      if (onReply) onReply();
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
              className="w-6 h-6 rounded-full"
            />
            <Link
              to={`/u/${comment.author.username}`}
              className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
            >
              {comment.author.username}
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.author.karma} karma
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Comment Content */}
        <div className="prose dark:prose-invert max-w-none text-sm mb-3">
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </div>

        {/* Comment Actions */}
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
              <ArrowUp className="w-3 h-3" />
            </button>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[1.5rem] text-center">
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
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          {/* Reply */}
          {isAuthenticated && depth < 5 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-xs"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3 space-y-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
              rows="3"
              required
            />
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={isReplying || !replyContent.trim()}
                className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReplying ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Comments */}
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-2">
          {comment.children.map(child => (
            <Comment
              key={child._id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;