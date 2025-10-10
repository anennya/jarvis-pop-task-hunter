export type Category = 
  | 'Admin'
  | 'Research – Travel'
  | 'Research – Shopping'
  | 'Reading/Learning'
  | 'Technical Execution'
  | 'Quick Chores'
  | 'Generic';

export interface CategoryTemplate {
  category: Category;
  stages: string[];
  defaultEstimate: number;
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    category: 'Admin',
    stages: [
      'Setup & Access',
      'Gather Required Info',
      'Complete Core Action',
      'Review & Confirm Submission',
      'Archive Proof & Note Next'
    ],
    defaultEstimate: 60
  },
  {
    category: 'Research – Travel',
    stages: [
      'Define Trip Scope',
      'Gather Options',
      'Compare Shortlist',
      'Coordinate With Others',
      'Finalize & Book',
      'Confirm & Save Plans'
    ],
    defaultEstimate: 90
  },
  {
    category: 'Research – Shopping',
    stages: [
      'Define Need & Constraints',
      'Gather Options',
      'Compare Key Features',
      'Decide on Best Option',
      'Purchase or Save',
      'Review or Return Outcome'
    ],
    defaultEstimate: 60
  },
  {
    category: 'Reading/Learning',
    stages: [
      'Setup & Access Material',
      'Preview Structure',
      'Read/Watch (Focused)',
      'Summarize Key Insights',
      'Apply or Log Learnings'
    ],
    defaultEstimate: 45
  },
  {
    category: 'Technical Execution',
    stages: [
      'Setup & Clarify Goal',
      'Explore/Debug Context',
      'Implement Core Change',
      'Test & Verify',
      'Refactor or Polish',
      'Commit & Share Outcome'
    ],
    defaultEstimate: 60
  },
  {
    category: 'Quick Chores',
    stages: [
      'Decide What\'s Needed',
      'Take Action',
      'Confirm & Log'
    ],
    defaultEstimate: 15
  },
  {
    category: 'Generic',
    stages: [
      'Clarify What "Done" Means',
      'Take One Small Step',
      'Reflect & Plan Next'
    ],
    defaultEstimate: 30
  }
];

export function getTemplate(category: Category): CategoryTemplate {
  return CATEGORY_TEMPLATES.find(t => t.category === category) || CATEGORY_TEMPLATES[6]; // Default to Generic
}

export function materializeStage(stage: string, title: string): string {
  const stageMappings: Record<string, string> = {
    'Setup & Access': `Open resources + define 'done' for: ${title}`,
    'Gather Required Info': `Collect required docs/links for: ${title}`,
    'Complete Core Action': `Do one concrete sub-action for: ${title}`,
    'Review & Confirm Submission': `Review and submit; sanity-check`,
    'Archive Proof & Note Next': `Save confirmations + add reminder`,
    'Coordinate With Others': `Share shortlist; collect preferences`,
    'Define Trip Scope': `Define trip scope for: ${title}`,
    'Gather Options': `Research and gather options for: ${title}`,
    'Compare Shortlist': `Compare shortlist options for: ${title}`,
    'Finalize & Book': `Finalize and book for: ${title}`,
    'Confirm & Save Plans': `Confirm and save plans for: ${title}`,
    'Define Need & Constraints': `Define needs and constraints for: ${title}`,
    'Compare Key Features': `Compare key features for: ${title}`,
    'Decide on Best Option': `Decide on best option for: ${title}`,
    'Purchase or Save': `Purchase or save decision for: ${title}`,
    'Review or Return Outcome': `Review or return outcome for: ${title}`,
    'Setup & Access Material': `Setup and access material for: ${title}`,
    'Preview Structure': `Preview structure of: ${title}`,
    'Read/Watch (Focused)': `Read/watch focused session: ${title}`,
    'Summarize Key Insights': `Summarize key insights from: ${title}`,
    'Apply or Log Learnings': `Apply or log learnings from: ${title}`,
    'Setup & Clarify Goal': `Setup and clarify goal for: ${title}`,
    'Explore/Debug Context': `Explore/debug context for: ${title}`,
    'Implement Core Change': `Implement core change for: ${title}`,
    'Test & Verify': `Test and verify: ${title}`,
    'Refactor or Polish': `Refactor or polish: ${title}`,
    'Commit & Share Outcome': `Commit and share outcome for: ${title}`,
    'Decide What\'s Needed': `Decide what's needed for: ${title}`,
    'Take Action': `Take action on: ${title}`,
    'Confirm & Log': `Confirm and log completion of: ${title}`,
    'Clarify What "Done" Means': `Clarify what "done" means for: ${title}`,
    'Take One Small Step': `Take one small step on: ${title}`,
    'Reflect & Plan Next': `Reflect and plan next step for: ${title}`
  };

  return stageMappings[stage] || `${stage} for: ${title}`;
}