// ─────────────────────────────────────────────────────────────────────────────
// COURSE QUESTION BANKS
// 6 subjects × 7 questions each
// ─────────────────────────────────────────────────────────────────────────────

export interface Question {
  question: string;
  options: string[];
  correct: number; // index into options[]
}

// ── Course 1 — Programming (FPS) ─────────────────────────────────────────────
export const PROGRAMMING_QUESTIONS: Question[] = [
  { question: 'What does HTML stand for?', options: ['Hyperlinks Text Markup', 'HyperText Markup Language', 'Home Tool Markup', 'Hyper Transfer Markup'], correct: 1 },
  { question: 'Which CSS property changes text color?', options: ['text-color', 'font-color', 'color', 'foreground'], correct: 2 },
  { question: 'What does DOM stand for?', options: ['Data Object Model', 'Document Object Model', 'Dynamic Output Module', 'Document Order Map'], correct: 1 },
  { question: 'Which tag creates a hyperlink?', options: ['<link>', '<href>', '<url>', '<a>'], correct: 3 },
  { question: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Computer Style Syntax', 'Cascading Style Sheets', 'Coded Style System'], correct: 2 },
  { question: 'Which method adds to end of an array?', options: ['pop()', 'push()', 'shift()', 'append()'], correct: 1 },
  { question: 'How do you declare a JS variable?', options: ['variable x = 5', 'v x = 5', 'x = var 5', 'let x = 5'], correct: 3 },
];

// ── Course 2 — Mathematics (FPS) ─────────────────────────────────────────────
export const MATH_QUESTIONS: Question[] = [
  { question: 'What is the value of π (pi) to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.41'], correct: 1 },
  { question: 'What is the square root of 144?', options: ['11', '14', '12', '13'], correct: 2 },
  { question: 'What is 15% of 200?', options: ['25', '35', '30', '20'], correct: 2 },
  { question: 'If x² = 81, what is x?', options: ['7', '8', '10', '9'], correct: 3 },
  { question: 'What is the sum of angles in a triangle?', options: ['90°', '360°', '180°', '270°'], correct: 2 },
  { question: 'What is the result of 2³?', options: ['6', '9', '8', '12'], correct: 2 },
  { question: 'What is the formula for the area of a circle?', options: ['2πr', 'πr²', 'πd', '2πr²'], correct: 1 },
];

