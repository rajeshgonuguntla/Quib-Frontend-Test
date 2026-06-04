export interface Course {
  id: string;
  title: string;
  videoId: string;
  duration: string;
  views: string;
}

export interface Creator {
  id: string;
  name: string;
  color: string;
  tagline: string;
  videoId: string;
  category: string;
  bio: string;
  videoCount: number;
  courses: Course[];
}

export const CREATORS: Creator[] = [
  {
    id: '1', name: '3Blue1Brown', color: '#4f8ef7', tagline: 'Visualising mathematics & AI',
    videoId: 'aircAruvnKk', category: 'AI / Machine Learning',
    bio: 'Grant Sanderson creates visual, animation-driven explanations of mathematics and machine learning. Known for making the hardest ideas in maths feel intuitive.',
    videoCount: 134,
    courses: [
      { id: 'c1', title: 'But what is a neural network?',          videoId: 'aircAruvnKk', duration: '19:13', views: '14M' },
      { id: 'c2', title: 'Gradient descent, how networks learn',   videoId: 'IHZwWFHWa-w', duration: '21:01', views: '8.2M' },
      { id: 'c3', title: "Math's Fundamental Flaw",                videoId: 'HeQX2HjkcNo', duration: '34:00', views: '18M' },
      { id: 'c4', title: 'Introduction to Linear Algebra',         videoId: 'ZK3O402wf1c', duration: '15:22', views: '6.1M' },
      { id: 'c5', title: 'But what is a Fourier series?',          videoId: 'r6sGWTCMz2k', duration: '20:57', views: '9.3M' },
      { id: 'c6', title: 'Essence of calculus',                    videoId: '9vKqVkMQHKk', duration: '17:04', views: '11M' },
    ],
  },
  {
    id: '2', name: 'freeCodeCamp', color: '#198754', tagline: 'Free full-length coding courses',
    videoId: 'rfscVS0vtbw', category: 'Programming',
    bio: 'freeCodeCamp publishes free, full-length programming courses across every major language and framework — Python, JavaScript, React, SQL, and more. All completely free.',
    videoCount: 1200,
    courses: [
      { id: 'c1', title: 'Python for Beginners – Full Course',     videoId: 'rfscVS0vtbw', duration: '4:26:52', views: '38M' },
      { id: 'c2', title: 'JavaScript Full Course',                 videoId: 'PkZNo7MFNFg', duration: '3:26:42', views: '14M' },
      { id: 'c3', title: 'React JS Full Course',                   videoId: 'LDB4uaJ87e0', duration: '1:48:30', views: '5.2M' },
      { id: 'c4', title: 'Computer Science Algorithms',            videoId: 'rL8X2mlNHPM', duration: '2:10:00', views: '3.1M' },
      { id: 'c5', title: 'SQL Tutorial – Full Database Course',    videoId: 'HXV3zeQKqGY', duration: '4:20:22', views: '12M' },
      { id: 'c6', title: 'Machine Learning with Python',           videoId: 'kCc8FmEb1nY', duration: '2:58:11', views: '4.4M' },
    ],
  },
  {
    id: '3', name: 'Kurzgesagt', color: '#f97316', tagline: 'Science explained beautifully',
    videoId: 'zQGOcOUBi6s', category: 'Biology',
    bio: 'Kurzgesagt creates beautifully animated videos on science, space, technology, biology and philosophy. Their goal: to make science accessible and inspiring for everyone.',
    videoCount: 200,
    courses: [
      { id: 'c1', title: 'The Immune System Explained',            videoId: 'zQGOcOUBi6s', duration: '8:02',  views: '22M' },
      { id: 'c2', title: 'How does your Immune System work?',      videoId: 'PSZwnBNDNf0', duration: '5:03',  views: '9.1M' },
      { id: 'c3', title: 'Overpopulation – The Human Explosion',   videoId: 'QsBT5EQt348', duration: '6:40',  views: '18M' },
      { id: 'c4', title: 'The Fermi Paradox',                      videoId: 'sNhhvQGsMEc', duration: '5:54',  views: '24M' },
      { id: 'c5', title: 'What Is Light?',                         videoId: 'IXxZRZxafEQ', duration: '5:05',  views: '14M' },
      { id: 'c6', title: 'How Evolution works',                    videoId: 'hOfRN0KihOU', duration: '12:42', views: '16M' },
    ],
  },
  {
    id: '4', name: 'Fireship', color: '#ff6b35', tagline: 'Fast-paced web & dev content',
    videoId: 'ysEN5RaKOlA', category: 'Web Development',
    bio: 'Fireship delivers high-intensity coding tutorials and quick explanations of the latest developer tools. Famous for the "100 Seconds" series and brutally honest tech takes.',
    videoCount: 580,
    courses: [
      { id: 'c1', title: '100+ Web Development Concepts',          videoId: 'ysEN5RaKOlA', duration: '11:54', views: '4.1M' },
      { id: 'c2', title: 'React in 100 Seconds',                   videoId: 'Tn6-PIqc4UM', duration: '2:07',  views: '3.8M' },
      { id: 'c3', title: 'Next.js in 100 Seconds',                 videoId: 'Sklc_fQBmcs', duration: '1:44',  views: '2.2M' },
      { id: 'c4', title: 'TypeScript in 100 Seconds',              videoId: 'zQnBQ4tB3ZA', duration: '2:44',  views: '2.6M' },
      { id: 'c5', title: 'Node.js Ultimate Beginner Guide',        videoId: 'ENrzD9HAZK4', duration: '7:37',  views: '1.5M' },
      { id: 'c6', title: 'Docker in 100 Seconds',                  videoId: 'Gjnup-PuquQ', duration: '2:10',  views: '1.9M' },
    ],
  },
  {
    id: '5', name: 'Veritasium', color: '#8b5cf6', tagline: 'Exploring the science of everything',
    videoId: 'HeQX2HjkcNo', category: 'Mathematics',
    bio: 'Derek Muller makes science videos that challenge assumptions and dig deep into how things really work. Covering physics, maths, and the philosophy of knowledge.',
    videoCount: 220,
    courses: [
      { id: 'c1', title: "Math's Fundamental Flaw",                videoId: 'HeQX2HjkcNo', duration: '34:00', views: '18M' },
      { id: 'c2', title: 'The Biggest Myth in Education',          videoId: 'eVtCO84MDj8', duration: '12:02', views: '10M' },
      { id: 'c3', title: 'How Electricity Works',                  videoId: 'oI_X2cMHNe0', duration: '21:43', views: '11M' },
      { id: 'c4', title: 'This Will Revolutionize Education',      videoId: 'GEmuEWjHr5c', duration: '7:31',  views: '7.1M' },
      { id: 'c5', title: 'The Science of Thinking',                videoId: 'UBVV8pch1dM', duration: '11:17', views: '8.4M' },
      { id: 'c6', title: 'Why Machines That Bend Are Better',      videoId: '97t7Xj_iBv0', duration: '13:31', views: '13M' },
    ],
  },
  {
    id: '6', name: 'MIT OpenCourseWare', color: '#a31f34', tagline: 'University-level open lectures',
    videoId: 'ZK3O402wf1c', category: 'Mathematics',
    bio: 'MIT OpenCourseWare publishes free lecture recordings from actual MIT courses — one of the world\'s top universities. Subjects span engineering, maths, science, and more.',
    videoCount: 2400,
    courses: [
      { id: 'c1', title: 'Linear Algebra – Lecture 1',             videoId: 'ZK3O402wf1c', duration: '39:49', views: '2.8M' },
      { id: 'c2', title: 'Introduction to Algorithms',             videoId: 'HtSuA80QTyo', duration: '50:31', views: '1.4M' },
      { id: 'c3', title: 'Calculus Revisited',                     videoId: '9vKqVkMQHKk', duration: '38:15', views: '890K' },
      { id: 'c4', title: 'Introduction to Machine Learning',       videoId: 'kCc8FmEb1nY', duration: '1:13:24', views: '670K' },
      { id: 'c5', title: 'Structure & Interpretation of Programs', videoId: 'rL8X2mlNHPM', duration: '56:00', views: '540K' },
      { id: 'c6', title: 'Physics I – Classical Mechanics',        videoId: 'wWnfJ0-xXRE', duration: '47:22', views: '1.1M' },
    ],
  },
  {
    id: '7', name: 'TED-Ed', color: '#e62b1e', tagline: 'Lessons worth sharing',
    videoId: 'PSZwnBNDNf0', category: 'Biology',
    bio: 'TED-Ed produces short, animated educational lessons on everything from science and maths to history and literature. Each video is created with expert educators.',
    videoCount: 1800,
    courses: [
      { id: 'c1', title: 'How does your immune system work?',      videoId: 'PSZwnBNDNf0', duration: '5:03',  views: '9.1M' },
      { id: 'c2', title: 'The Immune System Explained',            videoId: 'zQGOcOUBi6s', duration: '8:02',  views: '5.3M' },
      { id: 'c3', title: 'How the food you eat affects your brain',videoId: 'xyQY8a-ng6g', duration: '4:52',  views: '12M' },
      { id: 'c4', title: 'The most mysterious star in the universe', videoId: 'ldc3gerytes', duration: '5:23', views: '8.7M' },
      { id: 'c5', title: 'How do computers work?',                 videoId: 'rL8X2mlNHPM', duration: '4:42',  views: '6.2M' },
      { id: 'c6', title: 'How to understand power',               videoId: 'c_Eutci7ack', duration: '5:45',  views: '11M' },
    ],
  },
  {
    id: '8', name: 'Khan Academy', color: '#14bf96', tagline: 'Free education for everyone',
    videoId: 'rAof9Ld5sOg', category: 'Mathematics',
    bio: 'Khan Academy provides free, world-class education to anyone, anywhere. Their library covers K–12 maths, sciences, computing, history, and test prep.',
    videoCount: 8000,
    courses: [
      { id: 'c1', title: 'Introduction to Derivatives',            videoId: 'rAof9Ld5sOg', duration: '9:16',  views: '3.4M' },
      { id: 'c2', title: 'Introduction to Integrals',              videoId: 'rfscVS0vtbw', duration: '10:04', views: '2.1M' },
      { id: 'c3', title: 'Linear Algebra – Vectors',               videoId: 'ZK3O402wf1c', duration: '8:45',  views: '1.8M' },
      { id: 'c4', title: 'Introduction to Statistics',             videoId: 'HeQX2HjkcNo', duration: '11:22', views: '2.7M' },
      { id: 'c5', title: 'Algebra Basics',                         videoId: 'aircAruvnKk', duration: '7:33',  views: '4.3M' },
      { id: 'c6', title: 'Chemistry – The Atom',                   videoId: 'zQGOcOUBi6s', duration: '9:11',  views: '1.5M' },
    ],
  },
  {
    id: '9', name: 'Crash Course', color: '#2196f3', tagline: 'Fast, fun, comprehensive courses',
    videoId: 'rL8X2mlNHPM', category: 'Programming',
    bio: 'Crash Course is an educational YouTube channel that covers a wide range of topics quickly and clearly — from computer science and biology to world history and philosophy.',
    videoCount: 1600,
    courses: [
      { id: 'c1', title: 'Computer Science: Algorithms',           videoId: 'rL8X2mlNHPM', duration: '11:46', views: '5.2M' },
      { id: 'c2', title: 'Computer Science: Intro to CS',          videoId: 'tpIctyqH29Q', duration: '11:18', views: '7.8M' },
      { id: 'c3', title: 'Biology: DNA',                           videoId: 'zQGOcOUBi6s', duration: '12:09', views: '6.3M' },
      { id: 'c4', title: 'Statistics: Crash Course #1',            videoId: 'zouPoc49gdM', duration: '11:22', views: '4.1M' },
      { id: 'c5', title: 'Psychology: Crash Course #1',            videoId: 'HeQX2HjkcNo', duration: '10:42', views: '8.9M' },
      { id: 'c6', title: 'World History: Crash Course #1',         videoId: 'Yocja_N5s1I', duration: '11:10', views: '11M' },
    ],
  },
  {
    id: '10', name: 'Andrej Karpathy', color: '#7c3aed', tagline: 'Deep dives into AI & ML',
    videoId: 'kCc8FmEb1nY', category: 'AI / Machine Learning',
    bio: 'Andrej Karpathy — former Director of AI at Tesla and founding member of OpenAI — creates deep, hands-on tutorials on neural networks, language models, and deep learning.',
    videoCount: 18,
    courses: [
      { id: 'c1', title: "Let's build GPT from scratch",           videoId: 'kCc8FmEb1nY', duration: '1:56:21', views: '3.8M' },
      { id: 'c2', title: 'Neural Networks: Zero to Hero',          videoId: 'VMj-3S1tku0', duration: '2:13:00', views: '2.1M' },
      { id: 'c3', title: 'Backpropagation from scratch',           videoId: 'IHZwWFHWa-w', duration: '1:45:00', views: '1.6M' },
      { id: 'c4', title: 'Building makemore – Language Model',     videoId: 'PaCmpygFfXo', duration: '1:55:00', views: '980K' },
      { id: 'c5', title: 'Let\'s build the GPT Tokeniser',        videoId: 'zduSFxRajkE', duration: '2:13:00', views: '780K' },
      { id: 'c6', title: 'Intro to Large Language Models',         videoId: 'zjkBMFhNj_g', duration: '59:47', views: '2.4M' },
    ],
  },
  {
    id: '11', name: 'Traversy Media', color: '#0ea5e9', tagline: 'Practical web dev tutorials',
    videoId: 'LDB4uaJ87e0', category: 'Web Development',
    bio: 'Brad Traversy creates practical, project-based web development tutorials. Covering HTML, CSS, JavaScript, React, Node, Python, and all the modern frameworks.',
    videoCount: 880,
    courses: [
      { id: 'c1', title: 'React JS Crash Course 2024',             videoId: 'LDB4uaJ87e0', duration: '1:48:30', views: '1.9M' },
      { id: 'c2', title: 'JavaScript Crash Course',                videoId: 'hdI2bqOjy3c', duration: '1:40:30', views: '5.1M' },
      { id: 'c3', title: 'HTML Crash Course',                      videoId: 'UB1O30fR-EE', duration: '1:00:00', views: '7.3M' },
      { id: 'c4', title: 'CSS Crash Course',                       videoId: 'yfoY53QXEnI', duration: '1:25:00', views: '6.2M' },
      { id: 'c5', title: 'Node.js Crash Course',                   videoId: 'fBNz5xF-Kx4', duration: '1:30:00', views: '2.8M' },
      { id: 'c6', title: 'Python Crash Course',                    videoId: 'rfscVS0vtbw', duration: '1:34:00', views: '3.4M' },
    ],
  },
  {
    id: '12', name: 'Numberphile', color: '#ff9800', tagline: 'Videos about numbers & maths',
    videoId: 'd6c35ableof', category: 'Mathematics',
    bio: 'Numberphile is a channel about fascinating numbers and the mathematicians who love them. Created by Brady Haran, featuring experts from universities around the world.',
    videoCount: 470,
    courses: [
      { id: 'c1', title: 'The Riemann Hypothesis',                 videoId: 'sD0NjbwqlYw', duration: '17:03', views: '6.7M' },
      { id: 'c2', title: 'The Bridges of Königsberg',              videoId: 'W18FDEA1jRQ', duration: '9:42',  views: '4.1M' },
      { id: 'c3', title: "Gödel's Incompleteness Theorem",         videoId: 'HeQX2HjkcNo', duration: '13:52', views: '5.3M' },
      { id: 'c4', title: 'Infinity is bigger than you think',      videoId: 'elvOZm0d4H0', duration: '8:33',  views: '8.9M' },
      { id: 'c5', title: 'The Collatz Conjecture',                 videoId: '5mFpVDpKX70', duration: '8:09',  views: '11M' },
      { id: 'c6', title: "e (Euler's Number) explained",           videoId: 'AuA2EAgAegE', duration: '13:29', views: '7.2M' },
    ],
  },
];

