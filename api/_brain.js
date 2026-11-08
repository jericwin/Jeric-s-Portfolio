// Offline "brain" for the portfolio chatbot: used when the AI service (Vercel AI Gateway) is unavailable.
// It understands English, Filipino and Taglish, tolerates typos, recognises projects and technologies,
// and uses earlier questions for follow-ups ("anong stack nito?").
// Keep PROJECTS and TECH in sync with index.html (PROJECT_DATA) and api/_profile.js.

const EMAIL = 'punay.jeric@gmail.com';

/* ---------------------------------------------------------------- data */

const PROJECTS = [
  { name: 'LeadFlow AI', aliases: ['leadflow', 'lead flow', 'leadflow ai', 'crm'], url: 'https://leadflow-ai-bay.vercel.app/',
    desc: 'a CRM and Zapier automation platform for small sales teams. It captures website inquiries with duplicate detection, scores leads with AI against a rubric the team controls, moves them through a drag-and-drop pipeline, and hands follow-ups to Zapier — nothing is emailed until a person approves it.',
    stack: 'React, Vite, ASP.NET Core, MySQL, Zapier, Gmail, Google Sheets, Vercel' },
  { name: 'StatEase Analytics', aliases: ['statease', 'stat ease', 'statistics app'], url: 'https://statease.vercel.app/',
    desc: 'a no-code statistics web app for research papers. Upload Excel/CSV data and your study objectives, and it recommends and runs the right tests (29 procedures, from t-tests and ANOVA to regression and Cronbach\'s alpha), checks assumptions, writes APA-style interpretations, and exports Word/Excel results.',
    stack: 'React, TypeScript, Vite, Tailwind CSS, FastAPI, SQLAlchemy, PostgreSQL, DuckDB, pandas, Polars, SciPy, statsmodels, ECharts, Docker' },
  { name: 'Aether Analytics', aliases: ['aether', 'aether analytics'], url: 'https://aetheranalytics.vercel.app/',
    desc: 'a local-first business intelligence platform: import CSV, Excel, JSON or Parquet, profile data quality, query in a sandboxed SQL workbench, and build drag-and-drop dashboards — without sending data to the cloud.',
    stack: 'React, TypeScript, Vite, Tailwind CSS, FastAPI, DuckDB, Polars, PyArrow, ECharts, Monaco Editor, Docker' },
  { name: 'PoultryConnect', aliases: ['poultryconnect', 'poultry connect', 'poultry', 'egg', 'eggs', 'itlog', 'manok'], url: 'https://polutry-connect.vercel.app/',
    desc: 'an egg-ordering marketplace that connects customers directly with farm owners, with real-time messaging plus sales, production and mortality forecasting.',
    stack: 'Python, Flask, SQLAlchemy, Flask-SocketIO, MySQL, pandas, NumPy, scikit-learn, Chart.js' },
  { name: 'DigiSPES', aliases: ['digispes', 'digi spes', 'spes'], url: 'https://digispes-86ib.onrender.com/',
    desc: 'a platform for the Special Program for the Employment of Students (SPES), built with government officials in Baybay, Laguna — applications, exams, beneficiary management, OCR requirement verification, automated exam checking, and a chatbot.',
    stack: 'Python, Flask, Flask-SocketIO, MySQL, Bootstrap 5, Tesseract OCR, Chart.js' },
  { name: 'CCS Dean\'s List', aliases: ['deans list', 'dean list', 'ccs deans list', 'ccs'], url: 'https://ccs-deans-list.vercel.app/',
    desc: 'a web app for LSPU Siniloan\'s College of Computer Studies where students apply for Dean\'s List recognition, with automated requirement checking.',
    stack: 'Python, Flask, Flask-SocketIO, MySQL, Chart.js' },
  { name: 'ECCD', aliases: ['eccd', 'early childhood'], url: 'https://eccd-eight.vercel.app/',
    desc: 'an early childhood care and development platform for parents, teachers, principals and municipal/provincial admins, with child development tracking and maps.',
    stack: 'Python, Flask, MySQL, Bootstrap 5, Leaflet, Chart.js' },
  { name: 'YV2: Ollie Baldemor', aliases: ['yv2', 'ollie', 'baldemor', 'book website'], url: 'https://yv2-eight.vercel.app/',
    desc: 'the official website for Ollie Baldemor\'s book on applying software techniques to real-life situations, with AI-assisted features powered by Google Gemini. Jeric is its Full Stack Developer.',
    stack: 'Python, Flask, MySQL, JavaScript, Google Gemini API, Chart.js, Vercel' },
  { name: 'IVS Premium E-commerce', aliases: ['ivs', 'ecommerce', 'e commerce', 'online shop', 'clothing'], url: 'https://ivs-five.vercel.app/',
    desc: 'an e-commerce platform from Parañaque for premium men\'s clothing and accessories, with view tracking and forecasting.',
    stack: 'Python, Flask, SQLAlchemy, Flask-Login, OAuth, PostgreSQL, Chart.js' },
  { name: 'NAZ Coffee', aliases: ['naz', 'naz coffee', 'nazcoffee', 'coffee', 'cafe', 'coffee shop', 'kape'], url: 'https://nazcoffee.vercel.app/order',
    desc: 'an online ordering site for NAZ Coffee in Pangil, Laguna — browse the menu, customize drinks, check out for delivery, pickup or dine-in with cash or GCash, plus Naz Rewards loyalty points.',
    stack: 'HTML, CSS, JavaScript, Node.js (no dependencies), GA4, Vercel' },
  { name: 'Tailored by Kyla', aliases: ['kyla', 'tailored', 'tailored by kyla', 'gown', 'gowns', 'dress'], url: 'https://tailored-by-kyla.vercel.app/',
    desc: 'a showcase site for gowns and custom dresses from a business in Pakil, Laguna, with automatic background removal for product photos.',
    stack: 'Node.js, Express, Nunjucks, SQLite, Sharp, Vercel' },
  { name: 'Katoto Project', aliases: ['katoto'], url: 'https://katoto-project.vercel.app/',
    desc: 'a website for a nonprofit organization in Laguna, showcasing its initiatives and community activities.',
    stack: 'React, Vite, React Router, Motion, Node.js, Express, libSQL' },
  { name: 'GreenGuy', aliases: ['greenguy', 'green guy', 'video editing', 'video editor'], url: 'https://greenguy-ten.vercel.app/',
    desc: 'a video-editing portfolio showcasing cinematic projects and editing services.',
    stack: 'React, TypeScript, Vite, Three.js, GSAP, Lenis' },
  { name: 'Paete Carving Simulation', aliases: ['carving', 'paete carving', 'ukit', 'wood carving', 'carving simulation'], url: 'https://carvingsimulation.vercel.app/',
    desc: 'an interactive 3D carving simulation inspired by Paete, Laguna — the Carving Capital of the Philippines — where you carve different materials with virtual tools.',
    stack: 'JavaScript, Vite, Three.js' },
  { name: 'Café Turumba & Coffee Roasters', aliases: ['turumba', 'cafe turumba', 'coffee', 'cafe', 'coffee shop', 'kape'], url: 'https://jericwin.github.io/Coffee-Shop-Pakil/',
    desc: 'a 3D architectural visualization of a coffee shop in Pakil, Laguna.',
    stack: 'Three.js, Leaflet, Python (OBJ/DXF generation), AutoCAD' },
  { name: 'Casa Baybay Café', aliases: ['casa baybay', 'baybay cafe', 'casabaybay', 'coffee', 'cafe', 'coffee shop', 'kape'], url: 'https://casabaybay.vercel.app/',
    desc: 'a 3D architectural model of a traditional-style café in Pagsanjan, Laguna.',
    stack: 'React, Vite, Three.js, React Three Fiber, Drei' },
  { name: 'Caliraya Coffee House', aliases: ['caliraya', 'caliraya coffee', 'coffee', 'cafe', 'coffee shop', 'kape'], url: 'https://caliraya-cafe.vercel.app/',
    desc: 'a two-story 3D architectural model in Caliraya, Laguna, shown under different weather and times of day.',
    stack: 'React, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber, Zustand' },
  { name: 'Plastic Shredder & Heat Press 3D', aliases: ['shredder', 'plastic shredder', 'heat press', 'cad'], url: 'https://plastic-shredder.vercel.app/',
    desc: 'an interactive 3D CAD prototype of an industrial plastic shredder and hydraulic heat press, with part inspection, measurements, cross-sections and an exploded view.',
    stack: 'JavaScript, Three.js' },
  { name: 'Guess the Spy', aliases: ['spy', 'guess the spy'], url: 'https://jericwin.github.io/SPYGame-DescribeTheWord/',
    desc: 'a social-deduction word game where players use clues to find the hidden spy.',
    stack: 'HTML, CSS, JavaScript' },
  { name: 'Mafia Game', aliases: ['mafia'], url: 'https://jericwin.github.io/Mafia-Game/',
    desc: 'a social-deduction game where the town must find the mafia and protect civilians.',
    stack: 'HTML, CSS, JavaScript, Node.js' },
  { name: 'Nightshift: Spaceship Survival', aliases: ['nightshift', 'night shift', 'spaceship', 'roblox game'], url: 'https://www.roblox.com/games/104933788225126/Spaceship-Survival',
    desc: 'a Roblox survival game where a spaceship crew must cooperate to survive dangerous nights.',
    stack: 'Roblox Studio, Luau' },
];