// ── Course 3 — Physics (FPS) ──────────────────────────────────────────────────
export const PHYSICS_QUESTIONS: Question[] = [
  { question: 'What is the SI unit of force?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correct: 2 },
  { question: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000 km/s'], correct: 0 },
  { question: 'Which law states F = ma?', options: ["Newton's 1st Law", "Newton's 3rd Law", 'Ohm\'s Law', "Newton's 2nd Law"], correct: 3 },
  { question: 'What type of energy does a moving object have?', options: ['Potential energy', 'Thermal energy', 'Chemical energy', 'Kinetic energy'], correct: 3 },
  { question: 'What is the unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], correct: 1 },
  { question: 'What is the acceleration due to gravity on Earth?', options: ['8.9 m/s²', '10.8 m/s²', '9.8 m/s²', '11.2 m/s²'], correct: 2 },
  { question: 'What phenomenon explains why the sky is blue?', options: ['Reflection', 'Diffraction', 'Refraction', 'Rayleigh scattering'], correct: 3 },
];

// ── Course 4 — Law (Dragon Boss) ─────────────────────────────────────────────
export const LAW_QUESTIONS: Question[] = [
  { question: 'What does "habeas corpus" mean?', options: ['Right to remain silent', 'You must have the body', 'Right to an attorney', 'Trial by jury'], correct: 1 },
  { question: 'What is the presumption of innocence?', options: ['Guilty until proven innocent', 'No presumption either way', 'Innocent until proven guilty', 'Innocent if no evidence'], correct: 2 },
  { question: 'What is a "tort" in law?', options: ['A criminal offence', 'A civil wrong causing harm', 'A legal contract', 'A court order'], correct: 1 },
  { question: 'What does "pro bono" mean?', options: ['In favour of evidence', 'For the public good / free legal work', 'Against the prosecution', 'For monetary gain'], correct: 1 },
  { question: 'What is "mens rea"?', options: ['The physical act of a crime', 'The guilty mind / criminal intent', 'The evidence presented', 'The jury\'s verdict'], correct: 1 },
  { question: 'What is a subpoena?', options: ['A type of verdict', 'A court fee', 'A legal order to appear or produce evidence', 'A defence strategy'], correct: 2 },
  { question: 'What does "prima facie" mean?', options: ['Beyond reasonable doubt', 'At first appearance / on the face of it', 'Without prejudice', 'In good faith'], correct: 1 },
];

// ── Course 5 — History (Dragon Boss) ─────────────────────────────────────────
export const HISTORY_QUESTIONS: Question[] = [
  { question: 'In which year did World War II end?', options: ['1943', '1944', '1947', '1945'], correct: 3 },
  { question: 'Who was the first President of the United States?', options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], correct: 2 },
  { question: 'Which empire built the Colosseum in Rome?', options: ['Greek Empire', 'Ottoman Empire', 'Byzantine Empire', 'Roman Empire'], correct: 3 },
  { question: 'What year did South Africa hold its first democratic elections?', options: ['1990', '1996', '1992', '1994'], correct: 3 },
  { question: 'Who wrote the "I Have a Dream" speech?', options: ['Malcolm X', 'Barack Obama', 'Thurgood Marshall', 'Martin Luther King Jr.'], correct: 3 },
  { question: 'Which country was Nelson Mandela president of?', options: ['Zimbabwe', 'Nigeria', 'Kenya', 'South Africa'], correct: 3 },
  { question: 'What was the name of the first artificial satellite launched into space?', options: ['Voyager 1', 'Apollo 11', 'Sputnik 1', 'Explorer 1'], correct: 2 },
];

// ── Course 6 — English (Dragon Boss) ─────────────────────────────────────────
export const ENGLISH_QUESTIONS: Question[] = [
  { question: 'What is a synonym for "happy"?', options: ['Melancholy', 'Elated', 'Anxious', 'Weary'], correct: 1 },
  { question: 'What is the plural of "criterion"?', options: ['Criterions', 'Criterias', 'Criteria', 'Criterium'], correct: 2 },
  { question: 'Which sentence uses the correct form of "their/there/they\'re"?', options: ['"Their going to the mall"', '"There going to the mall"', '"They\'re going to the mall"', '"Theyre going to the mall"'], correct: 2 },
  { question: 'What literary device is used in "the wind whispered through the trees"?', options: ['Simile', 'Metaphor', 'Hyperbole', 'Personification'], correct: 3 },
  { question: 'What is the antonym of "benevolent"?', options: ['Generous', 'Malevolent', 'Indifferent', 'Charitable'], correct: 1 },
  { question: 'Which word is a conjunction?', options: ['Quickly', 'Beautiful', 'Although', 'Running'], correct: 2 },
  { question: 'What is the correct spelling?', options: ['Accomodation', 'Acommodation', 'Accommodation', 'Acomodation'], correct: 2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// COURSE METADATA — used on the courses browse page
// ─────────────────────────────────────────────────────────────────────────────
export const COURSES = [
  {
    id: 1,
    slug: 'programming',
    title: 'Introduction to Programming',
    description: 'HTML, CSS & JavaScript fundamentals. Learn how the web works and write your first lines of code.',
    subject: 'Programming',
    gameType: 'fps' as const,
    route: '/fps2',
    icon: '💻',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    difficulty: 'Beginner',
    lessons: 3,
    xpReward: 150,
    questions: PROGRAMMING_QUESTIONS,
  },
  {
    id: 2,
    slug: 'mathematics',
    title: 'Core Mathematics',
    description: 'Algebra, geometry and number theory. Master the building blocks of all quantitative reasoning.',
    subject: 'Mathematics',
    gameType: 'fps' as const,
    route: '/fps2',
    icon: '📐',
    color: '#0891b2',
    colorLight: '#e0f2fe',
    difficulty: 'Intermediate',
    lessons: 3,
    xpReward: 150,
    questions: MATH_QUESTIONS,
  },
  {
    id: 3,
    slug: 'physics',
    title: 'Fundamentals of Physics',
    description: 'Forces, energy, motion and electromagnetism. Understand the laws that govern the universe.',
    subject: 'Physics',
    gameType: 'fps' as const,
    route: '/fps2',
    icon: '⚛️',
    color: '#059669',
    colorLight: '#d1fae5',
    difficulty: 'Intermediate',
    lessons: 3,
    xpReward: 150,
    questions: PHYSICS_QUESTIONS,
  },
  {
    id: 4,
    slug: 'law',
    title: 'Introduction to Law',
    description: 'Latin terms, legal principles and court procedure. The foundations every citizen should know.',
    subject: 'Law',
    gameType: 'dragon' as const,
    route: '/tutorBoss/demo2',
    icon: '⚖️',
    color: '#b45309',
    colorLight: '#fef3c7',
    difficulty: 'Advanced',
    lessons: 3,
    xpReward: 200,
    questions: LAW_QUESTIONS,
  },
  {
    id: 5,
    slug: 'history',
    title: 'World History',
    description: 'Wars, revolutions, empires and the people who shaped our world. Know where we came from.',
    subject: 'History',
    gameType: 'dragon' as const,
    route: '/tutorBoss/demo2',
    icon: '🏛️',
    color: '#dc2626',
    colorLight: '#fee2e2',
    difficulty: 'Beginner',
    lessons: 3,
    xpReward: 200,
    questions: HISTORY_QUESTIONS,
  },
  {
    id: 6,
    slug: 'english',
    title: 'English Language Mastery',
    description: 'Grammar, vocabulary, literary devices and spelling. Communicate with precision and style.',
    subject: 'English',
    gameType: 'dragon' as const,
    route: '/tutorBoss/demo2',
    icon: '📖',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    difficulty: 'Beginner',
    lessons: 3,
    xpReward: 200,
    questions: ENGLISH_QUESTIONS,
  },
];

export type Course = typeof COURSES[0];