export const POPULAR: Creator[] = [
  {
    id: 'p1', name: 'Lex Fridman', color: '#6366f1', tagline: 'Long-form AI & science interviews',
    videoId: 'aircAruvnKk', category: 'AI / Machine Learning',
    bio: 'Lex Fridman is an AI researcher at MIT who hosts long-form conversations with scientists, engineers, and thinkers at the frontier of human knowledge.',
    videoCount: 430,
    courses: [
      { id: 'c1', title: 'Deep Learning Basics',                   videoId: 'aircAruvnKk', duration: '1:30:00', views: '3.2M' },
      { id: 'c2', title: 'Introduction to Deep Learning',          videoId: 'kCc8FmEb1nY', duration: '2:00:00', views: '2.1M' },
      { id: 'c3', title: 'MIT 6.S191 – Deep Learning',             videoId: 'IHZwWFHWa-w', duration: '1:50:00', views: '1.8M' },
    ],
  },
  {
    id: 'p2', name: 'Two Minute Papers', color: '#ec4899', tagline: 'AI research explained simply',
    videoId: 'kCc8FmEb1nY', category: 'AI / Machine Learning',
    bio: 'Károly Zsolnai-Fehér breaks down the latest AI and computer graphics research papers into digestible 2-5 minute videos. Remarkable progress, made accessible.',
    videoCount: 620,
    courses: [
      { id: 'c1', title: 'What is GPT-4?',                        videoId: 'kCc8FmEb1nY', duration: '4:42',  views: '2.8M' },
      { id: 'c2', title: 'How Good is AI at Coding?',              videoId: 'aircAruvnKk', duration: '5:11',  views: '1.9M' },
      { id: 'c3', title: 'AI Learns to Walk',                      videoId: 'IHZwWFHWa-w', duration: '3:55',  views: '3.4M' },
    ],
  },
  {
    id: 'p3', name: 'Stanford Online', color: '#8c1515', tagline: 'World-class university lectures',
    videoId: 'ZK3O402wf1c', category: 'Mathematics',
    bio: 'Stanford University publishes lectures, courses, and talks from one of the world\'s leading research institutions, spanning computer science, medicine, business, and more.',
    videoCount: 1100,
    courses: [
      { id: 'c1', title: 'Machine Learning (Andrew Ng)',            videoId: 'kCc8FmEb1nY', duration: '1:10:00', views: '4.3M' },
      { id: 'c2', title: 'CS229 – Machine Learning Lecture 1',     videoId: 'aircAruvnKk', duration: '1:17:00', views: '2.1M' },
      { id: 'c3', title: 'Deep Learning for NLP',                  videoId: 'ZK3O402wf1c', duration: '1:25:00', views: '1.4M' },
    ],
  },
  {
    id: 'p4', name: 'sentdex', color: '#facc15', tagline: 'Python & machine learning tutorials',
    videoId: 'rfscVS0vtbw', category: 'Programming',
    bio: 'Harrison Kinsley creates in-depth Python tutorials focused on machine learning, data analysis, and finance. Known for long, project-based series from start to finish.',
    videoCount: 1300,
    courses: [
      { id: 'c1', title: 'Python for Finance – Tutorial',          videoId: 'rfscVS0vtbw', duration: '45:00', views: '2.1M' },
      { id: 'c2', title: 'Machine Learning with Python',           videoId: 'kCc8FmEb1nY', duration: '1:20:00', views: '1.6M' },
      { id: 'c3', title: 'Neural Networks from Scratch in Python', videoId: 'IHZwWFHWa-w', duration: '1:00:00', views: '990K' },
    ],
  },
  {
    id: 'p5', name: 'The Organic Chemistry Tutor', color: '#10b981', tagline: 'Maths, chemistry & physics',
    videoId: 'rAof9Ld5sOg', category: 'Mathematics',
    bio: 'Clear, methodical explanations of mathematics, chemistry, and physics — from basic algebra through to university-level organic chemistry and calculus.',
    videoCount: 3200,
    courses: [
      { id: 'c1', title: 'Calculus 1 – Full Course',               videoId: 'rAof9Ld5sOg', duration: '11:06:00', views: '4.8M' },
      { id: 'c2', title: 'Algebra Review',                         videoId: 'ZK3O402wf1c', duration: '2:40:00', views: '3.3M' },
      { id: 'c3', title: 'Organic Chemistry Reactions',            videoId: 'HeQX2HjkcNo', duration: '4:30:00', views: '2.1M' },
    ],
  },
  {
    id: 'p6', name: 'Computerphile', color: '#3b82f6', tagline: 'Computer science deep dives',
    videoId: 'rL8X2mlNHPM', category: 'Programming',
    bio: 'The companion channel to Numberphile, Computerphile features university computer scientists explaining fascinating topics in computation, algorithms, and security.',
    videoCount: 560,
    courses: [
      { id: 'c1', title: 'How Computer Memory Works',              videoId: 'rL8X2mlNHPM', duration: '8:14',  views: '1.9M' },
      { id: 'c2', title: 'What is Big O Notation?',                videoId: 'aircAruvnKk', duration: '11:55', views: '2.4M' },
      { id: 'c3', title: 'How TCP/IP Works',                       videoId: 'LDB4uaJ87e0', duration: '9:43',  views: '3.1M' },
    ],
  },
  {
    id: 'p7', name: 'SciShow', color: '#f97316', tagline: 'Fascinating science every week',
    videoId: 'zQGOcOUBi6s', category: 'Biology',
    bio: 'SciShow explores the unexpected, peculiar, and awe-inspiring in science — from cutting-edge research to long-standing mysteries in biology, physics, and chemistry.',
    videoCount: 1400,
    courses: [
      { id: 'c1', title: 'The Science of Sleep',                   videoId: 'zQGOcOUBi6s', duration: '9:23',  views: '6.1M' },
      { id: 'c2', title: 'How Does CRISPR Work?',                  videoId: 'PSZwnBNDNf0', duration: '7:11',  views: '8.4M' },
      { id: 'c3', title: 'Why Do We Dream?',                       videoId: 'HeQX2HjkcNo', duration: '6:55',  views: '10M' },
    ],
  },
  {
    id: 'p8', name: 'PatrickJMT', color: '#a855f7', tagline: 'Calculus & algebra made easy',
    videoId: 'rAof9Ld5sOg', category: 'Mathematics',
    bio: 'Patrick Jones makes short, focused maths tutorial videos covering calculus, algebra, and statistics — perfect for students looking for quick, clear explanations.',
    videoCount: 1100,
    courses: [
      { id: 'c1', title: 'Calculus – Limits Introduction',         videoId: 'rAof9Ld5sOg', duration: '8:21',  views: '3.3M' },
      { id: 'c2', title: 'Integration by Parts',                   videoId: 'HeQX2HjkcNo', duration: '9:14',  views: '2.7M' },
      { id: 'c3', title: 'Differential Equations Intro',           videoId: 'ZK3O402wf1c', duration: '10:04', views: '1.9M' },
    ],
  },
  {
    id: 'p9', name: 'NetworkChuck', color: '#06b6d4', tagline: 'Networking & cybersecurity fun',
    videoId: 'LDB4uaJ87e0', category: 'Web Development',
    bio: 'NetworkChuck makes networking and cybersecurity fun and accessible — covering Linux, Python, Docker, Kubernetes, ethical hacking, and cloud certifications.',
    videoCount: 420,
    courses: [
      { id: 'c1', title: 'FREE CCNA – Full Course',                videoId: 'LDB4uaJ87e0', duration: '4:44:00', views: '3.2M' },
      { id: 'c2', title: 'Python for Hackers',                     videoId: 'rfscVS0vtbw', duration: '1:22:00', views: '2.1M' },
      { id: 'c3', title: 'Docker for Beginners',                   videoId: 'rL8X2mlNHPM', duration: '1:10:00', views: '1.7M' },
    ],
  },
];

export const ALL_CREATORS = [...CREATORS, ...POPULAR];
