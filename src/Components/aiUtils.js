// AI utilities for smart todo features

// Task categories based on common productivity patterns
const TASK_CATEGORIES = {
  WORK: { name: 'Work', keywords: ['meeting', 'project', 'deadline', 'report', 'presentation', 'email', 'call', 'review', 'analysis', 'task', 'document', 'proposal', 'client'], color: '#3498db' },
  PERSONAL: { name: 'Personal', keywords: ['doctor', 'appointment', 'family', 'friend', 'birthday', 'vacation', 'hobby', 'exercise', 'workout', 'health', 'self'], color: '#2ecc71' },
  SHOPPING: { name: 'Shopping', keywords: ['buy', 'purchase', 'shop', 'store', 'grocery', 'groceries', 'market', 'order', 'amazon', 'pick up'], color: '#f39c12' },
  LEARNING: { name: 'Learning', keywords: ['study', 'learn', 'course', 'tutorial', 'read', 'book', 'research', 'practice', 'skill', 'training'], color: '#9b59b6' },
  HOME: { name: 'Home', keywords: ['clean', 'organize', 'repair', 'maintenance', 'garden', 'cooking', 'laundry', 'dishes', 'home', 'house'], color: '#e74c3c' },
  FINANCIAL: { name: 'Financial', keywords: ['pay', 'bill', 'budget', 'tax', 'bank', 'money', 'invoice', 'expense', 'save', 'invest'], color: '#1abc9c' }
};

// Priority keywords mapping
const PRIORITY_KEYWORDS = {
  HIGH: ['urgent', 'asap', 'immediately', 'critical', 'important', 'deadline', 'emergency', 'rush'],
  MEDIUM: ['soon', 'this week', 'important', 'moderate', 'normal'],
  LOW: ['later', 'someday', 'maybe', 'optional', 'when possible', 'low priority']
};

// Duration estimation based on task complexity
const DURATION_PATTERNS = {
  QUICK: { keywords: ['call', 'email', 'text', 'message', 'quick', 'brief'], estimate: '15 mins' },
  SHORT: { keywords: ['review', 'check', 'update', 'organize', 'clean'], estimate: '30 mins' },
  MEDIUM: { keywords: ['meeting', 'write', 'plan', 'research', 'study'], estimate: '1 hour' },
  LONG: { keywords: ['project', 'presentation', 'report', 'analysis', 'develop'], estimate: '2+ hours' }
};

// Smart categorization function
export const categorizeTask = (taskText) => {
  const text = taskText.toLowerCase();
  let bestMatch = { category: 'GENERAL', score: 0 };
  
  Object.entries(TASK_CATEGORIES).forEach(([key, category]) => {
    const matches = category.keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > bestMatch.score) {
      bestMatch = { category: key, score: matches };
    }
  });
  
  return bestMatch.category === 'GENERAL' ? null : {
    name: TASK_CATEGORIES[bestMatch.category].name,
    color: TASK_CATEGORIES[bestMatch.category].color
  };
};

// Priority suggestion function
export const suggestPriority = (taskText) => {
  const text = taskText.toLowerCase();
  
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return priority;
    }
  }
  
  // Default to MEDIUM if no specific indicators
  return 'MEDIUM';
};

// Duration estimation function
export const estimateTaskDuration = (taskText) => {
  const text = taskText.toLowerCase();
  
  for (const [, pattern] of Object.entries(DURATION_PATTERNS)) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return pattern.estimate;
    }
  }
  
  return '1 hour'; // Default estimate
};

// Extract due date from natural language
export const extractDueDate = (taskText) => {
  const text = taskText.toLowerCase();
  const today = new Date();
  
  // Simple patterns for due date extraction
  if (text.includes('today')) {
    return today.toLocaleDateString();
  }
  
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString();
  }
  
  if (text.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toLocaleDateString();
  }
  
  // Look for date patterns like "by friday", "on monday"
  const dayPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/;
  const dayMatch = text.match(dayPattern);
  if (dayMatch) {
    return `Next ${dayMatch[1]}`;
  }
  
  return null;
};

// Generate smart suggestions based on task content
export const generateSmartSuggestions = (taskText, existingTodos) => {
  const suggestions = [];
  const text = taskText.toLowerCase();
  
  // Suggest related tasks based on content
  if (text.includes('meeting')) {
    suggestions.push('Prepare agenda for meeting');
    suggestions.push('Send meeting notes after');
  }
  
  if (text.includes('project')) {
    suggestions.push('Break down project into smaller tasks');
    suggestions.push('Set project milestones');
  }
  
  if (text.includes('study') || text.includes('learn')) {
    suggestions.push('Create study schedule');
    suggestions.push('Find learning resources');
  }
  
  if (text.includes('buy') || text.includes('shop')) {
    suggestions.push('Make shopping list');
    suggestions.push('Compare prices online');
  }
  
  // Check for duplicate or similar tasks
  const similarTasks = existingTodos.filter(todo => {
    const similarity = calculateSimilarity(text, todo.text.toLowerCase());
    return similarity > 0.6;
  });
  
  if (similarTasks.length > 0) {
    suggestions.push(`Similar task exists: "${similarTasks[0].text}"`);
  }
  
  return suggestions;
};

// Simple similarity calculation
const calculateSimilarity = (str1, str2) => {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
};

// Analyze productivity patterns
export const analyzeProductivityPatterns = (todos) => {
  const analysis = {
    totalTasks: todos.length,
    completedTasks: todos.filter(todo => todo.display === 'line-through').length,
    pendingTasks: todos.filter(todo => todo.display === '').length,
    categories: {},
    completionRate: 0
  };
  
  // Calculate completion rate
  if (analysis.totalTasks > 0) {
    analysis.completionRate = Math.round((analysis.completedTasks / analysis.totalTasks) * 100);
  }
  
  // Analyze categories
  todos.forEach(todo => {
    const category = categorizeTask(todo.text);
    if (category) {
      if (!analysis.categories[category.name]) {
        analysis.categories[category.name] = { total: 0, completed: 0 };
      }
      analysis.categories[category.name].total++;
      if (todo.display === 'line-through') {
        analysis.categories[category.name].completed++;
      }
    }
  });
  
  return analysis;
};

// Get productivity insights
export const getProductivityInsights = (analysis) => {
  const insights = [];
  
  if (analysis.completionRate >= 80) {
    insights.push('🎉 Excellent! You\'re completing most of your tasks.');
  } else if (analysis.completionRate >= 60) {
    insights.push('👍 Good progress! Consider breaking down larger tasks.');
  } else {
    insights.push('💡 Try setting smaller, more achievable goals.');
  }
  
  if (analysis.pendingTasks > analysis.completedTasks * 2) {
    insights.push('⚠️ You have many pending tasks. Consider prioritizing.');
  }
  
  // Category-specific insights
  Object.entries(analysis.categories).forEach(([category, data]) => {
    const categoryCompletion = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    if (categoryCompletion === 100 && data.total > 1) {
      insights.push(`✅ Great job completing all ${category} tasks!`);
    }
  });
  
  return insights;
};