// Technologies: display name, aliases (normalized), and where it fits in his skill set.
const TECH = [
  ['Python', ['python', 'py'], 'core language for backends, data and automation'],
  ['JavaScript', ['javascript', 'js'], 'frontend and Node.js development'],
  ['TypeScript', ['typescript', 'ts'], 'typed React frontends'],
  ['C#', ['csharp', 'c sharp'], 'object-oriented backends'],
  ['.NET / ASP.NET Core', ['dotnet', 'aspnet', 'asp net', 'net core', 'aspnet core'], 'backend APIs (LeadFlow AI, the government DRRMIS)'],
  ['React', ['react', 'reactjs'], 'component-based frontends'],
  ['Node.js', ['nodejs', 'node'], 'JavaScript backends'],
  ['Express', ['express', 'expressjs'], 'Node web servers'],
  ['Flask', ['flask'], 'Python web apps'],
  ['FastAPI', ['fastapi', 'fast api'], 'async Python APIs'],
  ['SQL', ['sql'], 'queries, schema design and optimization'],
  ['MySQL', ['mysql'], 'relational databases'],
  ['PostgreSQL', ['postgresql', 'postgres', 'psql'], 'production databases'],
  ['SQLite', ['sqlite'], 'embedded databases'],
  ['DuckDB', ['duckdb', 'duck db'], 'analytical SQL'],
  ['Three.js', ['threejs', 'three', 'webgl', 'react three fiber', 'r3f'], '3D scenes and architectural walkthroughs'],
  ['Tailwind CSS', ['tailwind', 'tailwindcss'], 'utility-first styling'],
  ['Bootstrap', ['bootstrap'], 'UI layouts'],
  ['HTML & CSS', ['html', 'css', 'html5', 'css3'], 'responsive interfaces'],
  ['Vite', ['vite'], 'frontend build tooling'],
  ['Kotlin', ['kotlin', 'android'], 'Android development (Android Studio)'],
  ['PHP', ['php'], 'web development'],
  ['Microsoft Excel & VBA', ['excel', 'vba', 'pivot', 'pivottable', 'pivottables', 'spreadsheet', 'xlookup'], 'advanced reporting models and dashboards (32 client companies at I-Merch Media)'],
  ['Tableau', ['tableau'], 'BI visualizations'],
  ['pandas', ['pandas'], 'data wrangling'],
  ['NumPy', ['numpy'], 'numerical computing'],
  ['Polars', ['polars'], 'fast dataframes'],
  ['scikit-learn / machine learning', ['scikit', 'sklearn', 'scikit learn', 'machine learning', 'ml', 'forecasting', 'forecast'], 'predictive models and forecasting (PoultryConnect, IVS)'],
  ['Chart.js & ECharts', ['chartjs', 'chart js', 'echarts', 'charts'], 'dashboard charts'],
  ['Leaflet', ['leaflet', 'maps', 'gis'], 'maps and GIS'],
  ['Docker', ['docker', 'container', 'containers'], 'containerized deployments'],
  ['Vercel', ['vercel'], 'cloud hosting for most of his projects'],
  ['Render', ['render'], 'API hosting'],
  ['Microsoft Azure', ['azure'], 'cloud platform (government DRRMIS)'],
  ['Git & GitHub', ['git', 'github'], 'version control'],
  ['Zapier', ['zapier'], 'no-code workflow automation (LeadFlow AI)'],
  ['n8n', ['n8n'], 'workflow automation'],
  ['Google Gemini API', ['gemini'], 'AI features (YV2 website)'],
  ['ChatGPT / OpenAI', ['chatgpt', 'openai', 'gpt'], 'AI-assisted development and LLM integration'],
  ['Claude', ['claude'], 'AI-assisted development'],
  ['GitHub Copilot', ['copilot'], 'AI pair programming'],
  ['Roblox Studio / Luau', ['roblox', 'luau', 'lua'], 'game development (Nightshift: Spaceship Survival)'],
  ['Socket.IO', ['socketio', 'socket io', 'websocket', 'websockets', 'realtime', 'real time'], 'real-time messaging'],
  ['AutoCAD', ['autocad'], '3D/architectural modeling (Café Turumba)'],
  ['Canva', ['canva'], 'graphics and UI assets'],
  ['QuickBooks', ['quickbooks'], 'financial records (I-Merch Media internship)'],
].map(([name, aliases, use]) => ({ name, aliases, use }));

/* ---------------------------------------------------------------- answers (en / tl) */

const A = {
  greet: {
    en: `Hi, I'm Jeric's assistant. Ask me anything about him — his projects, skills, experience, education, or how to work with him.`,
    tl: `Hello! Ako ang assistant ni Jeric. Magtanong ka lang tungkol sa kanya — projects, skills, experience, pag-aaral, o paano siya makontak.`,
  },
  thanks: {
    en: `You're welcome! Anything else you'd like to know about Jeric?`,
    tl: `Walang anuman! May iba ka pa bang gustong malaman tungkol kay Jeric?`,
  },
  bye: {
    en: `Thanks for visiting! If you'd like to work with Jeric, email him at **${EMAIL}**.`,
    tl: `Salamat sa pagbisita! Kung gusto mong makatrabaho si Jeric, i-email mo lang siya sa **${EMAIL}**.`,
  },
  site: {
    en: `This is **Jeric Punay's portfolio** — a software engineer and data analyst from Paete, Laguna. Here you'll find his projects, skills, work experience, certificates and client testimonials. I'm his assistant, so ask me anything about him!`,
    tl: `Ito ang **portfolio ni Jeric Punay** — isang software engineer at data analyst mula Paete, Laguna. Makikita mo rito ang kanyang projects, skills, work experience, certificates at testimonials ng clients. Ako ang assistant niya, kaya magtanong ka lang tungkol sa kanya!`,
  },
  bot: {
    en: `I'm Jeric's portfolio assistant. I can tell you about his projects, skills, experience, education, certificates, and how to contact him.`,
    tl: `Ako ang assistant sa portfolio ni Jeric. Pwede mo akong tanungin tungkol sa projects, skills, experience, pag-aaral, certificates niya, at kung paano siya makontak.`,
  },
  who: {
    en: `**Jeric Punay** is a software engineer and data analyst from Paete, Laguna, Philippines. He builds full-stack web apps with Python, React, C# and SQL, turns data into clear business insights, and graduated **Magna Cum Laude** in BS Information Technology at LSPU. He's currently a Full Stack Developer for YV2: Ollie Baldemor.`,
    tl: `Si **Jeric Punay** ay isang software engineer at data analyst mula Paete, Laguna. Gumagawa siya ng full-stack web apps gamit ang Python, React, C# at SQL, at ginagawang malinaw na insights ang data. Nagtapos siya ng BS Information Technology sa LSPU bilang **Magna Cum Laude**. Sa ngayon, Full Stack Developer siya ng YV2: Ollie Baldemor.`,
  },
  projects: {
    en: `Jeric has built 20+ projects. Highlights:\n- **LeadFlow AI** — CRM with AI lead scoring and Zapier automation\n- **StatEase Analytics** — no-code statistics for research papers\n- **Aether Analytics** — local-first BI dashboards\n- **PoultryConnect** — egg marketplace with forecasting\n- **DigiSPES** — government student-employment platform\n- 3D work like **Caliraya Coffee House** and the **Paete Carving Simulation**\nAsk me about any of them, or explore the Projects section.`,
    tl: `Mahigit 20 projects na ang nagawa ni Jeric. Ilan sa mga ito:\n- **LeadFlow AI** — CRM na may AI lead scoring at Zapier automation\n- **StatEase Analytics** — no-code statistics para sa research papers\n- **Aether Analytics** — local-first BI dashboards\n- **PoultryConnect** — egg marketplace na may forecasting\n- **DigiSPES** — platform para sa SPES ng gobyerno\n- 3D projects gaya ng **Caliraya Coffee House** at **Paete Carving Simulation**\nTanungin mo ako tungkol sa kahit alin, o tingnan ang Projects section.`,
  },
  skills: {
    en: `Jeric's core stack is **Python, C#/.NET, JavaScript/TypeScript, React and SQL**.\n- Backend: Flask, FastAPI, ASP.NET Core, Node.js/Express\n- Data: MySQL, PostgreSQL, DuckDB, pandas, Polars, scikit-learn, Tableau, advanced Excel/VBA\n- 3D: Three.js, React Three Fiber\n- Cloud: Vercel, Render, Azure, Docker\n- AI & automation: Gemini/OpenAI APIs, Zapier, n8n`,
    tl: `Ang core stack ni Jeric ay **Python, C#/.NET, JavaScript/TypeScript, React at SQL**.\n- Backend: Flask, FastAPI, ASP.NET Core, Node.js/Express\n- Data: MySQL, PostgreSQL, DuckDB, pandas, Polars, scikit-learn, Tableau, advanced Excel/VBA\n- 3D: Three.js, React Three Fiber\n- Cloud: Vercel, Render, Azure, Docker\n- AI at automation: Gemini/OpenAI APIs, Zapier, n8n`,
  },
  experience: {
    en: `Jeric's work experience:\n- **Full Stack Developer** — YV2: Ollie Baldemor (June 2026 – present)\n- **Software Engineer – Full Stack & AI** — Government Agency, built a Disaster Risk Management Information System (May – Aug 2026)\n- **Finance & Data Analytics Intern** — I-Merch Media Inc., dashboards and reports for 32 client companies (Mar – May 2026)`,
    tl: `Ito ang work experience ni Jeric:\n- **Full Stack Developer** — YV2: Ollie Baldemor (June 2026 – kasalukuyan)\n- **Software Engineer – Full Stack & AI** — Government Agency, gumawa ng Disaster Risk Management Information System (May – Aug 2026)\n- **Finance & Data Analytics Intern** — I-Merch Media Inc., dashboards at reports para sa 32 client companies (Mar – May 2026)`,
  },
  current: {
    en: `Jeric is currently the **Full Stack Developer** for YV2: Ollie Baldemor, building the book's website and web platform with Python Flask, MySQL and the Google Gemini API. He's also open to new technical roles.`,
    tl: `Sa ngayon, si Jeric ang **Full Stack Developer** ng YV2: Ollie Baldemor — siya ang gumagawa ng website at web platform ng libro gamit ang Python Flask, MySQL at Google Gemini API. Bukas din siya sa mga bagong technical roles.`,
  },
  education: {
    en: `Jeric earned a **BS in Information Technology** from Laguna State Polytechnic University (2022–2026), graduating **Magna Cum Laude**. He's a DOST-SEI scholar and received Best in Capstone, Academic Proficiency, and an SSC Leadership Award.`,
    tl: `Nagtapos si Jeric ng **BS Information Technology** sa Laguna State Polytechnic University (2022–2026) bilang **Magna Cum Laude**. DOST-SEI scholar siya at nakatanggap ng Best in Capstone, Academic Proficiency, at SSC Leadership Award.`,
  },
  awards: {
    en: `Jeric's honors: **Magna Cum Laude**, **DOST-SEI scholar**, Best in Capstone, Academic Proficiency, and SSC Leadership Awardee — 8 honors & awards in total, plus 12 leadership roles (e.g. Treasurer of the LSPU Student Supreme Council).`,
    tl: `Mga parangal ni Jeric: **Magna Cum Laude**, **DOST-SEI scholar**, Best in Capstone, Academic Proficiency, at SSC Leadership Awardee — 8 honors & awards lahat, at 12 leadership roles (hal. Treasurer ng LSPU Student Supreme Council).`,
  },
  leadership: {
    en: `Jeric's leadership roles include **Treasurer of the LSPU Student Supreme Council** (2023–2025), Head of Freedom of Information at KATOTO (2024), and President of PGCA Inc. – Laguna Chapter and of the PEMQMNHS Peer Educators Group (2019–2020).`,
    tl: `Kabilang sa leadership roles ni Jeric ang pagiging **Treasurer ng LSPU Student Supreme Council** (2023–2025), Head of Freedom of Information sa KATOTO (2024), at President ng PGCA Inc. – Laguna Chapter at ng PEMQMNHS Peer Educators Group (2019–2020).`,
  },
  certs: {
    en: `Jeric has **47 certificates**, including IT Specialist – Data Analytics (Certiport), Advanced Software Engineering and Advanced Cloud Computing (DICT), Scrum Fundamentals (Scrum.org), SQL (HackerRank), Six Sigma Yellow Belt, and SQL Injection Attacks (EC-Council). See them in the Certificates section.`,
    tl: `May **47 certificates** si Jeric, kabilang ang IT Specialist – Data Analytics (Certiport), Advanced Software Engineering at Advanced Cloud Computing (DICT), Scrum Fundamentals (Scrum.org), SQL (HackerRank), Six Sigma Yellow Belt, at SQL Injection Attacks (EC-Council). Makikita mo sila sa Certificates section.`,
  },
  testimonials: {
    en: `Clients love working with Jeric:\n- **Yuri Alfonso** — the PoultryConnect website is excellent, professional and easy to navigate; Jeric is approachable, consistent, and delivers quickly\n- **Alvin Fresnido** — praised how he turned their ideas into a well-designed, smoothly working website\n- **Aaron Katigbak** — impressive, detailed 3D models well-integrated into their website\n- **Philip Zambrano** — responsive, creative, detail-oriented; would work with him again`,
    tl: `Gustong-gusto ng clients na makatrabaho si Jeric:\n- **Yuri Alfonso** — maganda, propesyonal at madaling gamitin ang PoultryConnect website; approachable, consistent at mabilis mag-deliver si Jeric\n- **Alvin Fresnido** — maayos at magandang website mula sa kanilang mga ideya\n- **Aaron Katigbak** — detalyado at magagandang 3D models na swak sa website nila\n- **Philip Zambrano** — responsive, creative, at detail-oriented; gusto ulit siyang makatrabaho`,
  },
  contact: {
    en: `You can reach Jeric at **${EMAIL}** or +63 927 019 6752. He's on LinkedIn (linkedin.com/in/jericpunay) and GitHub (github.com/jericwin). You can also use the contact form at the bottom of this page.`,
    tl: `Pwede mong kontakin si Jeric sa **${EMAIL}** o sa +63 927 019 6752. Nasa LinkedIn (linkedin.com/in/jericpunay) at GitHub (github.com/jericwin) din siya. Pwede ka ring gumamit ng contact form sa baba ng page.`,
  },
  hire: {
    en: `Jeric is **available** for technical roles (software engineer, full-stack developer, data analyst) and freelance work — websites, web apps, dashboards and 3D projects. The best way to start is to email him at **${EMAIL}** or use the contact form at the bottom of this page.`,
    tl: `**Available** si Jeric para sa technical roles (software engineer, full-stack developer, data analyst) at freelance projects — websites, web apps, dashboards at 3D. I-email mo lang siya sa **${EMAIL}** o gamitin ang contact form sa baba ng page para makapagsimula.`,
  },
  services: {
    en: `Jeric can help you with:\n- **Websites & web apps** — business sites, online ordering, e-commerce, booking/management systems\n- **Dashboards & data analysis** — BI dashboards, Excel/VBA automation, statistics, forecasting\n- **AI & automation** — chatbots, AI features, Zapier/n8n workflows\n- **3D & interactive** — 3D models, architectural walkthroughs, games\nEmail him at **${EMAIL}** to discuss your project.`,
    tl: `Matutulungan ka ni Jeric sa:\n- **Websites at web apps** — business sites, online ordering, e-commerce, management systems\n- **Dashboards at data analysis** — BI dashboards, Excel/VBA automation, statistics, forecasting\n- **AI at automation** — chatbots, AI features, Zapier/n8n workflows\n- **3D at interactive** — 3D models, architectural walkthroughs, games\nI-email mo siya sa **${EMAIL}** para mapag-usapan ang project mo.`,
  },
  location: {
    en: `Jeric is based in **Paete, Laguna, Philippines** and is open to remote and on-site work.`,
    tl: `Taga-**Paete, Laguna** si Jeric, at bukas siya sa remote at on-site na trabaho.`,
  },
  resume: {
    en: `You can download Jeric's resume with the **Resume** button at the top of this page (or "Download resume" in the menu).`,
    tl: `Pwede mong i-download ang resume ni Jeric gamit ang **Resume** button sa taas ng page (o "Download resume" sa menu).`,
  },
  ai: {
    en: `Yes — Jeric works **AI-assisted**, using Claude, ChatGPT and GitHub Copilot to research, prototype and learn new stacks fast. He also builds AI features: Gemini in the YV2 website, AI lead scoring in LeadFlow AI, and a chatbot in DigiSPES.`,
    tl: `Oo — **AI-assisted** magtrabaho si Jeric, gamit ang Claude, ChatGPT at GitHub Copilot para mabilis mag-research, mag-prototype at matuto ng bagong stack. Gumagawa rin siya ng AI features: Gemini sa YV2 website, AI lead scoring sa LeadFlow AI, at chatbot sa DigiSPES.`,
  },
  threeD: {
    en: `Jeric builds interactive **3D** with Three.js and React Three Fiber:\n- **Caliraya Coffee House** — two-story café with weather and time of day\n- **Casa Baybay Café** and **Café Turumba** — architectural visualizations\n- **Plastic Shredder & Heat Press** — interactive CAD prototype\n- **Paete Carving Simulation** — virtual wood carving`,
    tl: `Gumagawa si Jeric ng interactive **3D** gamit ang Three.js at React Three Fiber:\n- **Caliraya Coffee House** — two-story café na may iba't ibang weather at oras\n- **Casa Baybay Café** at **Café Turumba** — architectural visualizations\n- **Plastic Shredder & Heat Press** — interactive CAD prototype\n- **Paete Carving Simulation** — virtual na pag-ukit`,
  },
  data: {
    en: `On the data side, Jeric builds BI dashboards, KPI models and forecasts with SQL, pandas, Polars, scikit-learn, Tableau and advanced Excel/VBA. He built **StatEase Analytics** (29 statistical tests with APA output) and **Aether Analytics** (local-first BI), and automated reporting for 32 client companies during his internship.`,
    tl: `Sa data, gumagawa si Jeric ng BI dashboards, KPI models at forecasts gamit ang SQL, pandas, Polars, scikit-learn, Tableau at advanced Excel/VBA. Siya ang gumawa ng **StatEase Analytics** (29 statistical tests na may APA output) at **Aether Analytics** (local-first BI), at nag-automate ng reports para sa 32 client companies noong internship niya.`,
  },
  games: {
    en: `Jeric's games: **Guess the Spy** and **Mafia Game** (social-deduction web games) and **Nightshift: Spaceship Survival** on Roblox. He also made the **Paete Carving Simulation**.`,
    tl: `Mga laro ni Jeric: **Guess the Spy** at **Mafia Game** (social-deduction web games) at **Nightshift: Spaceship Survival** sa Roblox. Gawa rin niya ang **Paete Carving Simulation**.`,
  },
  government: {
    en: `Jeric has built several public-sector systems: a **Disaster Risk Management Information System (DRRMIS)** for a government agency, **DigiSPES** for the student employment program in Baybay, Laguna, and **ECCD** for early childhood care and development.`,
    tl: `Gumawa na si Jeric ng ilang systems para sa gobyerno: **Disaster Risk Management Information System (DRRMIS)** para sa isang government agency, **DigiSPES** para sa SPES sa Baybay, Laguna, at **ECCD** para sa early childhood care and development.`,
  },
  personal: {
    en: `I don't have that detail about Jeric. For anything not on his portfolio, you can ask him directly at **${EMAIL}**.`,
    tl: `Wala akong ganyang detalye tungkol kay Jeric. Para sa mga bagay na wala sa portfolio niya, pwede mo siyang tanungin nang direkta sa **${EMAIL}**.`,
  },
  rate: {
    en: `Rates depend on the project's scope, so Jeric quotes each one personally. Email him at **${EMAIL}** with a short description of what you need, and he'll get back to you.`,
    tl: `Depende sa laki ng project ang presyo, kaya si Jeric mismo ang magbibigay ng quote. I-email mo siya sa **${EMAIL}** kasama ang maikling description ng kailangan mo, at sasagot siya.`,
  },
  fallback: {
    en: `I'm not sure I understood that. I can tell you about Jeric's **projects**, **skills**, **experience**, **education**, **certificates**, or **how to hire him**. Try asking, for example, "What projects has he built?"`,
    tl: `Pasensya, hindi ko masyadong naintindihan. Pwede mo akong tanungin tungkol sa **projects**, **skills**, **experience**, **pag-aaral**, **certificates** ni Jeric, o **paano siya i-hire**. Halimbawa: "Anong mga project niya?"`,
  },
};

