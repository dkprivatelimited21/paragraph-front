import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommunityCard = ({ community, compact = false }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/c/${community.name}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            c/{community.displayName}
          </Link>
          <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs mt-1' : 'text-sm mt-2'} line-clamp-2`}>
            {community.description}
          </p>
        </div>
        
        {!compact && (
          <div 
            className="w-16 h-16 rounded-lg flex-shrink-0 ml-4"
            style={{ backgroundColor: community.settings?.bannerColor || '#3B82F6' }}
          />
        )}
      </div>

      <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-4'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {community.memberCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {community.postCount || 0}
            </span>
          </div>
        </div>
        
        {!compact && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(community.createdAt))} ago
          </span>
        )}
      </div>

      {/* Tags */}
      {!compact && community.tags && community.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {community.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {community.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
              +{community.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityCard;