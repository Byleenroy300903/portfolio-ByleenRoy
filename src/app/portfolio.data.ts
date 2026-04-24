export interface NavItem {
  id: string;
  label: string;
}

export interface SkillGroup {
  title: string;
  icon: string;
  skills: Array<{
    name: string;
    level: number;
  }>;
}

export interface ProjectItem {
  title: string;
  subtitle: string;
  description: string;
  impact: string;
  stack: string[];
  accent: string;
}

export interface TimelineItem {
  title: string;
  organization: string;
  period: string;
  description: string;
}

export const navItems: NavItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Wins' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'contact', label: 'Contact' }
];

export const roles = [
  'Engineer I at Expeditors International Pvt Ltd.'
];

export const metrics = [
  { value: '60%', label: 'Emergency response improvement' },
  { value: '6+', label: 'Flagship projects shipped' },
  { value: '2x', label: 'Altair hackathon winner' },
  { value: '24/7', label: 'Curiosity for high-impact systems' }
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    icon: '01',
    skills: [
      { name: 'Python', level: 94 },
      { name: 'Java', level: 84 },
      { name: 'C', level: 79 }
    ]
  },
  {
    title: 'AI & Data',
    icon: '02',
    skills: [
      { name: 'Machine Learning', level: 93 },
      { name: 'OpenCV', level: 88 },
      { name: 'Data Analytics', level: 86 }
    ]
  },
  {
    title: 'Web & Tools',
    icon: '03',
    skills: [
      { name: 'Full Stack Development', level: 90 },
      { name: 'Angular', level: 88 },
      { name: 'Spring Boot', level: 84 },
      { name: 'Testing Frameworks', level: 83 },
      { name: 'RxJS Streams', level: 86 },
      { name: 'Tailwind CSS', level: 84 },
      { name: 'React Native', level: 82 },
      { name: 'Flutter', level: 80 },
      { name: 'PowerBI', level: 78 },
      { name: 'Figma', level: 85 }
    ]
  },
  {
    title: 'Enterprise & Ledger',
    icon: '04',
    skills: [
      { name: 'Hedera Hashgraph (HCS/HTS)', level: 82 },
      { name: 'AI Verification Agents', level: 85 },
      { name: 'JWT Security', level: 88 },
      { name: 'AES-256 GCM', level: 86 },
      { name: 'Real-Time Transaction Systems', level: 90 }
    ]
  },
  {
    title: 'Cybersecurity',
    icon: '05',
    skills: [
      { name: 'Cybersecurity Practices', level: 87 },
      { name: 'Ethical Hacking', level: 81 }
    ]
  }
];

export const projects: ProjectItem[] = [
  {
    title: 'APEXPAY v2.0',
    subtitle: 'Real-Time Enterprise Payroll Engine',
    description: 'A programmable payment rail that replaces opaque legacy payroll cycles with a decentralized state machine, using AI-governed verification agents and HCS-anchored audit trails for transparent instant disbursements.',
    impact: 'Eliminated 3-5 day payroll settlement latency with immutable auditability and real-time cryptographic verification for enterprise transactions.',
    stack: ['Angular v17', 'Spring Boot 3.2', 'Hedera HCS/HTS', 'AI Oracle Agent'],
    accent: 'from-cyan'
  },
  {
    title: 'MEENAVAN',
    subtitle: 'Deep Sea Fisherman Tracker',
    description: 'A resilient marine safety platform with bi-directional alerting, offshore location visibility, and a real-time communication layer for high-risk fishing environments.',
    impact: 'Improved emergency response by 60% with continuous alert loops and faster coordination.',
    stack: ['IoT', 'Realtime Alerts', 'Safety Systems'],
    accent: 'from-violet'
  },
  {
    title: 'MediAI Chain',
    subtitle: 'Medical AI + Blockchain',
    description: 'An intelligent health records workflow that analyzes medical reports with AI and anchors critical documents to blockchain-backed secure storage.',
    impact: 'Merged automated diagnosis support with trustworthy record integrity.',
    stack: ['AI Analysis', 'Blockchain', 'Healthcare'],
    accent: 'from-blue'
  },
  {
    title: 'Motion Detection System',
    subtitle: 'Computer Vision Surveillance',
    description: 'A high-accuracy moving object detection pipeline combining frame differencing and contour detection for efficient, low-latency monitoring.',
    impact: 'Delivered reliable motion awareness with lean computational cost.',
    stack: ['OpenCV', 'Vision', 'Detection'],
    accent: 'from-cyan'
  },
  {
    title: 'Action Recognition Model',
    subtitle: 'LSTM Activity Understanding',
    description: 'A sequence-based human activity recognition model trained on UCF101 to classify complex movements from video clips with temporal context.',
    impact: 'Applied LSTM modeling to improve temporal understanding of action cues.',
    stack: ['LSTM', 'UCF101', 'Deep Learning'],
    accent: 'from-magenta'
  },
  {
    title: 'BlissBot',
    subtitle: 'Mental Health AI Companion',
    description: 'A conversational support bot designed to deliver responsive mental wellness guidance with empathetic interactions and fast access to help pathways.',
    impact: 'Reduced response time by 60% while improving support accessibility.',
    stack: ['Chatbot', 'NLP', 'Mental Health'],
    accent: 'from-indigo'
  },
  {
    title: 'Fake News Detection',
    subtitle: 'NLP Trust Scoring Engine',
    description: 'A text classification system that analyzes article content patterns and linguistic features to identify misinformation with interpretable signals.',
    impact: 'Strengthened credibility screening through NLP-based classification.',
    stack: ['NLP', 'Classification', 'Text Mining'],
    accent: 'from-purple'
  }
];

export const experienceItems: TimelineItem[] = [
  {
    title: 'Associate Developer',
    organization: 'Expeditors International Pvt Ltd',
    period: 'Current Role',
    description: 'Building and supporting enterprise-grade software workflows with a focus on reliable delivery, scalable systems, and practical product execution.'
  },
  {
    title: 'AI Intern',
    organization: 'Chennai Metro Railway Limited (CMRL)',
    period: 'Recent Experience',
    description: 'Worked on AI-oriented solutioning for real-world operational workflows and data-informed decision support.'
  },
  {
    title: 'Cybersecurity Intern',
    organization: 'Hackveda Limited',
    period: 'Industry Internship',
    description: 'Focused on cybersecurity analysis, defensive practices, and practical exposure to structured security workflows.'
  },
  {
    title: 'Cisco Cybersecurity Internship',
    organization: 'Cisco',
    period: 'Professional Training',
    description: 'Expanded knowledge in network security, threat awareness, and secure systems thinking.'
  },
  {
    title: 'Research Intern',
    organization: 'Software Engineer',
    period: 'Research Track',
    description: 'Contributed to software engineering research and experimentation around applied technical problem-solving.'
  }
];

export const achievements = [
  'Altair Data Science Hackathon Winner x2',
  'Carpe Diem 2024 - 1st Prize Mentor',
  'IROC Prelims Winner',
  'Talkathon Finalist',
  'SIH 2022 Participant',
  'SIH 2023 Participant',
  'PSG Yukta Paper Presentation'
];

export const leadershipItems = [
  'President - AICUF',
  'Rotaract Professional Service Director',
  'CSI Treasurer',
  'Placement Representative',
  'ICC World Cup 2023 Volunteer'
];

export const contactLinks = {
  email: 'byleenjanetroy.25it@licet.ac.in',
  phone: '+91 8610425814',
  github: 'https://github.com/Byleenroy300903',
  linkedin: 'https://www.linkedin.com/in/byleen-janet-roy-72b000250'
};