/* ---------------------------------------------------------------- intents
   keys: single words or phrases (all words must appear, typos allowed). Phrases score higher. */

const INTENTS = [
  { id: 'site', keys: ['what is this', 'whats this', 'wat is this', 'what is ths', 'wat is ths', 'wats this', 'whats ths', 'what dis', 'what this', 'what is that', 'what site', 'this site', 'this website', 'this page', 'ano ito', 'ano to', 'ano eto', 'ano yan', 'ano iyan', 'anong site', 'anong website', 'para saan', 'para san'] },
  { id: 'bot', keys: ['who are you', 'what are you', 'sino ka', 'ano ka', 'are you ai', 'are you a bot', 'are you human', 'what can you do', 'anong kaya mo', 'ano kaya mo', 'can you help'] },
  { id: 'who', keys: ['who', 'sino', 'introduce', 'background', 'tell me about', 'about him', 'tungkol', 'kwento', 'kilala', 'yourself', 'describe', 'summary', 'profile'] },
  { id: 'services', keys: ['services', 'service', 'offer', 'offers', 'serbisyo', 'what can he do', 'ano kaya niya', 'can he make', 'can he build', 'kaya ba niya', 'help me', 'need a website', 'need website', 'gusto ko ng website', 'magpagawa ng', 'pagawa ng', 'ipagawa', 'magpagawa', 'pagawa', 'make me', 'build me', 'make a website', 'gawan'] },
  { id: 'projects', keys: ['project', 'projects', 'proyekto', 'portfolio', 'built', 'gawa', 'ginawa', 'nagawa', 'apps', 'systems', 'websites', 'works', 'sample', 'samples', 'examples', 'showcase'] },
  { id: 'skills', keys: ['skill', 'skills', 'stack', 'tech', 'technology', 'technologies', 'language', 'languages', 'programming', 'tools', 'framework', 'frameworks', 'kaya', 'marunong', 'alam', 'expertise', 'specialty', 'specialize', 'good at', 'magaling'] },
  { id: 'experience', keys: ['experience', 'karanasan', 'work history', 'worked', 'jobs', 'job', 'employment', 'intern', 'internship', 'ojt', 'company', 'companies', 'employer', 'career', 'trabaho', 'nagtrabaho'] },
  { id: 'current', keys: ['currently', 'right now', 'ngayon', 'current job', 'work now', 'working now', 'present', 'nagtatrabaho', 'where does he work', 'saan nagtatrabaho'] },
  { id: 'education', keys: ['school', 'study', 'studied', 'education', 'college', 'university', 'degree', 'course', 'kurso', 'graduate', 'graduated', 'grad', 'lspu', 'aral', 'nagaral', 'nag aral', 'paaralan', 'eskwelahan', 'skwela', 'pinagaralan', 'kolehiyo'] },
  { id: 'awards', keys: ['award', 'awards', 'honor', 'honors', 'achievement', 'achievements', 'magna', 'cum laude', 'latin honor', 'scholar', 'scholarship', 'dost', 'parangal', 'karangalan', 'accomplishment', 'accomplishments'] },
  { id: 'leadership', keys: ['leadership', 'leader', 'council', 'organization', 'organizations', 'org', 'orgs', 'officer', 'president', 'treasurer', 'affiliation', 'affiliations', 'extracurricular'] },
  { id: 'certs', keys: ['certificate', 'certificates', 'certification', 'certifications', 'certified', 'credential', 'credentials', 'sertipiko', 'cert', 'certs', 'license', 'training', 'trainings'] },
  { id: 'testimonials', keys: ['testimonial', 'testimonials', 'review', 'reviews', 'client', 'clients', 'feedback', 'recommend', 'recommendation', 'sabi ng', 'trusted', 'reliable', 'legit', 'is he good', 'good developer', 'magaling ba', 'galing ba', 'okay ba siya', 'ok ba siya'] },
  { id: 'contact', keys: ['contact', 'email', 'mail', 'reach', 'phone', 'number', 'cellphone', 'mobile', 'linkedin', 'github', 'socials', 'social media', 'message him', 'kontak', 'makausap', 'tawagan', 'contactin', 'kontakin', 'numero'] },
  { id: 'hire', keys: ['hire', 'hiring', 'available', 'availability', 'freelance', 'freelancer', 'work with', 'collaborate', 'job offer', 'open to work', 'looking for work', 'magpagawa', 'pagawa', 'ipagawa', 'kunin', 'i hire', 'recruit', 'bakante', 'tumatanggap'] },
  { id: 'location', keys: ['where', 'location', 'located', 'live', 'lives', 'based', 'saan', 'taga', 'nakatira', 'address', 'lugar', 'country', 'city', 'philippines', 'laguna', 'paete', 'remote', 'onsite'] },
  { id: 'resume', keys: ['resume', 'cv', 'curriculum vitae', 'download'] },
  { id: 'ai', keys: ['ai', 'artificial intelligence', 'chatbot', 'llm', 'prompt', 'automation', 'automate'] },
  { id: 'threeD', keys: ['3d', 'three d', 'modeling', 'modelling', 'models', 'architectural', 'architecture', 'blender', 'cad', 'render 3d', 'walkthrough'] },
  { id: 'data', keys: ['data', 'analytics', 'analyst', 'analysis', 'dashboard', 'dashboards', 'statistics', 'stats', 'bi', 'business intelligence', 'insights', 'report', 'reports', 'reporting'] },
  { id: 'games', keys: ['game', 'games', 'laro', 'gaming', 'game dev', 'gamedev'] },
  { id: 'government', keys: ['government', 'gobyerno', 'lgu', 'public sector', 'drrmis', 'disaster', 'agency'] },
  { id: 'rate', keys: ['rate', 'rates', 'price', 'pricing', 'cost', 'costs', 'magkano', 'presyo', 'bayad', 'fee', 'fees', 'charge', 'quote', 'budget', 'salary', 'sahod', 'sweldo', 'expected salary'] },
  { id: 'personal', keys: ['age', 'old is he', 'ilang taon', 'edad', 'birthday', 'kaarawan', 'girlfriend', 'gf', 'jowa', 'single', 'married', 'kasal', 'religion', 'height', 'tangkad', 'family', 'pamilya', 'hobby', 'hobbies', 'favorite', 'paborito'] },
  { id: 'greet', keys: ['hi', 'hii', 'hai', 'hallo', 'helloo', 'heyy', 'hello', 'hey', 'helo', 'hellow', 'yo', 'sup', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'magandang umaga', 'magandang hapon', 'magandang gabi', 'greetings'] },
  { id: 'thanks', keys: ['thanks', 'thank you', 'thank', 'ty', 'tnx', 'salamat', 'maraming salamat', 'appreciate', 'nice', 'cool', 'great', 'awesome', 'galing', 'ayos', 'sige'] },
  { id: 'bye', keys: ['bye', 'goodbye', 'see you', 'paalam', 'babay', 'ingat'] },
];
const SOCIAL = new Set(['greet', 'thanks', 'bye']);

