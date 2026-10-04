type Topic = {
  test: RegExp;
  name: string;
  desc: string;
  start: string;
  concepts: string[];
  uses: string[];
};

const TOPICS: Topic[] = [
  {
    test: /python|pandas|numpy|django|flask|fastapi/,
    name: 'Python',
    desc: 'a versatile, beginner-friendly language used everywhere from scripts to machine learning',
    start: 'variables, data types, and basic control flow',
    concepts: ['Variables and data types', 'Control flow', 'Functions', 'Lists and dicts', 'Modules', 'Error handling'],
    uses: ['Data analysis with pandas', 'Web APIs', 'Automation scripts', 'Machine learning'],
  },
  {
    test: /javascript|typescript|\bjs\b|react|node|vue|angular/,
    name: 'JavaScript',
    desc: 'the language of the web, running in every browser and on the server with Node.js',
    start: 'how the browser runs a script, then variables and functions',
    concepts: ['let and const', 'Functions and closures', 'The DOM', 'Promises and async/await', 'Modules'],
    uses: ['Interactive interfaces', 'APIs with Node', 'React apps'],
  },
  {
    test: /machine learning|deep learning|\bml\b|\bai\b|neural|pytorch|tensorflow|llm/,
    name: 'Machine learning',
    desc: 'a branch of AI that learns patterns from data instead of following hand-written rules',
    start: 'what a model is and how training uses examples',
    concepts: ['Supervised and unsupervised learning', 'Train and test splits', 'Loss and optimization', 'Overfitting'],
    uses: ['Recommendations', 'Recognition', 'Language models'],
  },
  {
    test: /\bsql\b|database|postgres|mysql/,
    name: 'SQL',
    desc: 'the language used to ask questions of relational data',
    start: 'SELECT and how tables relate to each other',
    concepts: ['Filtering with WHERE', 'JOINs', 'GROUP BY', 'Indexes'],
    uses: ['Dashboards', 'Data pipelines', 'Reporting'],
  },
  {
    test: /git|github|version control/,
    name: 'Git',
    desc: 'the standard way to track changes in a project and work with other people',
    start: 'what a repository is and the commit, push, and pull cycle',
    concepts: ['Commits', 'Branches', 'Pull requests', 'Merge conflicts'],
    uses: ['Team collaboration', 'Project history', 'Code review'],
  },
];

function titleCase(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'This topic';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function genericTopic(query: string): Topic {
  const name = titleCase(query);
  return {
    test: /$^/,
    name,
    desc: 'a subject you can learn by pairing the core ideas with a small project',
    start: 'the core vocabulary, then one concrete example you can explain out loud',
    concepts: ['Core ideas', 'Common patterns', 'The tools people actually use', 'A first project'],
    uses: ['A practice project', 'A clearer mental model', 'A next question worth asking'],
  };
}

/** Remove **bold** markers for streaming and screen-reader text. */
export function stripAnswerMarkup(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

/** Local dashboard answer. YouTube and quiz submits never reach this. */
export function generateDashboardAnswer(query: string): string {
  const topic = TOPICS.find((item) => item.test.test(query.toLowerCase())) ?? genericTopic(query);
  const { name, desc, start, concepts, uses } = topic;
  return [
    `**${name}** — ${desc}.`,
    `A solid start is ${start}. Learn why the pieces fit, then try something small before collecting more theory.`,
    `Ideas worth knowing early: ${concepts.slice(0, 4).join(', ')}.`,
    `People use it for ${uses.slice(0, 3).map((item) => item.charAt(0).toLowerCase() + item.slice(1)).join(', ')}.`,
    `What do you want from ${name} — a project, a quick overview, or help getting unstuck? You can also paste a YouTube URL here to turn a video into a course.`,
  ].join('\n\n');
}
