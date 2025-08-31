import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Hash,  
  Plus, 
  X, 
  AlertCircle, 
  Check,
  Palette,
  Lock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateCommunity = () => {

  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: '',
    tags: [],
    rules: [],
    bannerColor: '#3B82F6',
    isPrivate: false
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [currentRule, setCurrentRule] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);

  const categories = [
    'Technology',
    'Gaming', 
    'Science',
    'Sports',
    'Entertainment',
    'News',
    'Education',
    'Lifestyle',
    'Other'
  ];

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F59E0B'
  ];

  // Check if community name is available
  const checkNameAvailability = async (name) => {
    if (!name || name.length < 3) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      await api.get(`/communities/${name.toLowerCase()}`);
      // If we get here, the community exists
      setNameAvailable(false);
    } catch (error) {
      if (error.response?.status === 404) {
        // Community doesn't exist, name is available
        setNameAvailable(true);
      } else {
        setNameAvailable(null);
      }
    } finally {
      setCheckingName(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'name') {
      // Auto-generate display name if it hasn't been manually changed
      const sanitizedName = value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
      setFormData(prev => ({
        ...prev,
        name: sanitizedName,
        displayName: prev.displayName === prev.name ? sanitizedName : prev.displayName
      }));
      
      // Debounce name availability check
      const timeoutId = setTimeout(() => {
        checkNameAvailability(sanitizedName);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRule = () => {
    if (currentRule.title.trim() && formData.rules.length < 20) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, { ...currentRule }]
      }));
      setCurrentRule({ title: '', description: '' });
    }
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.displayName || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (nameAvailable === false) {
      toast.error('Community name is not available');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/communities', formData);
      toast.success('Community created successfully!');
      navigate(`/c/${response.data.community.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.displayName || !formData.description) {
        toast.error('Please complete the basic information first');
        return;
      }
      if (nameAvailable === false) {
        toast.error('Please choose an available community name');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create a Community
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Build a place for people with shared interests
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center mt-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`h-1 w-16 mx-2 transition-colors ${
                      step > stepNumber ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Basic Info</span>
            <span>Customization</span>
            <span>Rules & Settings</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Basic Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Let's start with the essentials for your community
                </p>
              </div>

              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Community Name * <span className="text-gray-500">(URL: /c/your-name)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Hash className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="awesome-community"
                    pattern="[a-zA-Z0-9_-]+"
                    title="Only letters, numbers, underscores, and hyphens allowed"
                    maxLength="50"
                    required
                  />
                  {checkingName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {nameAvailable === true && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                  {nameAvailable === false && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>
                <div className="mt-1 flex justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.name.length}/50 characters • Only letters, numbers, _ and -
                  </div>
                  {nameAvailable === true && (
                    <div className="text-xs text-green-600">✓ Available</div>
                  )}
                  {nameAvailable === false && (
                    <div className="text-xs text-red-600">✗ Not available</div>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Awesome Community"
                  maxLength="100"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.displayName.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Describe what your community is about..."
                  rows="4"
                  maxLength="500"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Customization */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Customize Your Community
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Make your community unique with tags and visual customization
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags <span className="text-gray-500">(Help people discover your community)</span>
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add a tag..."
                    maxLength="20"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 10}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Tag List */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-primary-500 hover:text-primary-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.tags.length}/10 tags
                </p>
              </div>

              {/* Banner Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Banner Color
                </label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bannerColor: color }))}
                      className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.bannerColor === color
                          ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.bannerColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Or choose a custom color
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div
                  className="rounded-lg p-4 text-white"
                  style={{ backgroundColor: formData.bannerColor }}
                >
                  <h3 className="text-lg font-bold">c/{formData.displayName || 'Your Community'}</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {formData.description || 'Your community description will appear here'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>1 member</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Rules & Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Rules & Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up community guidelines and privacy settings
                </p>
              </div>

              {/* Community Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Community Rules <span className="text-gray-500">(Optional)</span>
                </label>
                
                {/* Add Rule Form */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={currentRule.title}
                      onChange={(e) => setCurrentRule(prev => ({ ...prev, title: e.target.value }))}
                      className="md:col-span-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Rule title..."
                      maxLength="100"
                    />
                    <input
                      type="text"
                      value={currentRule.description}
                      onChange={(e) => setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                      className="md:col-span-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Rule description (optional)..."
                      maxLength="500"
                    />
                    <button
                      type="button"
                      onClick={addRule}
                      disabled={!currentRule.title.trim() || formData.rules.length >= 20}
                      className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>

                {/* Rules List */}
                <div className="space-y-2 mb-4">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {rule.title}
                        </h4>
                        {rule.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rule.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.rules.length}/20 rules
                </p>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Privacy Settings
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Private Community
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Only approved members can view and participate in this community
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Ready to create your community?
                    </h3>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      <p><strong>Name:</strong> c/{formData.displayName}</p>
                      <p><strong>Category:</strong> {formData.category}</p>
                      <p><strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}</p>
                      <p><strong>Rules:</strong> {formData.rules.length} rule{formData.rules.length !== 1 ? 's' : ''}</p>
                      <p><strong>Privacy:</strong> {formData.isPrivate ? 'Private' : 'Public'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || nameAvailable === false}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Community'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;