/* ---------------------------------------------------------------- language */

const TL_STRONG = new Set(['ano', 'anong', 'sino', 'saan', 'san', 'siya', 'sya', 'niya', 'nya', 'ba', 'po', 'mga', 'paano', 'pano', 'pwede', 'puwede', 'pede', 'gaano', 'ilan', 'ilang', 'bakit', 'kailan', 'yung', 'yun', 'iyan', 'yan', 'nito', 'ito', 'eto', 'kanya', 'kanyang', 'niyang', 'nyang', 'kay', 'si', 'ng', 'ang', 'naman', 'lang', 'rin', 'din', 'meron', 'wala', 'tungkol', 'magkano', 'salamat', 'kumusta', 'kamusta', 'musta', 'marunong', 'gawa', 'ginawa', 'nagawa', 'galing', 'taga', 'nag', 'mag', 'kaya', 'alam', 'trabaho', 'talaga', 'sige', 'pa', 'na', 'sa', 'ako', 'ko', 'mo', 'ka', 'kayo', 'natin', 'namin', 'nyo', 'ninyo', 'diba', 'ganun', 'ganon', 'paki', 'pakisabi', 'gusto', 'kailangan', 'magpagawa', 'nagaral', 'aral', 'ito', 'iyon', 'yon', 'dito', 'doon', 'saka', 'tsaka', 'eh', 'kasi', 'para']);
const TL_WEAK = new Set(['pa', 'na', 'sa', 'ko', 'mo', 'ka', 'si', 'ng', 'ang', 'kay', 'para', 'eh', 'yan']);

