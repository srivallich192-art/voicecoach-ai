/**
 * Shared constants for VoiceCoach AI
 * Used by frontend UI, validation schemas, and server-side prompts/metrics.
 */

export const INTERVIEW_TYPES = [
  { value: 'behavioral', label: 'Behavioral', description: 'Past experiences, teamwork, conflict resolution, STAR framework' },
  { value: 'technical', label: 'Technical', description: 'Role-specific domain knowledge, problem-solving, concepts' },
  { value: 'hr_situational', label: 'HR & Situational', description: 'Hypothetical workplace scenarios, work ethic, culture fit' },
  { value: 'mixed', label: 'Mixed Round', description: 'Blend of introductory, behavioral, situational, and role-specific questions' }
];

export const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student', description: 'Currently studying, seeking internships or campus drives' },
  { value: 'fresher', label: 'Fresher / Recent Graduate', description: '0 years experience, entering the workforce' },
  { value: '0_1_years', label: '0 - 1 Years', description: 'Early career / entry-level associate' },
  { value: '1_3_years', label: '1 - 3 Years', description: 'Junior professional with foundational industry exposure' }
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', description: 'Gentle pacing, foundational questions, very forgiving evaluation' },
  { value: 'standard', label: 'Standard', description: 'Realistic industry interview standard, moderate follow-ups' },
  { value: 'challenging', label: 'Challenging', description: 'Fast-paced, probing follow-ups, strict STAR evaluation' }
];

export const FEEDBACK_LANGUAGES = [
  { code: 'English', label: 'English', nativeName: 'English' },
  { code: 'Hindi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'Telugu', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'Tamil', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'Spanish', label: 'Spanish', nativeName: 'Español' },
  { code: 'French', label: 'French', nativeName: 'Français' },
  { code: 'Arabic', label: 'Arabic', nativeName: 'العربية' },
  { code: 'Portuguese', label: 'Portuguese', nativeName: 'Português' },
  { code: 'Bengali', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'Indonesian', label: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'Swahili', label: 'Swahili', nativeName: 'Kiswahili' }
];

export const ROLE_DOMAINS = [
  {
    id: 'software_it',
    name: 'Software & IT',
    roles: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Data Analyst',
      'QA Tester / Automation Engineer',
      'IT Support Specialist',
      'DevOps / Cloud Associate',
      'Mobile App Developer (iOS/Android)'
    ]
  },
  {
    id: 'business_management',
    name: 'Business & Management',
    roles: [
      'Business Analyst',
      'Project Coordinator',
      'Operations Associate',
      'Product Management Trainee',
      'Scrum Master / Agile Coordinator',
      'Management Consultant Trainee'
    ]
  },
  {
    id: 'sales_customer_service',
    name: 'Sales & Customer Service',
    roles: [
      'Sales Representative',
      'Customer Support Agent',
      'Call Center Specialist',
      'Business Development Representative (BDR)',
      'Client Success Associate',
      'Account Executive Associate'
    ]
  },
  {
    id: 'finance_accounting',
    name: 'Finance & Accounting',
    roles: [
      'Accounts Assistant',
      'Junior Auditor',
      'Financial Analyst',
      'Bookkeeper / Payroll Specialist',
      'Tax Associate',
      'Risk & Compliance Assistant'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinical',
    roles: [
      'Nursing Assistant',
      'Medical Receptionist',
      'Pharmacy Assistant',
      'Patient Care Coordinator',
      'Health Informatics Specialist',
      'Clinical Lab Assistant'
    ]
  },
  {
    id: 'education_training',
    name: 'Education & Training',
    roles: [
      'Teaching Assistant',
      'Corporate Trainer / Facilitator',
      'Academic Counselor',
      'Admin Coordinator (Academic)',
      'Instructional Design Associate',
      'Online Tutor / ESL Coach'
    ]
  },
  {
    id: 'hospitality_retail',
    name: 'Hospitality & Retail',
    roles: [
      'Front Desk Associate',
      'Retail Sales Associate',
      'Guest Services Coordinator',
      'Restaurant Supervisor / Server',
      'Event Coordinator Trainee',
      'Barista / Shift Lead'
    ]
  },
  {
    id: 'skilled_trades_logistics',
    name: 'Skilled Trades & Logistics',
    roles: [
      'Warehouse Associate',
      'Delivery & Logistics Coordinator',
      'Field Service Technician',
      'Inventory Control Clerk',
      'Fleet Dispatcher',
      'Quality Control Inspector'
    ]
  },
  {
    id: 'fresher_campus',
    name: 'Fresher / Campus Placement',
    roles: [
      'General Campus HR Round',
      'Entry-Level Engineering Trainee',
      'Campus Placement Behavioral Round',
      'Graduate Management Trainee (GMT)',
      'Group Discussion Warm-Up & Extempore'
    ]
  }
];

export const COACHING_CONFIG = {
  pace: {
    minAcceptable: 80,
    tooSlowBelow: 100,
    idealMin: 110,
    idealMax: 160,
    tooFastAbove: 175,
    maxAcceptable: 220
  },
  duration: {
    minMeaningfulSeconds: 5,
    recommendedSeconds: 60,
    maxAnswerSeconds: 120,
    hardUploadLimitSeconds: 130
  },
  followUps: {
    easy: 1,
    standard: 1,
    challenging: 2
  },
  categories: [
    { key: 'clarity', label: 'Clarity & Intelligibility', weight: 20 },
    { key: 'structure', label: 'Structure & STAR', weight: 20 },
    { key: 'relevance', label: 'Relevance to Question', weight: 20 },
    { key: 'confidence_tone', label: 'Confidence & Tone', weight: 15 },
    { key: 'pacing', label: 'Pacing & Cadence', weight: 15 },
    { key: 'vocabulary_grammar', label: 'Vocabulary & Grammar', weight: 10 }
  ],
  fillerLexicon: [
    'um',
    'uh',
    'er',
    'ah',
    'like',
    'you know',
    'basically',
    'actually',
    'literally',
    'i mean',
    'sort of',
    'kind of',
    'right',
    'so',
    'well'
  ],
  accentPolicy: 'Accent and dialect are never penalized. Evaluation strictly scores intelligibility, clarity, pacing, and grammatical coherence.'
};

