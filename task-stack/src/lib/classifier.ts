import type { Category } from './templates';

interface ClassificationRule {
  keywords: string[];
  category: Category;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    keywords: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'book', 'reserve'],
    category: 'Research – Travel'
  },
  {
    keywords: ['buy', 'purchase', 'shop', 'order', 'compare', 'product', 'review'],
    category: 'Research – Shopping'
  },
  {
    keywords: ['read', 'learn', 'study', 'course', 'book', 'article', 'tutorial', 'watch'],
    category: 'Reading/Learning'
  },
  {
    keywords: ['code', 'develop', 'build', 'fix', 'debug', 'implement', 'deploy', 'test'],
    category: 'Technical Execution'
  },
  {
    keywords: ['admin', 'paperwork', 'form', 'application', 'submit', 'register', 'renew', 'file'],
    category: 'Admin'
  },
  {
    keywords: ['clean', 'organize', 'call', 'email', 'quick', 'simple', 'pay', 'check'],
    category: 'Quick Chores'
  }
];

export function classifyTask(title: string, userCategory?: string): Category {
  // If user explicitly set a category, use it
  if (userCategory) {
    return userCategory as Category;
  }

  const lowerTitle = title.toLowerCase();
  
  // Find the first rule that matches
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return rule.category;
    }
  }

  // Default to Generic if no rules match
  return 'Generic';
}