function isTagalog(tokens) {
  let strong = 0, weak = 0;
  for (const t of tokens) {
    if (TL_WEAK.has(t)) weak++;
    else if (TL_STRONG.has(t)) strong++;
  }
  return strong >= 1 || weak >= 2;
}

/* ---------------------------------------------------------------- text matching */

function normalize(text) {
  return ` ${String(text).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/c#/g, ' csharp ').replace(/\.net\b/g, ' dotnet ').replace(/asp\.net/g, ' aspnet ')
    .replace(/node\.js/g, ' nodejs ').replace(/three\.js/g, ' threejs ').replace(/react\.js/g, ' reactjs ')
    .replace(/chart\.js/g, ' chartjs ').replace(/socket\.io/g, ' socketio ').replace(/e-commerce/g, ' ecommerce ')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/([a-z])\1{2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

// Optimal string alignment distance (Levenshtein + adjacent swaps).
function distance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

function wordMatches(token, word) {
  if (token === word) return true;
  const short = Math.min(token.length, word.length);
  if (short < 4 || Math.abs(token.length - word.length) > 2) return false;
  return distance(token, word) <= (short <= 5 ? 1 : 2);
}

// A key (word or phrase) matches when every word in it is found among the tokens (typos allowed).
// Each word of the question can satisfy only one word of the key ("what is his" must not match "what is that").
function keyMatches(tokens, key) {
  const used = new Set();
  return key.split(' ').every(w => {
    let i = tokens.findIndex((t, j) => !used.has(j) && t === w);
    if (i < 0) i = tokens.findIndex((t, j) => !used.has(j) && wordMatches(t, w));
    if (i < 0) return false;
    used.add(i);
    return true;
  });
}

function aliasMatches(norm, compact, tokens, alias) {
  if (norm.includes(` ${alias} `)) return true;
  const ac = alias.replace(/ /g, '');
  if (ac.length >= 5 && compact.includes(ac)) return true;
  if (!alias.includes(' ') && alias.length >= 5) return tokens.some(t => t === alias || (t.length >= 5 && Math.abs(t.length - alias.length) <= 1 && distance(t, alias) <= 1));
  if (alias.includes(' ') && alias.replace(/ /g, '').length >= 8) return keyMatches(tokens, alias);
  return false;
}

function analyze(text) {
  const norm = normalize(text);
  const tokens = norm.trim().split(' ').filter(Boolean);
  const compact = norm.replace(/ /g, '');
  // When several projects match, keep the ones named most specifically ("naz coffee" beats "coffee").
  const hits = PROJECTS.map(p => ({ p, len: Math.max(0, ...p.aliases.filter(a => aliasMatches(norm, compact, tokens, a)).map(a => a.length)) }))
    .filter(h => h.len > 0);
  const best = Math.max(0, ...hits.map(h => h.len));
  const projects = hits.filter(h => h.len === best).map(h => h.p);
  const tech = TECH.filter(t => t.aliases.some(a => aliasMatches(norm, compact, tokens, a)));
  const scores = {};
  for (const intent of INTENTS) {
    let s = 0;
    for (const k of intent.keys) if (keyMatches(tokens, k)) s += k.split(' ').length;
    if (s) scores[intent.id] = s;
  }
  return { tokens, projects, tech, scores, tl: isTagalog(tokens) };
}

/* ---------------------------------------------------------------- answer builders */

const list = names => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
const listTl = names => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} at ${names[names.length - 1]}`;

function projectAnswer(p, tl) {
  return tl
    ? `Heto ang **${p.name}** — ${p.desc}\n- Stack: ${p.stack}\n- Tingnan dito: ${p.url}`
    : `**${p.name}** is ${p.desc}\n- Stack: ${p.stack}\n- Live: ${p.url}`;
}

function projectsAnswer(ps, tl) {
  const lines = ps.slice(0, 6).map(p => `- **${p.name}** — ${p.desc.split(/[.—]/)[0].trim()}`);
  return (tl ? `Ilan sa mga related na project ni Jeric:\n` : `Here are Jeric's related projects:\n`) + lines.join('\n')
    + (tl ? `\nTanungin mo ako tungkol sa kahit alin para sa detalye.` : `\nAsk me about any of them for details.`);
}

function techAnswer(techs, tl) {
  const parts = techs.slice(0, 3).map(t => {
    const used = PROJECTS.filter(p => t.aliases.some(a => normalize(p.stack).includes(` ${a} `) || normalize(p.stack).replace(/ /g, '').includes(a.replace(/ /g, '')))).map(p => p.name);
    const sample = used.slice(0, 4);
    if (tl) return `Oo, marunong si Jeric ng **${t.name}** (${t.use}).` + (sample.length ? ` Ginamit niya ito sa ${listTl(sample)}.` : '');
    return `Yes — Jeric works with **${t.name}** (${t.use}).` + (sample.length ? ` He used it in ${list(sample)}.` : '');
  });
  return parts.join('\n\n');
}

const ASKS_KNOW = /\b(know|knows|use|uses|using|familiar|experience with|work with|can he|does he|marunong|alam|gamit|gumagamit|kaya)\b/;

/* ---------------------------------------------------------------- main */

export function offlineReply(messages) {
  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
  const question = userMsgs[userMsgs.length - 1] || '';
  const q = analyze(question);
  const tl = q.tl;
  const pick = id => (tl ? A[id].tl : A[id].en);

  const ranked = Object.entries(q.scores).sort((a, b) => b[1] - a[1]);
  const topical = ranked.filter(([id]) => !SOCIAL.has(id));
  const top = topical[0]?.[0];

  // A specific project was named.
  if (q.projects.length === 1) return projectAnswer(q.projects[0], tl);
  if (q.projects.length > 1) return projectsAnswer(q.projects, tl);

  // Follow-ups like "what is this?", "anong stack nito?", "link?" refer to the last project mentioned.
  const followUp = /\b(it|this|that|its|nito|ito|yan|iyan|yun|iyon|niyan|dyan|diyan|stack|link|url|demo|live|tech|ginamit|gamit)\b/.test(normalize(question));
  if (followUp && q.tech.length === 0 && (!top || ['site', 'skills', 'who'].includes(top))) {
    for (let i = userMsgs.length - 2; i >= 0 && i >= userMsgs.length - 4; i--) {
      const prev = analyze(userMsgs[i]);
      if (prev.projects.length === 1) return projectAnswer(prev.projects[0], tl);
    }
  }

  // A technology was named ("does he know React?", "marunong ba siya ng python?").
  if (q.tech.length && (!top || ['skills', 'experience', 'data', 'ai', 'threeD', 'games', 'projects'].includes(top) || ASKS_KNOW.test(normalize(question)))) {
    return techAnswer(q.tech, tl);
  }

  if (top) return pick(top);
  if (ranked.length) return pick(ranked[0][0]); // greeting / thanks / bye

  // Asked whether he knows something we don't recognise.
  if (ASKS_KNOW.test(normalize(question))) {
    return tl
      ? `Hindi ko iyan nakikita sa profile ni Jeric. Ang core stack niya ay **Python, C#/.NET, JavaScript/TypeScript, React at SQL**. Para makasigurado, i-email mo siya sa **${EMAIL}**.`
      : `I don't see that in Jeric's profile. His core stack is **Python, C#/.NET, JavaScript/TypeScript, React and SQL**. To be sure, email him at **${EMAIL}**.`;
  }
  return pick('fallback');
}
