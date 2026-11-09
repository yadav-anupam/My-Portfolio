// ============================================
// ANUPAM YADAV PORTFOLIO - OPTIMIZED SCRIPT
// ============================================

// --- PAGE LOADER ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
});

// --- CANVAS PARTICLES SYSTEM (Optimized & Pause on Hidden) ---
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let animId = null;
  const particleCount = window.innerWidth < 768 ? 40 : 75;
  const maxDistanceSq = 14400; // 120 * 120

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  }, { passive: true });

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.2
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      else if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      else if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198,138,78,${p.a})`;
      ctx.fill();

      // Proximity connections with squared distance check to avoid Math.hypot overhead
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistanceSq) {
          const d = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(198,138,78,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    if (!document.hidden && !prefersReducedMotion) {
      animId = requestAnimationFrame(drawParticles);
    }
  }

  if (!prefersReducedMotion) {
    drawParticles();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(drawParticles);
      }
    });
  }
}

// ========================================================
// --- MASTER CINEMATIC SCROLL & PARALLAX ENGINE ---
// ========================================================
const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');
const sections = ['hero','about','skills','technology-universe','projects','certifications','education','experience','testimonials','profiles','contact'];
const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
const sdots = document.querySelectorAll('.sdot');
const scrollBadgeEl = document.getElementById('scroll-section-badge');
const parallaxElements = document.querySelectorAll('[data-speed]');
const heroCinematicContent = document.querySelector('.hero-content-cinematic');
const heroCinematicTerminal = document.querySelector('.hero-terminal-cinematic');
const eduTimeline = document.getElementById('edu-timeline');
const eduLineActive = document.getElementById('edu-timeline-line-active');
const eduItems = document.querySelectorAll('.edu-item');
const techUniverseSec = document.getElementById('technology-universe');

// Ambient lighting colors per section
const sectionAmbientMap = {
  'hero': 'rgba(198, 138, 78, 0.08)',
  'about': 'rgba(185, 122, 74, 0.07)',
  'skills': 'rgba(224, 174, 110, 0.06)',
  'technology-universe': 'rgba(198, 138, 78, 0.12)',
  'projects': 'rgba(185, 122, 74, 0.08)',
  'certifications': 'rgba(224, 174, 110, 0.06)',
  'education': 'rgba(198, 138, 78, 0.07)',
  'experience': 'rgba(198, 138, 78, 0.08)',
  'testimonials': 'rgba(185, 122, 74, 0.06)',
  'profiles': 'rgba(224, 174, 110, 0.06)',
  'contact': 'rgba(224, 174, 110, 0.13)'
};

let currentActiveSectionId = 'hero';
let isScrollTicking = false;

// Motion Debug HUD State
const isDebugMotion = window.location.search.includes('motionDebug=true');
let debugHudEl = null;
let fpsFrames = 0;
let lastFpsTime = performance.now();
let currentFps = 60;

if (isDebugMotion) {
  debugHudEl = document.createElement('div');
  debugHudEl.id = 'motion-debug-hud';
  debugHudEl.innerHTML = '<span>⚡ CINEMATIC ENGINE ACTIVE</span>';
  document.body.appendChild(debugHudEl);
}

function handleScrollUpdates() {
  const currentScrollY = window.scrollY;
  const vh = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight - vh;
  const globalProgress = docHeight > 0 ? (currentScrollY / docHeight) : 0;

  // 1. Scroll Progress Bar
  if (progressBar) {
    progressBar.style.width = (globalProgress * 100).toFixed(2) + '%';
  }

  // 2. Navbar & Back to Top Toggle
  if (navbar) {
    navbar.classList.toggle('scrolled', currentScrollY > 60);
  }
  if (backToTop) {
    backToTop.classList.toggle('show', currentScrollY > 400);
  }

  // 3. Section Indicator Dots & Ambient Background Transition
  // Developer Journey scroll-driven stage activation in #about
  const aboutSec = document.getElementById('about');
  if (aboutSec && !prefersReducedMotion) {
    const aRect = aboutSec.getBoundingClientRect();
    if (aRect.top < vh && aRect.bottom > 0) {
      const aProgress = Math.min(1, Math.max(0, (vh * 0.6 - aRect.top) / aRect.height));
      const targetStage = aProgress < 0.25 ? 0 : (aProgress < 0.5 ? 1 : (aProgress < 0.75 ? 2 : 3));
      if (targetStage !== currentJourneyStage) {
        setJourneyStage(targetStage);
      }
    }
  }
  const viewportMiddle = currentScrollY + vh / 2;
  for (let i = 0; i < sectionElements.length; i++) {
    const el = sectionElements[i];
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (viewportMiddle >= top && viewportMiddle < bottom) {
      if (currentActiveSectionId !== el.id) {
        currentActiveSectionId = el.id;
        const ambientColor = sectionAmbientMap[el.id] || 'rgba(198, 138, 78, 0.08)';
        document.documentElement.style.setProperty('--ambient-color', ambientColor);
        document.documentElement.style.setProperty('--ambient-y', ((i / sectionElements.length) * 60 + 20) + '%');
      }
      sdots.forEach((dot, dotIdx) => dot.classList.toggle('active', dotIdx === i));
      break;
    }
  }

  if (!prefersReducedMotion) {
    // 4. Hero Cinematic Scroll Transformation
    if (currentScrollY <= vh) {
      if (heroCinematicContent) {
        const textOffset = (currentScrollY * 0.22).toFixed(1);
        const textOpacity = Math.max(0.15, 1 - (currentScrollY / (vh * 0.85))).toFixed(2);
        heroCinematicContent.style.transform = `translate3d(0, -${textOffset}px, 0)`;
        heroCinematicContent.style.opacity = textOpacity;
      }
      if (heroCinematicTerminal) {
        const termScale = (1 + Math.min(0.035, (currentScrollY / vh) * 0.035)).toFixed(3);
        const termOffset = (currentScrollY * 0.08).toFixed(1);
        heroCinematicTerminal.style.transform = `translate3d(0, ${termOffset}px, 0) scale(${termScale})`;
      }
    } else {
      if (heroCinematicContent && heroCinematicContent.style.opacity !== '0') {
        heroCinematicContent.style.opacity = '0';
      }
    }

    // 5. Global Multi-Speed Parallax Elements
    if (parallaxElements.length > 0) {
      parallaxElements.forEach(el => {
        if (el === heroCinematicContent || el === heroCinematicTerminal) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const speed = parseFloat(el.dataset.speed) || 0.1;
          const offset = ((vh / 2) - (rect.top + rect.height / 2)) * speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      });
    }

    // 6. Education Drawing Timeline Line & Dot Activations
    if (eduTimeline && eduLineActive) {
      const timeRect = eduTimeline.getBoundingClientRect();
      if (timeRect.top < vh && timeRect.bottom > 0) {
        const drawProgress = Math.min(1, Math.max(0, (vh * 0.7 - timeRect.top) / timeRect.height));
        eduLineActive.style.height = (drawProgress * 100).toFixed(1) + '%';

        const lineTipY = timeRect.top + (drawProgress * timeRect.height);
        eduItems.forEach(item => {
          const dot = item.querySelector('.edu-dot');
          if (dot) {
            const dotRect = dot.getBoundingClientRect();
            item.classList.toggle('is-active', dotRect.top <= lineTipY + 10);
          }
        });
      }
    }

    // 7. Technology Universe Scroll-Driven Progress
    if (techUniverseSec) {
      const uRect = techUniverseSec.getBoundingClientRect();
      if (uRect.top < vh && uRect.bottom > 0) {
        const uProgress = Math.min(1, Math.max(0, (vh - uRect.top) / (vh + uRect.height)));
        techUniverseSec.style.setProperty('--galaxy-progress', uProgress.toFixed(2));
      }
    }
  }

  // 8. Motion Debug HUD Update
  if (isDebugMotion && debugHudEl) {
    fpsFrames++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
      currentFps = Math.round((fpsFrames * 1000) / (now - lastFpsTime));
      fpsFrames = 0;
      lastFpsTime = now;
    }
    debugHudEl.innerHTML = `<span>FPS: ${currentFps}</span> | <span>SEC: ${currentActiveSectionId.toUpperCase()}</span> | <span>SCROLL: ${(globalProgress * 100).toFixed(1)}%</span>`;
  }

  isScrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!isScrollTicking) {
    requestAnimationFrame(handleScrollUpdates);
    isScrollTicking = true;
  }
}, { passive: true });


// ========================================================
// --- INTERACTIVE CARD SPOTLIGHT (SKIPER UI PATTERN) ---
// ========================================================
function initCardSpotlight() {
  const spotlightTargets = document.querySelectorAll('.card-spotlight, .project-card, .stat-card, .profile-card, .testi-card');
  spotlightTargets.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');
    }, { passive: true });
  });
}

// ========================================================
// --- STATS NUMBERS ONCE-ONLY COUNTER ANIMATION ---
// ========================================================
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-num[data-count]');
  if (statNumbers.length === 0 || !('IntersectionObserver' in window)) return;

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseInt(el.dataset.count, 10) || 0;
        const duration = 1200;
        const startTime = performance.now();

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.round(targetVal * easeOut);
          el.textContent = currentVal + '+';

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = targetVal + '+';
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(s => statsObserver.observe(s));
}

// ========================================================
// --- SECTION HEADINGS CINEMATIC REVEAL ---
// ========================================================
function initHeadingReveals() {
  const headingReveals = document.querySelectorAll('.section-heading-reveal');
  if (headingReveals.length === 0 || !('IntersectionObserver' in window)) return;

  const headingObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  headingReveals.forEach(h => headingObserver.observe(h));
}

// ========================================================
// --- FEATURE 2: CENTRALIZED PORTFOLIO METADATA ---
// ========================================================
const portfolioMeta = {
  version: "2.4",
  lastUpdated: "2026-11-09",
  lastUpdatedFormatted: "09 Nov 2026"
};

function initPortfolioMeta() {
  const versionEl = document.getElementById('meta-version');
  const updatedEl = document.getElementById('meta-updated');
  if (versionEl) versionEl.textContent = 'Portfolio v' + portfolioMeta.version;
  if (updatedEl) updatedEl.textContent = 'Last updated: ' + portfolioMeta.lastUpdatedFormatted;
}

// ========================================================
// --- FEATURE 3: INTERACTIVE DEVELOPER JOURNEY (ABOUT) ---
// ========================================================
const journeyStagesData = [
  {
    stageNum: "01",
    badge: "STAGE 01 — FOUNDATION",
    title: "The Curious Student",
    quote: '"Learning the fundamentals. Building the foundation."',
    desc: "B.Tech Computer Science Engineering student at Kashi Institute of Technology. Diving deep into Data Structures, Algorithms, Python programming, and computer science principles that form the cornerstone of every reliable system.",
    tags: ["DSA", "Python", "Logic Design", "Academic Rigor"],
    nextPrompt: "Next Stage: Applied Software Logic →",
    nextStage: 1
  },
  {
    stageNum: "02",
    badge: "STAGE 02 — CODE & LOGIC",
    title: "The Python Developer",
    quote: '"Turning ideas into working software."',
    desc: "Transitioning theoretical knowledge into running software. Designing algorithmic tools, command-line applications, and web services. Actively experimenting with AI models, clean code architecture, and automation scripts.",
    tags: ["Python CLI", "NLP Chatbots", "REST APIs", "Modern Web"],
    nextPrompt: "Next Stage: Real Systems & Products →",
    nextStage: 2
  },
  {
    stageNum: "03",
    badge: "STAGE 03 — ARCHITECTURE",
    title: "The Systems Builder",
    quote: '"Building real products around real problems."',
    desc: "Architecting real-world applications including AcadTrack (Continuous Coursework Evaluation with Supabase), Kisan Setu (AI Agri-Tech Flagship), and MyKhata (Financial Ledger PWA). Integrating databases, real-time queues, and machine learning pipelines.",
    tags: ["AcadTrack", "Kisan Setu", "MyKhata", "Full Stack", "PostgreSQL"],
    nextPrompt: "Next Stage: Digital Ecosystem & Innovation →",
    nextStage: 3
  },
  {
    stageNum: "04",
    badge: "STAGE 04 — ECOSYSTEM",
    title: "The Technology Explorer",
    quote: '"Building products, brands and opportunities."',
    desc: "Pioneering WebJugad Labs — an incubator for high-impact web apps, automation frameworks, and generative AI prototypes. Connecting discrete tools into a coherent digital ecosystem of technology and engineering.",
    tags: ["WebJugad Labs", "Digital Ecosystem", "AI Prototypes", "Open to Work"],
    nextPrompt: "Explore Ecosystem in Technology Universe ↓",
    nextStage: "universe"
  }
];

let currentJourneyStage = 0;

function setJourneyStage(index) {
  if (index < 0 || index >= journeyStagesData.length) return;
  currentJourneyStage = index;
  const data = journeyStagesData[index];

  // Update tabs
  const tabs = document.querySelectorAll('.dev-journey__tab');
  tabs.forEach((tab, idx) => {
    const isActive = idx === index;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update Visuals with cross-fade
  const artItems = document.querySelectorAll('.dev-journey__art');
  artItems.forEach((art, idx) => {
    art.classList.toggle('active', idx === index);
  });

  // Update Narrative text
  const badgeEl = document.getElementById('journey-badge');
  const titleEl = document.getElementById('journey-title');
  const quoteEl = document.getElementById('journey-quote');
  const descEl = document.getElementById('journey-desc');
  const tagsEl = document.getElementById('journey-tags');
  const nextLinkEl = document.getElementById('journey-next-link');

  if (badgeEl) badgeEl.textContent = data.badge;
  if (titleEl) titleEl.textContent = data.title;
  if (quoteEl) quoteEl.textContent = data.quote;
  if (descEl) descEl.textContent = data.desc;

  if (tagsEl) {
    tagsEl.innerHTML = data.tags.map(t => `<span class="dev-journey__tag">${t}</span>`).join('');
  }

  if (nextLinkEl) {
    nextLinkEl.textContent = data.nextPrompt;
    if (data.nextStage === 'universe') {
      nextLinkEl.href = '#technology-universe';
      nextLinkEl.onclick = null;
    } else {
      nextLinkEl.href = '#dev-journey';
      nextLinkEl.onclick = (e) => {
        e.preventDefault();
        setJourneyStage(data.nextStage);
      };
    }
  }
}

function initDeveloperJourney() {
  const tabsContainer = document.getElementById('dev-journey-tabs');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.dev-journey__tab');
      if (!tab) return;
      const stageIdx = parseInt(tab.dataset.stage, 10);
      setJourneyStage(stageIdx);
    });
  }
}

// ========================================================
// --- FEATURE 1: ANUPAM AI — CONVERSATIONAL & SEMANTIC ENGINE ---
// ========================================================
const portfolioKnowledge = {
  identity: {
    name: "Anupam Yadav",
    role: "Computer Science Engineering Student & Python Developer",
    passion: "Artificial Intelligence, Practical IT Solutions, Web Engineering",
    institute: "Kashi Institute of Technology (KIT), Varanasi",
    degree: "B.Tech in Computer Science Engineering (2025–2029)",
    location: "Varanasi, Uttar Pradesh, India",
    status: "Actively seeking IT Engineering & Software Development Internships"
  },
  projects: [
    {
      id: "kisan-setu",
      name: "Kisan Setu",
      aliases: ["kisan setu", "kisn setu", "kissan setu", "kisan", "farmer", "farmers", "agriculture", "mandi", "procurement", "queue prediction", "agritech"],
      tagline: "AI Agri-Tech Flagship & Mandi Queue Management Platform",
      category: "AI Agri-Tech",
      purpose: "Solves procurement congestion and lengthy queues at mandis, giving farmers predictable scheduling and officers real-time throughput metrics.",
      technologies: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Supabase", "Machine Learning"],
      models: "Queue waiting-time prediction models and dynamic throughput forecasting based on historical arrival trends and center handling capacity.",
      features: [
        "Dynamic token generation & timeslot scheduling for farmers",
        "Predictive wait-time estimates powered by ML",
        "Center load balancing across local procurement hubs",
        "Bilingual SMS/WhatsApp slot confirmations"
      ],
      link: "#projects",
      universeTag: "AI & Logistical Optimization"
    },
    {
      id: "acadtrack",
      name: "AcadTrack",
      aliases: ["acadtrack", "acad track", "acdatrack", "acad trak", "evaluation engine", "rubric", "coursework", "grading", "internal assessment", "student marks"],
      tagline: "Continuous Internal Assessment & Coursework Evaluation Platform",
      category: "EdTech & Performance Intelligence",
      purpose: "Automates coursework scoring and continuous internal assessment analytics through customizable evaluation rubrics.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Supabase", "PostgreSQL", "Row-Level Security (RLS)", "Vercel"],
      features: [
        "Dynamic rubric builder with weighted criteria scoring",
        "Automated total grade computation and moderation rules",
        "Student performance intelligence & batch distribution analytics",
        "Secure role-based faculty access with PostgreSQL RLS"
      ],
      link: "#projects",
      universeTag: "Evaluation Engine"
    },
    {
      id: "webjugad-labs",
      name: "WebJugad Labs",
      aliases: ["webjugad labs", "webjugad", "web jugad", "digital studio", "agency", "incubator", "prototyping"],
      tagline: "Creative Digital Technology Incubator & Prototyping Lab",
      category: "Digital Solutions",
      purpose: "Serves as a production testbed for client web applications, utility tools, and generative AI workflow prototypes.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Firebase", "Firestore", "Automation", "REST APIs"],
      features: [
        "Rapid prototyping pipeline for modern web applications",
        "Generative AI workflow experimentation",
        "Custom IT solutions and client tool deployment"
      ],
      link: "#technology-universe"
    },
    {
      id: "mykhata",
      name: "MyKhata",
      aliases: ["mykhata", "my khata", "smart ledger", "ledger", "bookkeeping", "accounting", "financial tracker"],
      tagline: "Smart Financial Ledger & Daily Bookkeeping PWA",
      category: "Fintech Utility",
      purpose: "Enables small business owners and individuals to track cash flow, credit/debit balances, and transaction audit trails offline.",
      technologies: ["Progressive Web App (PWA)", "HTML5", "CSS3", "JavaScript", "Firebase", "Firestore", "IndexedDB"],
      features: [
        "Offline-first transaction logging with auto-sync on reconnect",
        "Customer & supplier ledger separation",
        "Net balance summaries and audit export"
      ],
      link: "#projects"
    },
    {
      id: "smart-vision-school",
      name: "Smart Vision School",
      aliases: ["smart vision school", "smart vision", "school portal", "edu portal", "school management"],
      tagline: "Educational Institution Portal & Management System",
      category: "Institutional EdTech",
      purpose: "Provides a digital face and administrative portal for Smart Vision School, featuring student profiles and campus updates.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Firebase", "Authentication"],
      features: [
        "Student directory and academic record logging",
        "Notice board and event publishing system",
        "Mobile-optimized responsive institutional interface"
      ],
      link: "#projects"
    },
    {
      id: "hangman",
      name: "Hangman Game",
      aliases: ["hangman", "hangman game", "word game", "cli game"],
      tagline: "Interactive Command-Line Word Puzzle",
      category: "Python CLI",
      purpose: "Interactive game demonstrating algorithm design, string manipulation, and input validation in Python.",
      technologies: ["Python", "CLI", "Game Logic"],
      link: "https://github.com/yadav-anupam/CodeAlpha_HangmanGame"
    },
    {
      id: "chatbot",
      name: "Basic Chatbot",
      aliases: ["basic chatbot", "chatbot", "nlp chatbot", "conversational chatbot"],
      tagline: "Rule-Based Conversational Flow Assistant",
      category: "Python NLP",
      purpose: "Conversational prototype simulating dialog state management and intent routing using rule-based NLP techniques.",
      technologies: ["Python", "NLP Fundamentals", "Pattern Matching"],
      link: "https://github.com/yadav-anupam/CodeAlpha_BasicChatbot"
    },
    {
      id: "stock-tracker",
      name: "Stock Portfolio Tracker",
      aliases: ["stock tracker", "stock portfolio tracker", "portfolio tracker", "stocks"],
      tagline: "Financial Analytics & Real-Time P&L Calculator",
      category: "Python Finance",
      purpose: "Portfolio tool calculating real-time profit and loss distributions across user equity holdings.",
      technologies: ["Python", "Financial Calculations", "Data Tracking"],
      link: "https://github.com/yadav-anupam/CodeAlpha_StockPortfolioTracker"
    }
  ],
  skills: {
    languages: ["Python", "C", "JavaScript", "HTML5", "CSS3"],
    backend: ["Firebase", "Firestore", "Supabase", "PostgreSQL", "FastAPI", "REST APIs"],
    ai_ml: ["Generative AI", "Prompt Engineering", "NLP Techniques", "Queue Modeling"],
    tools: ["Git", "GitHub", "VS Code", "Vercel", "Linux", "npm"]
  },
  certifications: [
    { title: "AI Skills Passport", issuer: "EY & Microsoft", topic: "Artificial Intelligence & Professional Application" },
    { title: "Career Essentials in Generative AI", issuer: "Microsoft & LinkedIn", topic: "Generative AI Systems & Prompt Fundamentals" },
    { title: "Generative AI Foundations", issuer: "Anthropic", topic: "Large Language Models & Alignment Principles" },
    { title: "GenAI-Powered Data Analytics Job Simulation", issuer: "TATA Forage", topic: "Applied Data Analysis with GenAI Tools" }
  ],
  education: [
    { degree: "B.Tech in Computer Science Engineering", institution: "Kashi Institute of Technology (KIT), Varanasi", years: "2025 — 2029", status: "Currently in 2nd Year" },
    { degree: "Senior Secondary (12th PCM)", institution: "Smart Vision School, Varanasi", year: "2025" },
    { degree: "High School (10th)", institution: "Smart Vision School, Varanasi", year: "2023" }
  ],
  contact: {
    email: "yadavanupam9119@gmail.com",
    github: "https://github.com/yadav-anupam",
    linkedin: "https://www.linkedin.com/in/anupam-yadavv",
    resume: "./Anupam%20resume.pdf",
    location: "Varanasi, India"
  },
  customEntries: []
};

// Conversational Memory State
const conversationState = {
  messages: [],
  currentTopic: null,
  currentProject: null,
  lastIntent: null,
  lastEntityName: null
};

window.portfolioKnowledge = portfolioKnowledge;
window.conversationState = conversationState;

// String Distance & Similarity
function levenshteinDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function wordSimilarity(w1, w2) {
  if (w1 === w2) return 1.0;
  if (!w1 || !w2) return 0.0;
  const maxLen = Math.max(w1.length, w2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(w1, w2);
  return 1 - (dist / maxLen);
}

// Canonical word mapping
const CANONICAL_WORDS = {
  "pyhton": "python", "pythn": "python", "pytn": "python",
  "javscript": "javascript", "javasript": "javascript", "js": "javascript", "jscript": "javascript",
  "kisn": "kisan", "kissan": "kisan", "setu": "setu",
  "acad": "acad", "acdatrack": "acadtrack", "acadtrak": "acadtrack", "acadtrk": "acadtrack",
  "mykhata": "mykhata", "khata": "mykhata",
  "webjugad": "webjugad", "jugad": "webjugad",
  "cert": "certification", "certs": "certifications", "certifcate": "certification", "certifcates": "certifications", "courses": "certifications",
  "intern": "internship", "interns": "internship", "intership": "internship", "job": "internship",
  "enginering": "engineering", "btech": "btech", "colleg": "college", "universty": "university",
  "generativ": "generative", "genai": "generative ai", "ml": "machine learning",
  "gthub": "github", "git": "git", "linkdn": "linkedin", "linkdin": "linkedin",
  "resum": "resume", "cv": "resume"
};

// Normalize input query
function normalizeQuery(input) {
  if (!input) return "";
  let q = input.toLowerCase().trim();
  
  q = q.replace(/what's/g, "what is")
       .replace(/he's/g, "he is")
       .replace(/who's/g, "who is")
       .replace(/how's/g, "how is")
       .replace(/can't/g, "cannot")
       .replace(/won't/g, "will not")
       .replace(/i'm/g, "i am")
       .replace(/i'd/g, "i would")
       .replace(/there's/g, "there is");

  q = q.replace(/-/g, " ");
  q = q.replace(/[^\w\s\+\#]/g, " ");
  
  const rawTokens = q.split(/\s+/).filter(Boolean);
  const normalizedTokens = rawTokens.map(tok => {
    if (CANONICAL_WORDS[tok]) return CANONICAL_WORDS[tok];
    if (tok.length >= 4) {
      for (const [mis, fix] of Object.entries(CANONICAL_WORDS)) {
        if (wordSimilarity(tok, mis) >= 0.8) {
          return fix;
        }
      }
    }
    return tok;
  });

  return normalizedTokens.join(" ");
}

function findMatchingProject(normalizedText) {
  for (const proj of portfolioKnowledge.projects) {
    if (normalizedText.includes(proj.name.toLowerCase())) return proj;
    for (const alias of proj.aliases) {
      if (normalizedText.includes(alias.toLowerCase())) return proj;
    }
  }

  for (const proj of portfolioKnowledge.projects) {
    const words = normalizedText.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (wordSimilarity(words[i], "kisan") >= 0.8 && (words[i+1] && wordSimilarity(words[i+1], "setu") >= 0.8)) {
        return portfolioKnowledge.projects.find(p => p.id === "kisan-setu");
      }
      if (wordSimilarity(words[i], "acadtrack") >= 0.75 || (words[i] === "acad" && words[i+1] && words[i+1].startsWith("tra"))) {
        return portfolioKnowledge.projects.find(p => p.id === "acadtrack");
      }
      if (wordSimilarity(words[i], "mykhata") >= 0.8 || (words[i] === "my" && words[i+1] && wordSimilarity(words[i+1], "khata") >= 0.8)) {
        return portfolioKnowledge.projects.find(p => p.id === "mykhata");
      }
      if (wordSimilarity(words[i], "webjugad") >= 0.8 || (words[i] === "web" && words[i+1] && wordSimilarity(words[i+1], "jugad") >= 0.8)) {
        return portfolioKnowledge.projects.find(p => p.id === "webjugad-labs");
      }
    }
  }

  if (normalizedText.includes("farmer") || normalizedText.includes("agriculture") || normalizedText.includes("mandi") || normalizedText.includes("crop")) {
    return portfolioKnowledge.projects.find(p => p.id === "kisan-setu");
  }
  if (normalizedText.includes("rubric") || normalizedText.includes("internal assessment") || normalizedText.includes("grading") || normalizedText.includes("coursework")) {
    return portfolioKnowledge.projects.find(p => p.id === "acadtrack");
  }
  if (normalizedText.includes("ledger") || normalizedText.includes("bookkeeping") || normalizedText.includes("credit debit")) {
    return portfolioKnowledge.projects.find(p => p.id === "mykhata");
  }

  return null;
}

function isContextualFollowUp(text) {
  const t = text.toLowerCase();
  const pronouns = [" it ", " its ", " this ", " that ", " the project ", " for it", " use for it", " about it", " with it", " this one", " that one"];
  const padded = " " + t + " ";
  for (const p of pronouns) {
    if (padded.includes(p)) return true;
  }
  if (t === "what tech did he use?" || t === "what tech was used?" || t === "what technologies did he use?" || t === "what model?" || t === "who is it for?" || t === "does it use ai?" || t === "features?" || t === "how does it work?") {
    return true;
  }
  return false;
}

function isSecurityViolation(text) {
  const t = text.toLowerCase();
  return (
    t.includes("ignore all previous") ||
    t.includes("ignore previous instructions") ||
    t.includes("system prompt") ||
    t.includes("credentials") ||
    t.includes("firebase secret") ||
    t.includes("admin password") ||
    t.includes("api key") ||
    t.includes("private key") ||
    t.includes("leak") ||
    t.includes("bypass")
  );
}

function isGibberish(text) {
  const clean = text.replace(/[^a-zA-Z]/g, "");
  if (clean.length < 5) return false;
  const vowels = clean.match(/[aeiou]/gi);
  const vowelRatio = vowels ? vowels.length / clean.length : 0;
  if (clean.length >= 7 && vowelRatio < 0.12) return true;
  if (/([a-zA-Z])\1{4,}/.test(clean)) return true;
  return false;
}

function generateFollowUps(topic, entity) {
  if (topic === "project" && entity) {
    if (entity.id === "kisan-setu") {
      return [
        { label: "What technologies were used?", query: "What technologies does Kisan Setu use?" },
        { label: "How does the AI queue work?", query: "How does its AI work?" },
        { label: "Compare with AcadTrack", query: "Compare Kisan Setu and AcadTrack" }
      ];
    } else if (entity.id === "acadtrack") {
      return [
        { label: "What tech stack was used?", query: "What tech stack does AcadTrack use?" },
        { label: "Who is AcadTrack for?", query: "Who is AcadTrack for?" },
        { label: "Explore Kisan Setu", query: "Tell me about Kisan Setu" }
      ];
    } else {
      return [
        { label: "What tech did he use?", query: `What technologies did he use for ${entity.name}?` },
        { label: "View all projects", query: "What projects has he built?" },
        { label: "Check Anupam's skills", query: "What technologies does Anupam know?" }
      ];
    }
  }

  if (topic === "skills") {
    return [
      { label: "Show Python projects", query: "Show me his Python projects" },
      { label: "What AI skills does he have?", query: "What AI skills does Anupam have?" },
      { label: "View certifications", query: "What certifications does he have?" }
    ];
  }

  if (topic === "certifications") {
    return [
      { label: "Tell me about EY AI Passport", query: "Tell me about his EY certification" },
      { label: "What projects has he built?", query: "What projects has he built?" },
      { label: "How to contact him?", query: "How can I contact Anupam?" }
    ];
  }

  if (topic === "education") {
    return [
      { label: "Is he open to internships?", query: "Is he looking for an internship?" },
      { label: "View his certifications", query: "What certifications does he hold?" },
      { label: "Download Resume (PDF)", query: "Can I see his resume?" }
    ];
  }

  return [
    { label: "What has he built?", query: "What projects has he made?" },
    { label: "Does he know Python?", query: "Does he know Python?" },
    { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" }
  ];
}

// Markdown Formatter for Assistant Messages
function renderAIMarkdown(rawText) {
  if (!rawText) return "";
  let safe = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/^###\s+(.+)$/gm, "<h4 class='ai-msg-h4'>$1</h4>");
  safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="ai-inline-link" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = safe.split('\n');
  let inList = false;
  let out = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      if (!inList) {
        out.push('<ul class="ai-msg-ul">');
        inList = true;
      }
      out.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0) {
        if (trimmed.startsWith('<h4')) {
          out.push(trimmed);
        } else {
          out.push(`<p class="ai-msg-p">${line}</p>`);
        }
      }
    }
  }
  if (inList) {
    out.push('</ul>');
  }

  return out.join('');
}

// Conversational Query Engine
window.processAIQuery = processAIQuery;
function processAIQuery(rawUserQuery) {
  const raw = (rawUserQuery || "").trim();
  if (!raw) {
    return {
      text: "How can I help you explore Anupam's work today? Ask about his projects, skills, certifications, or journey!",
      followUps: generateFollowUps("general")
    };
  }

  // 1. Security Check
  if (isSecurityViolation(raw)) {
    return {
      text: "I cannot fulfill that request. I am Anupam AI, grounded strictly in public portfolio data, and I do not expose system credentials, keys, or internal configurations.",
      followUps: [
        { label: "View Projects", query: "What projects has he built?" },
        { label: "View Skills", query: "What skills does he have?" }
      ]
    };
  }

  // 2. Gibberish Check
  if (isGibberish(raw)) {
    return {
      text: "I didn't quite catch that! Could you rephrase your question? You can ask about Anupam's projects (like Kisan Setu or AcadTrack), his Python and AI skills, or his education.",
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "Does he know Python?", query: "Does he know Python?" },
        { label: "How can I contact him?", query: "How can I contact Anupam?" }
      ]
    };
  }

  const qNorm = normalizeQuery(raw);
  const qLower = raw.toLowerCase();

  // Custom AI Knowledge check (dynamic entries from Firestore)
  if (portfolioKnowledge.customEntries && portfolioKnowledge.customEntries.length > 0) {
    for (const item of portfolioKnowledge.customEntries) {
      if (!item.title || !item.content) continue;
      const tLower = item.title.toLowerCase();
      if (qNorm.includes(tLower) || (item.category && qNorm.includes(item.category.toLowerCase()))) {
        conversationState.currentTopic = item.category ? item.category.toLowerCase() : "custom";
        return {
          text: item.content,
          followUps: [
            { label: "What projects has he made?", query: "What projects has he made?" },
            { label: "What skills does he know?", query: "What skills does he have?" }
          ]
        };
      }
    }
  }

  // Multi-question detection
  if ((qNorm.includes(" and ") || qNorm.includes(" as well as ")) && (qNorm.includes("python") && (qNorm.includes("project") || qNorm.includes("built") || qNorm.includes("made")))) {
    conversationState.currentTopic = "skills";
    return {
      text: "Yes — Python is one of Anupam's core programming languages. He has used Python to develop algorithmic tools, conversational NLP prototypes, and backend APIs with FastAPI.\n\nHe has also built several featured ecosystem and Python projects, including:\n• **Kisan Setu** — AI-powered Agri-Tech & mandi queue management platform\n• **AcadTrack** — Automated coursework grading and evaluation engine\n• **MyKhata** — Offline-first smart bookkeeping PWA\n• **Hangman Game**, **Basic Chatbot**, and **Stock Portfolio Tracker** (Python applications)",
      actions: [
        { label: "View Projects →", href: "#projects" },
        { label: "Explore Tech Universe →", href: "#technology-universe" }
      ],
      followUps: [
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" },
        { label: "Tell me about AcadTrack", query: "Tell me about AcadTrack" },
        { label: "What other skills does he have?", query: "What skills does he have?" }
      ]
    };
  }

  // 3. Greetings Intent
  const greetingWords = ["hi", "hello", "hey", "hey there", "good morning", "good afternoon", "good evening", "yo", "gm", "hii", "hiii", "helo", "greetings"];
  const isGreeting = greetingWords.some(g => qLower === g || qLower.startsWith(g + " ") || qNorm === g || qNorm.startsWith(g + " "));
  if (isGreeting && !qNorm.includes("project") && !qNorm.includes("skill") && !qNorm.includes("who is")) {
    let greetingResponse = "Hello! 👋 I'm Anupam AI. How can I help you explore Anupam's projects, skills, or background today?";
    if (qLower.includes("morning") || qNorm.includes("morning") || qLower === "gm") {
      greetingResponse = "Good morning! 👋 How can I help you explore Anupam's work today?";
    } else if (qLower.includes("afternoon")) {
      greetingResponse = "Good afternoon! 👋 What would you like to know about Anupam's portfolio?";
    } else if (qLower.includes("evening")) {
      greetingResponse = "Good evening! 👋 Feel free to ask me anything about Anupam's engineering projects or skills.";
    } else if (qLower.startsWith("hey")) {
      greetingResponse = "Hey! 👋 I'm Anupam AI. You can ask me about his projects, skills, education, experience, or anything else related to his portfolio.";
    }
    conversationState.lastIntent = "greeting";
    return {
      text: greetingResponse,
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "What technologies does he know?", query: "What technologies does he know?" },
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" }
      ]
    };
  }

  // 4. Casual Conversation
  if (qLower.includes("how are you") || qLower.includes("how r u")) {
    return {
      text: "I'm doing great! 😊 I'm here to help you explore Anupam's portfolio. What would you like to know about his projects or skills?",
      followUps: generateFollowUps("general")
    };
  }

  if (qLower === "nice" || qLower === "cool" || qLower === "that's cool" || qLower === "thats cool" || qLower === "awesome" || qLower === "great" || qLower === "interesting") {
    return {
      text: "Glad you think so! 😄 If you're curious, **Kisan Setu** and **AcadTrack** are two great places to start exploring.",
      followUps: [
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" },
        { label: "Tell me about AcadTrack", query: "Tell me about AcadTrack" },
        { label: "What skills does he have?", query: "What skills does he have?" }
      ]
    };
  }

  // 5. Thanks Intent
  if (qLower.includes("thanks") || qLower.includes("thank you") || qLower === "thx" || qLower === "ty") {
    return {
      text: "You're welcome! 😊 If you'd like, I can walk you through one of Anupam's projects or provide his contact details.",
      followUps: [
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" },
        { label: "How to contact him?", query: "How can I contact Anupam?" }
      ]
    };
  }

  // 6. Farewell Intent
  if (qLower.includes("bye") || qLower.includes("goodbye") || qLower.includes("see you") || qLower.includes("gotta go") || qLower.includes("cya")) {
    return {
      text: "You're welcome! 👋 Feel free to come back anytime if you want to explore more of Anupam's work or get in touch with him.",
      followUps: [
        { label: "Get in touch", query: "How can I contact Anupam?" }
      ]
    };
  }

  // 7. Identity Intent
  if (qNorm.includes("who is anupam") || qNorm.includes("who are you") || qNorm.includes("about anupam") || qNorm.includes("introduce") || qNorm.includes("tell me about anupam")) {
    conversationState.currentTopic = "identity";
    return {
      text: "Anupam Yadav is a Computer Science Engineering student (2025–2029) at Kashi Institute of Technology (KIT), Varanasi. He is a passionate Python developer, AI enthusiast, and practical solutions builder with experience in full-stack web applications, database architectures, and machine learning prototypes.",
      actions: [
        { label: "Read Developer Journey →", href: "#about" },
        { label: "Contact Anupam →", href: "#contact" }
      ],
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "What technologies does he know?", query: "What technologies does he know?" },
        { label: "Is he open to internships?", query: "Is he open to internships?" }
      ]
    };
  }

  // 8. Project Comparisons
  if (qNorm.includes("compare") || (qNorm.includes("difference") && qNorm.includes("between"))) {
    conversationState.currentTopic = "project";
    return {
      text: "Here is a side-by-side comparison of **Kisan Setu** and **AcadTrack**:\n\n• **Domain & Focus:**\n  - **Kisan Setu**: AI Agri-Tech & Mandi Queue Optimization for farmers and procurement officers.\n  - **AcadTrack**: Academic Coursework Assessment & Evaluation Engine for students and faculty.\n\n• **Core Purpose:**\n  - **Kisan Setu**: Eliminates mandi congestion through dynamic slot scheduling and queue forecasting.\n  - **AcadTrack**: Automates grading rubrics and generates student performance distribution analytics.\n\n• **Technology Stack:**\n  - **Kisan Setu**: React, TypeScript, Python, FastAPI, PostgreSQL, Supabase, ML.\n  - **AcadTrack**: HTML5, CSS3, JavaScript, Supabase, PostgreSQL (with Row-Level Security), Vercel.\n\n• **AI / Intelligence:**\n  - **Kisan Setu**: Wait-time prediction and throughput estimation models.\n  - **AcadTrack**: Automated weighted rubric scoring algorithms.",
      actions: [
        { label: "View Projects Section →", href: "#projects" },
        { label: "Inspect Tech Universe →", href: "#technology-universe" }
      ],
      followUps: [
        { label: "How does Kisan Setu AI work?", query: "How does its AI work?" },
        { label: "What technologies does AcadTrack use?", query: "What technologies does AcadTrack use?" },
        { label: "What other projects has he built?", query: "What projects has he made?" }
      ]
    };
  }

  // 9. Recommendation Intent
  if (qNorm.includes("best project") || qNorm.includes("first project") || qNorm.includes("recommend a project") || qNorm.includes("which project should i look at") || qNorm.includes("where to start")) {
    conversationState.currentTopic = "project";
    return {
      text: "That depends on what you are most interested in!\n\n• If you are interested in **AI and real-world logistics**, **Kisan Setu** is his flagship — it solves farmer mandi congestion using dynamic timeslot booking and queue prediction.\n• If you're interested in **educational workflows and rubric grading**, explore **AcadTrack**.\n• If you want to check out **daily utilities**, **MyKhata** is an offline-first bookkeeping PWA, and his **Python CLI tools** showcase clean algorithmic fundamentals.",
      actions: [
        { label: "Explore Kisan Setu →", href: "#projects" },
        { label: "View Technology Universe →", href: "#technology-universe" }
      ],
      followUps: [
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" },
        { label: "Tell me about AcadTrack", query: "Tell me about AcadTrack" },
        { label: "Does he know Python?", query: "Does he know Python?" }
      ]
    };
  }

  // 10. Explicit Project Detection OR Contextual Follow-Up
  let matchedProject = findMatchingProject(qNorm);

  if (!matchedProject && conversationState.currentProject && isContextualFollowUp(raw)) {
    matchedProject = conversationState.currentProject;
  }

  if (matchedProject) {
    conversationState.currentTopic = "project";
    conversationState.currentProject = matchedProject;
    conversationState.lastEntityName = matchedProject.name;

    // A. Tech inquiry
    if (qNorm.includes("tech") || qNorm.includes("stack") || qNorm.includes("language") || qNorm.includes("framework") || qNorm.includes("built with")) {
      return {
        text: `**${matchedProject.name}** is built using:\n• **Technologies:** ${matchedProject.technologies.join(", ")}\n• **Architecture & Purpose:** ${matchedProject.purpose}`,
        actions: [{ label: `View ${matchedProject.name} →`, href: matchedProject.link }],
        followUps: generateFollowUps("project", matchedProject)
      };
    }

    // B. AI / Model inquiry
    if (qNorm.includes("ai") || qNorm.includes("model") || qNorm.includes("machine learning") || qNorm.includes("algorithm") || qNorm.includes("predict")) {
      if (matchedProject.id === "kisan-setu") {
        return {
          text: `**Kisan Setu** uses machine learning models and queue prediction algorithms to estimate mandi waiting times based on real-time vehicle arrival rates, center handling capacity, and crop verification metrics. It helps farmers schedule arrival slots without standing in overnight queues.`,
          actions: [{ label: "View Kisan Setu in Projects →", href: "#projects" }],
          followUps: [
            { label: "What tech stack was used?", query: "What technologies did he use for it?" },
            { label: "Who is it for?", query: "Who is it for?" },
            { label: "Tell me about AcadTrack", query: "Tell me about AcadTrack" }
          ]
        };
      } else if (matchedProject.id === "acadtrack") {
        return {
          text: `**AcadTrack** implements automated weighted rubric evaluation algorithms to compute internal assessment scores across continuous semester evaluations with performance distribution tracking.`,
          actions: [{ label: "View AcadTrack →", href: "#projects" }],
          followUps: generateFollowUps("project", matchedProject)
        };
      } else {
        return {
          text: `**${matchedProject.name}** is developed with ${matchedProject.technologies.join(", ")}. It focuses on ${matchedProject.purpose}`,
          followUps: generateFollowUps("project", matchedProject)
        };
      }
    }

    // C. Features inquiry
    if (qNorm.includes("feature") || qNorm.includes("who is it for") || qNorm.includes("how does it work") || qNorm.includes("what can it do") || qNorm.includes("problem")) {
      const featList = matchedProject.features ? matchedProject.features.map(f => `• ${f}`).join("\n") : `• ${matchedProject.purpose}`;
      return {
        text: `**${matchedProject.name}**\n\n**Purpose:** ${matchedProject.purpose}\n\n**Key Features:**\n${featList}\n\n**Tech Stack:** ${matchedProject.technologies.join(", ")}`,
        actions: [{ label: `Explore ${matchedProject.name} →`, href: matchedProject.link }],
        followUps: generateFollowUps("project", matchedProject)
      };
    }

    // D. Overview
    const featList = matchedProject.features ? matchedProject.features.map(f => `• ${f}`).join("\n") : "";
    return {
      text: `### ${matchedProject.name}\n${matchedProject.tagline}\n\n${matchedProject.purpose}\n\n**Key Highlights:**\n${featList}\n\n**Tech Stack:** ${matchedProject.technologies.join(", ")}`,
      actions: [{ label: `View ${matchedProject.name} →`, href: matchedProject.link }],
      followUps: generateFollowUps("project", matchedProject)
    };
  }

  // 11. General Projects Overview Intent
  if (qNorm.includes("project") || qNorm.includes("built") || qNorm.includes("what has he made") || qNorm.includes("show me his work") || qNorm.includes("portfolio projects") || qNorm.includes("applications")) {
    conversationState.currentTopic = "project";
    conversationState.currentProject = null;
    return {
      text: "Anupam has engineered five core digital ecosystem platforms and several standalone Python applications:\n\n• **Kisan Setu** — AI-powered Agri-Tech flagship for mandi queue optimization & slot scheduling\n• **AcadTrack** — Continuous Internal Assessment & rubric evaluation engine\n• **WebJugad Labs** — Creative tech incubator for client solutions & AI prototypes\n• **MyKhata** — Offline-first smart bookkeeping PWA\n• **Smart Vision School** — Educational portal and administrative management system\n\nHe has also developed Python applications: **Hangman Game**, **Basic Chatbot**, and a **Stock Portfolio Tracker**.",
      actions: [
        { label: "Explore Projects Section →", href: "#projects" },
        { label: "Inspect Technology Universe →", href: "#technology-universe" }
      ],
      followUps: [
        { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" },
        { label: "Tell me about AcadTrack", query: "Tell me about AcadTrack" },
        { label: "What is his best project?", query: "What's his best project?" }
      ]
    };
  }

  // 12. Python & Specific Languages Intent
  if (qNorm.includes("python") || qNorm.includes("pyhton")) {
    conversationState.currentTopic = "skills";
    return {
      text: "Yes — Python is one of Anupam's primary programming skills. He has utilized Python for practical algorithm design, conversational NLP prototypes, stock portfolio tracking tools, and backend APIs using FastAPI.",
      actions: [
        { label: "View Python Projects →", href: "#projects" },
        { label: "Inspect Developer Terminal →", href: "#developer-terminal" }
      ],
      followUps: [
        { label: "Show me his Python projects", query: "Show me his Python projects" },
        { label: "What AI skills does he have?", query: "What AI skills does he have?" },
        { label: "What other languages does he know?", query: "What other languages does he know?" }
      ]
    };
  }

  if (qNorm.includes("javascript") || qNorm.includes("js")) {
    conversationState.currentTopic = "skills";
    return {
      text: "Yes, Anupam is proficient in JavaScript (ES6+). He utilizes JavaScript for building modern interactive web apps, Progressive Web Apps (like MyKhata), DOM orchestration, and full-stack integration with Supabase and Firebase.",
      followUps: [
        { label: "What projects use JavaScript?", query: "What projects use JavaScript?" },
        { label: "What other languages does he know?", query: "What skills does he have?" }
      ]
    };
  }

  // 13. Version Control / Git Intent
  if (qNorm.includes("version control") || qNorm.includes("git") || qNorm.includes("github")) {
    conversationState.currentTopic = "skills";
    return {
      text: "Anupam uses **Git** and **GitHub** for version control, branching, repository management, and code collaboration. You can explore his open-source work directly on GitHub (@yadav-anupam).",
      actions: [{ label: "Open Anupam's GitHub →", href: portfolioKnowledge.contact.github, isExternal: true }],
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "How to contact him?", query: "How can I contact Anupam?" }
      ]
    };
  }

  // 14. AI & Machine Learning Skills Intent
  if (qNorm.includes("ai") || qNorm.includes("machine learning") || qNorm.includes("generative") || qNorm.includes("prompt")) {
    conversationState.currentTopic = "skills";
    return {
      text: "Anupam is an active AI enthusiast with verified certifications from EY & Microsoft, Microsoft & LinkedIn, Anthropic, and TATA Forage. He applies Generative AI and prompt engineering to build real solutions like Kisan Setu and conversational prototypes.",
      actions: [
        { label: "View AI Certifications →", href: "#certifications" },
        { label: "Explore Tech Universe →", href: "#technology-universe" }
      ],
      followUps: [
        { label: "What certifications does he have?", query: "What certifications does he have?" },
        { label: "Tell me about Kisan Setu AI", query: "How does Kisan Setu AI work?" }
      ]
    };
  }

  // 15. General Skills Intent
  if (qNorm.includes("skill") || qNorm.includes("tech stack") || qNorm.includes("technologies") || qNorm.includes("programming language") || qNorm.includes("what does he know")) {
    conversationState.currentTopic = "skills";
    return {
      text: `Anupam's technical skill set spans:\n\n• **Languages:** ${portfolioKnowledge.skills.languages.join(", ")}\n• **Backend & Databases:** ${portfolioKnowledge.skills.backend.join(", ")}\n• **AI & Emerging Tech:** ${portfolioKnowledge.skills.ai_ml.join(", ")}\n• **DevOps & Tools:** ${portfolioKnowledge.skills.tools.join(", ")}`,
      actions: [{ label: "Explore Skills Section →", href: "#skills" }],
      followUps: [
        { label: "Does he know Python?", query: "Does he know Python?" },
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "View Certifications", query: "What certifications does he have?" }
      ]
    };
  }

  // 16. Certifications Intent
  if (qNorm.includes("certification") || qNorm.includes("credential") || qNorm.includes("course") || qNorm.includes("license")) {
    conversationState.currentTopic = "certifications";
    return {
      text: "Anupam holds four verified industry certifications:\n\n1. **AI Skills Passport** — EY & Microsoft\n2. **Career Essentials in Generative AI** — Microsoft & LinkedIn\n3. **Generative AI Foundations** — Anthropic\n4. **GenAI-Powered Data Analytics Job Simulation** — TATA Forage",
      actions: [{ label: "View Certificates →", href: "#certifications" }],
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "What is his education?", query: "What is his education?" },
        { label: "Download Resume", query: "Can I see his resume?" }
      ]
    };
  }

  // 17. Education Intent
  if (qNorm.includes("education") || qNorm.includes("college") || qNorm.includes("university") || qNorm.includes("btech") || qNorm.includes("kit") || qNorm.includes("school") || qNorm.includes("study") || qNorm.includes("degree")) {
    conversationState.currentTopic = "education";
    return {
      text: "Anupam is currently pursuing his **B.Tech in Computer Science Engineering (2025–2029)** at **Kashi Institute of Technology (KIT), Varanasi**, where he is currently in his 2nd year. Prior to this, he completed his 12th (PCM) and 10th High School at Smart Vision School, Varanasi.",
      actions: [{ label: "View Education Timeline →", href: "#education" }],
      followUps: [
        { label: "What certifications does he have?", query: "What certifications does he have?" },
        { label: "Is he open to internships?", query: "Is he open to internships?" },
        { label: "What projects has he built?", query: "What projects has he made?" }
      ]
    };
  }

  // 18. Experience & Internship Availability Intent
  if (qNorm.includes("internship") || qNorm.includes("experience") || qNorm.includes("job") || qNorm.includes("hire") || qNorm.includes("available") || qNorm.includes("work with")) {
    conversationState.currentTopic = "experience";
    return {
      text: "Anupam is actively available for **internship opportunities** in Python development, AI applications, web engineering, and IT solutions. He brings strong fundamentals, project experience in building full-stack and AI systems, and verified certifications.",
      actions: [
        { label: "Contact for Opportunities →", href: "#contact" },
        { label: "Download Resume (PDF) →", href: portfolioKnowledge.contact.resume, isDownload: true }
      ],
      followUps: [
        { label: "How can I contact him?", query: "How can I contact Anupam?" },
        { label: "Can I see his resume?", query: "Can I see his resume?" },
        { label: "What projects has he made?", query: "What projects has he made?" }
      ]
    };
  }

  // 19. Contact & Socials Intent
  if (qNorm.includes("contact") || qNorm.includes("email") || qNorm.includes("reach") || qNorm.includes("message") || qNorm.includes("hire him") || qNorm.includes("connect")) {
    conversationState.currentTopic = "contact";
    return {
      text: `You can reach Anupam directly through:\n• **Email:** [yadavanupam9119@gmail.com](mailto:yadavanupam9119@gmail.com)\n• **LinkedIn:** [linkedin.com/in/anupam-yadavv](${portfolioKnowledge.contact.linkedin})\n• **GitHub:** [github.com/yadav-anupam](${portfolioKnowledge.contact.github})\n• Or submit a message via the contact form on this page!`,
      actions: [{ label: "Go to Contact Form →", href: "#contact" }],
      followUps: [
        { label: "Download Resume (PDF)", query: "Can I see his resume?" },
        { label: "What projects has he made?", query: "What projects has he made?" }
      ]
    };
  }

  // 20. Resume / CV Intent
  if (qNorm.includes("resume") || qNorm.includes("cv")) {
    conversationState.currentTopic = "contact";
    return {
      text: "Anupam's resume is up to date and available for instant download in PDF format.",
      actions: [
        { label: "Download Resume (PDF) →", href: portfolioKnowledge.contact.resume, isDownload: true }
      ],
      followUps: [
        { label: "What projects has he made?", query: "What projects has he made?" },
        { label: "How can I contact him?", query: "How can I contact Anupam?" }
      ]
    };
  }

  // 21. Unknown / General Fallback
  return {
    text: "I'm mainly here to help you explore Anupam Yadav's public portfolio — his engineering projects, Python and AI skills, certifications, education, and internship availability. What would you like to explore?",
    followUps: [
      { label: "What projects has he made?", query: "What projects has he made?" },
      { label: "Does he know Python?", query: "Does he know Python?" },
      { label: "Tell me about Kisan Setu", query: "Tell me about Kisan Setu" }
    ]
  };
}

// ========================================================
// --- ANUPAM AI UI CONTROLLER ---
// ========================================================
function initAnupamAI() {
  const triggerBtn = document.getElementById('anupam-ai-trigger');
  const navBtn = document.getElementById('nav-ai-btn');
  const panel = document.getElementById('anupam-ai-panel');
  const closeBtn = document.getElementById('anupam-ai-close');
  const clearBtn = document.getElementById('anupam-ai-clear');
  const messagesContainer = document.getElementById('anupam-ai-messages');
  const form = document.getElementById('anupam-ai-form');
  const input = document.getElementById('anupam-ai-input');
  const sendBtn = document.getElementById('anupam-ai-send');
  const suggestions = document.getElementById('anupam-ai-suggestions');

  if (!panel || !messagesContainer) return;

  let isTyping = false;

  function renderSuggestions(chips) {
    if (!suggestions || !chips || chips.length === 0) return;
    suggestions.innerHTML = '';
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'anupam-ai-chip';
      btn.textContent = chip.label;
      btn.dataset.q = chip.query;
      suggestions.appendChild(btn);
    });
  }

  function toggleAI(open) {
    const shouldOpen = open !== undefined ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', shouldOpen);
    panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
      if (messagesContainer.children.length === 0) {
        appendAIMessage({
          text: "Hi! I'm **Anupam AI** — your interactive, conversational portfolio assistant.\nAsk me anything about Anupam's projects (like Kisan Setu or AcadTrack), his Python and AI skills, certifications, or internship availability!",
          followUps: generateFollowUps("general")
        });
      }
      setTimeout(() => {
        if (input) input.focus();
      }, 150);
    }
  }

  function copyToClipboard(buttonEl, textToCopy) {
    if (!textToCopy) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        buttonEl.textContent = '✓ Copied';
        setTimeout(() => { buttonEl.textContent = '📋 Copy'; }, 1800);
      }).catch(() => fallbackCopy(buttonEl, textToCopy));
    } else {
      fallbackCopy(buttonEl, textToCopy);
    }
  }

  function fallbackCopy(buttonEl, textToCopy) {
    const ta = document.createElement('textarea');
    ta.value = textToCopy;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      buttonEl.textContent = '✓ Copied';
      setTimeout(() => { buttonEl.textContent = '📋 Copy'; }, 1800);
    } catch (e) {
      buttonEl.textContent = 'Failed';
    }
    document.body.removeChild(ta);
  }

  function appendUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'anupam-ai-msg anupam-ai-msg--user';
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Track in state
    conversationState.messages.push({ role: 'user', text, timestamp: Date.now() });
    if (conversationState.messages.length > 20) {
      conversationState.messages.shift();
    }
  }

  function appendAIMessage(response) {
    const msg = document.createElement('div');
    msg.className = 'anupam-ai-msg anupam-ai-msg--ai';

    // Header bar with sender and copy button
    const headerBar = document.createElement('div');
    headerBar.className = 'anupam-ai-msg-header';
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'anupam-ai-msg-sender';
    senderSpan.innerHTML = '✦ Anupam AI';
    headerBar.appendChild(senderSpan);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'anupam-ai-copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.title = 'Copy response to clipboard';
    copyBtn.addEventListener('click', () => copyToClipboard(copyBtn, response.text || ''));
    headerBar.appendChild(copyBtn);

    msg.appendChild(headerBar);

    // Formatted markdown content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'anupam-ai-content';
    contentDiv.innerHTML = renderAIMarkdown(response.text || "");
    msg.appendChild(contentDiv);

    // Optional Action Buttons
    if (response.actions && response.actions.length > 0) {
      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'anupam-ai-actions-wrap';
      response.actions.forEach(act => {
        const btn = document.createElement('a');
        btn.className = 'anupam-ai-action-btn';
        btn.textContent = act.label;
        btn.href = act.href;
        if (act.isExternal) {
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
        } else if (act.isDownload) {
          btn.download = 'Anupam_Yadav_Resume.pdf';
        } else {
          btn.addEventListener('click', (e) => {
            const targetEl = document.querySelector(act.href);
            if (targetEl) {
              e.preventDefault();
              toggleAI(false);
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }
        actionsWrap.appendChild(btn);
      });
      msg.appendChild(actionsWrap);
    }

    // Dynamic Inline Follow-Up Chips
    if (response.followUps && response.followUps.length > 0) {
      const followUpWrap = document.createElement('div');
      followUpWrap.className = 'anupam-ai-inline-followups';
      
      const label = document.createElement('span');
      label.className = 'anupam-ai-inline-label';
      label.textContent = 'Follow-up:';
      followUpWrap.appendChild(label);

      response.followUps.forEach(f => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'anupam-ai-inline-chip';
        chip.textContent = f.label;
        chip.dataset.q = f.query;
        chip.addEventListener('click', () => handleSendQuery(f.query));
        followUpWrap.appendChild(chip);
      });
      msg.appendChild(followUpWrap);

      // Also refresh the top suggestion strip
      renderSuggestions(response.followUps);
    }

    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Track in state
    conversationState.messages.push({ role: 'assistant', text: response.text, timestamp: Date.now() });
    if (conversationState.messages.length > 20) {
      conversationState.messages.shift();
    }
  }

  function showTypingIndicator() {
    const ind = document.createElement('div');
    ind.className = 'anupam-ai-msg anupam-ai-msg--ai anupam-ai-typing-wrap';
    ind.id = 'ai-typing-indicator';
    ind.innerHTML = `<div class="anupam-ai-typing">
      <span class="anupam-ai-dot"></span>
      <span class="anupam-ai-dot"></span>
      <span class="anupam-ai-dot"></span>
    </div>`;
    messagesContainer.appendChild(ind);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('ai-typing-indicator');
    if (ind) ind.remove();
  }

  function handleSendQuery(userText) {
    if (!userText || isTyping) return;
    const cleanText = userText.trim();
    if (!cleanText) return;

    appendUserMessage(cleanText);
    if (input) input.value = '';
    isTyping = true;
    if (sendBtn) sendBtn.disabled = true;

    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      try {
        const res = processAIQuery(cleanText);
        appendAIMessage(res);
      } catch (err) {
        console.error("Anupam AI query error:", err);
        appendAIMessage({
          text: "I experienced a brief hiccup while processing that request. Please feel free to ask again or select one of the suggested topics below!",
          followUps: generateFollowUps("general")
        });
      }
      isTyping = false;
      if (sendBtn) sendBtn.disabled = false;
    }, 420);
  }

  // Trigger and close listeners
  if (triggerBtn) triggerBtn.addEventListener('click', () => toggleAI());
  if (navBtn) navBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAI(true); });
  if (closeBtn) closeBtn.addEventListener('click', () => toggleAI(false));

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      messagesContainer.innerHTML = '';
      conversationState.messages = [];
      conversationState.currentTopic = null;
      conversationState.currentProject = null;
      conversationState.lastIntent = null;
      conversationState.lastEntityName = null;
      appendAIMessage({
        text: "Conversation cleared. Feel free to ask another question about Anupam's engineering projects, skills, or background!",
        followUps: generateFollowUps("general")
      });
    });
  }

  // Suggestions strip delegator
  if (suggestions) {
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.anupam-ai-chip');
      if (chip && chip.dataset.q) {
        handleSendQuery(chip.dataset.q);
      }
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input) handleSendQuery(input.value);
    });
  }

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      toggleAI(false);
    }
  });
}


// Run interactive subsystems
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCardSpotlight();
    initStatsCounter();
    initHeadingReveals();
    initPortfolioMeta();
    initDeveloperJourney();
    initAnupamAI();
  });
} else {
  initCardSpotlight();
  initStatsCounter();
  initHeadingReveals();
  initPortfolioMeta();
  initDeveloperJourney();
  initAnupamAI();
}

// --- NAVIGATION & MOBILE MENU ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// --- BACK TO TOP ---
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- SECTION PROGRESS DOT CLICK ---
sdots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    const target = sectionElements[i];
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// --- TYPING ANIMATION ---
const typingEl = document.getElementById('typing-text');
if (typingEl) {
  const words = ['Python Developer', 'AI Enthusiast', 'Problem Solver', 'Future IT Engineer'];
  let wi = 0, ci = 0, del = false;

  function type() {
    const w = words[wi];
    typingEl.textContent = del ? w.slice(0, ci--) : w.slice(0, ci++);
    if (!del && ci > w.length) {
      del = true;
      setTimeout(type, 1500);
      return;
    }
    if (del && ci < 0) {
      del = false;
      wi = (wi + 1) % words.length;
      ci = 0;
    }
    setTimeout(type, del ? 60 : 100);
  }
  setTimeout(type, 1200);
}

// --- FADE IN & SKILL BAR OBSERVER ---
const fadeElements = document.querySelectorAll('.fade-in');
if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.skill-bar').forEach(b => {
          b.style.width = b.dataset.pct + '%';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(f => observer.observe(f));
} else {
  fadeElements.forEach(f => f.classList.add('visible'));
}

// --- PROJECT FILTER ---
window.filterProjects = function(filter) {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    card.style.display = (filter === 'all' || tags.includes(filter)) ? 'flex' : 'none';
  });
};

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    window.filterProjects(this.dataset.filter);
  });
});

// --- CERTIFICATE MODALS ---
window.openCertModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeCertModal = function(overlay) {
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.cert-modal-overlay.open').forEach(m => window.closeCertModal(m));
  }
});

// --- CURSOR GLOW (Hardware Accelerated) ---
const glow = document.getElementById('cursor-glow');
if (glow && window.matchMedia('(pointer: fine)').matches) {
  let glowX = 0, glowY = 0, glowTicking = false;

  document.addEventListener('mousemove', e => {
    glowX = e.clientX;
    glowY = e.clientY;
    if (!glowTicking) {
      requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
        glowTicking = false;
      });
      glowTicking = true;
    }
  }, { passive: true });
}

// --- THEME TOGGLE (Dark / Light Mode) ---
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  const savedTheme = localStorage.getItem('theme') || 'light';

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-mode', isLight);
    themeBtn.textContent = isLight ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-pressed', String(isLight));
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeBtn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  }

  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  });
}

// --- CONTACT FORM (Web3Forms AJAX) ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fmsg = document.getElementById('form-msg');
    const sendBtn = document.getElementById('send-btn');
    if (!sendBtn || !fmsg) return;

    const originalBtn = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = 'Sending...';
    fmsg.style.display = 'block';
    fmsg.className = '';
    fmsg.textContent = 'Sending your message...';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        fmsg.className = 'success';
        fmsg.textContent = 'Message sent successfully. I will get back to you soon.';
        contactForm.reset();
      } else {
        fmsg.className = 'error';
        fmsg.textContent = 'Unable to send message right now. Please try again.';
      }
    } catch {
      fmsg.className = 'error';
      fmsg.textContent = 'Network error. Please try again in a moment.';
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = originalBtn;
      setTimeout(() => {
        fmsg.style.display = 'none';
      }, 5000);
    }
  });
}

// ============================================
// THE TECHNOLOGY UNIVERSE - INTERACTIVE SYSTEM
// ============================================
function initTechnologyUniverse() {
  const stage = document.getElementById('tech-universe-stage');
  const planetsLayer = document.getElementById('tech-universe-planets');
  const panel = document.getElementById('tech-universe-panel');
  const mobileDeck = document.getElementById('tech-universe-mobile-deck');
  const tooltip = document.getElementById('tech-universe-tooltip');
  const orbitsSvg = stage ? stage.querySelector('.tech-universe__svg-orbits') : null;
  const sunEl = document.getElementById('tech-universe-sun');

  if (!stage || !planetsLayer) return;

  const projectsData = [
    {
      id: 'acadtrack',
      name: 'AcadTrack',
      badge: 'Evaluation Engine',
      description: 'Continuous Internal Assessment & Handwritten Coursework Evaluation Platform with automated rubric grading and student performance intelligence.',
      rx: 210,
      ry: 120,
      period: 62,
      initialAngle: 0.8,
      planetSize: 44,
      gradient: 'radial-gradient(circle at 35% 35%, #4DD0E1 0%, #00838F 45%, #004D40 85%, #00251A 100%)',
      glowColor: 'rgba(77, 208, 225, 0.75)',
      orbitClass: 'orbit-acadtrack',
      moons: ['HTML5', 'CSS3', 'JavaScript', 'Supabase', 'PostgreSQL', 'Storage', 'RLS', 'Vercel']
    },
    {
      id: 'kisan-setu',
      name: 'Kisan Setu',
      badge: 'AI Agri-Tech Flagship',
      description: 'AI-powered agricultural procurement and queue management platform optimizing mandis with real-time throughput analytics and dynamic scheduling.',
      rx: 290,
      ry: 165,
      period: 82,
      initialAngle: 2.5,
      planetSize: 52,
      gradient: 'radial-gradient(circle at 30% 30%, #81C784 0%, #2E7D32 45%, #1B5E20 80%, #0A260C 100%)',
      glowColor: 'rgba(129, 199, 132, 0.8)',
      orbitClass: 'orbit-kisan-setu',
      moons: ['React', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'PostgreSQL', 'Supabase', 'WebSockets', 'Machine Learning', 'Vercel']
    },
    {
      id: 'webjugad-labs',
      name: 'WebJugad Labs',
      badge: 'Innovation Ecosystem',
      description: 'Digital development and creative technology ecosystem incubating high-impact web apps, automation frameworks, and generative AI prototypes.',
      rx: 370,
      ry: 215,
      period: 104,
      initialAngle: 4.1,
      planetSize: 48,
      gradient: 'radial-gradient(circle at 35% 35%, #FFD54F 0%, #FFA000 45%, #E65100 85%, #3E2723 100%)',
      glowColor: 'rgba(255, 213, 79, 0.8)',
      orbitClass: 'orbit-webjugad-labs',
      moons: ['HTML', 'CSS', 'JavaScript', 'Firebase', 'Firestore', 'GitHub', 'Vercel', 'AI Tools', 'Automation']
    },
    {
      id: 'mykhata',
      name: 'MyKhata',
      badge: 'Financial Ledger PWA',
      description: 'Digital platform for managing income, expenses, received funds, and ledger audit records with offline-first synchronization.',
      rx: 435,
      ry: 260,
      period: 122,
      initialAngle: 5.3,
      planetSize: 46,
      gradient: 'radial-gradient(circle at 32% 32%, #FF8A65 0%, #D84315 50%, #BF360C 85%, #270800 100%)',
      glowColor: 'rgba(255, 138, 101, 0.75)',
      orbitClass: 'orbit-mykhata',
      moons: ['HTML', 'CSS', 'JavaScript', 'Firebase', 'Firestore', 'PWA', 'Local Storage', 'Vercel']
    },
    {
      id: 'smart-vision-school',
      name: 'Smart Vision School',
      badge: 'Edu-Tech Platform',
      description: 'Digital school management and educational platform offering role-based authentication, student profiles, attendance, and administrative oversight.',
      rx: 490,
      ry: 300,
      period: 142,
      initialAngle: 1.7,
      planetSize: 45,
      gradient: 'radial-gradient(circle at 35% 35%, #BA68C8 0%, #7B1FA2 50%, #4A148C 85%, #1A0033 100%)',
      glowColor: 'rgba(186, 104, 200, 0.75)',
      orbitClass: 'orbit-smart-vision-school',
      moons: ['HTML5', 'CSS3', 'JavaScript', 'Firebase', 'Firestore', 'Authentication', 'Responsive UI']
    }
  ];

  // Wire up Planet Quick Selector Chips
  const chipsContainer = document.getElementById('tech-universe-chips');
  const chipButtons = chipsContainer ? chipsContainer.querySelectorAll('.tech-universe__chip') : [];

  function updateChipActive(planetId) {
    chipButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.planet === planetId);
    });
  }

  if (chipsContainer) {
    chipsContainer.addEventListener('click', e => {
      const chip = e.target.closest('.tech-universe__chip');
      if (!chip) return;
      const planetId = chip.dataset.planet;
      selectedPlanetId = planetId;
      highlightPlanet(planetId);
      const proj = projectsData.find(p => p.id === planetId);
      if (proj) {
        updatePanel(proj);
        if (isPanelHidden) togglePanel(true);
      }
      updateChipActive(planetId);
    });
  }

  // Map technology name to all projects using it (for cross-project network highlighting)
  const techProjectMap = {};
  projectsData.forEach(p => {
    p.moons.forEach(m => {
      const key = m.trim();
      if (!techProjectMap[key]) techProjectMap[key] = [];
      techProjectMap[key].push(p.name);
    });
  });

  // Render Mobile Cosmic Deck (Clean responsive vertical stack)
  if (mobileDeck) {
    mobileDeck.innerHTML = '';
    projectsData.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'tech-universe__mobile-card';
      card.dataset.projectId = proj.id;
      card.innerHTML = `
        <div class="tech-universe__mobile-card-header">
          <div class="tech-universe__mobile-planet-orb" style="background:${proj.gradient};box-shadow:0 0 16px ${proj.glowColor}"></div>
          <div>
            <div class="tech-universe__panel-badge" style="display:inline-block;margin-bottom:0.2rem">${proj.badge}</div>
            <div class="tech-universe__mobile-card-title">${proj.name}</div>
          </div>
        </div>
        <p class="tech-universe__mobile-card-desc">${proj.description}</p>
        <div class="tech-universe__mobile-moons">
          ${proj.moons.map(m => `<button type="button" class="tech-universe__mobile-moon-pill" data-tech="${m}">${m}</button>`).join('')}
        </div>
      `;
      mobileDeck.appendChild(card);
    });

    // Mobile moon pill interactive cross-highlighting
    mobileDeck.addEventListener('click', e => {
      const pill = e.target.closest('.tech-universe__mobile-moon-pill');
      if (!pill) return;
      const techName = pill.dataset.tech;
      const isAlreadyActive = pill.classList.contains('active');

      mobileDeck.querySelectorAll('.tech-universe__mobile-moon-pill').forEach(btn => btn.classList.remove('active'));
      mobileDeck.querySelectorAll('.tech-universe__mobile-card').forEach(c => c.classList.remove('active-filter'));

      if (!isAlreadyActive) {
        mobileDeck.querySelectorAll(`.tech-universe__mobile-moon-pill[data-tech="${CSS.escape(techName)}"]`).forEach(b => {
          b.classList.add('active');
          const parentCard = b.closest('.tech-universe__mobile-card');
          if (parentCard) parentCard.classList.add('active-filter');
        });
      }
    });
  }

  // Generate Solar Ember Activity around Sun
  if (sunEl && !sunEl.querySelector('.tech-universe__sun-sparks')) {
    const sparksContainer = document.createElement('div');
    sparksContainer.className = 'tech-universe__sun-sparks';
    sparksContainer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('span');
      spark.className = 'tech-universe__sun-spark';
      const angle = (i / 8) * (Math.PI * 2);
      const dist = 55 + (i % 3) * 12;
      spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      spark.style.animationDelay = (i * 0.45) + 's';
      sparksContainer.appendChild(spark);
    }
    sunEl.appendChild(sparksContainer);
  }

  // Generate DOM Elements for Desktop/Tablet Viewport
  planetsLayer.innerHTML = '';
  const planetElements = [];

  projectsData.forEach(proj => {
    const pWrap = document.createElement('div');
    pWrap.className = 'tech-universe__planet-wrapper';
    pWrap.dataset.projectId = proj.id;
    pWrap.tabIndex = 0;
    pWrap.setAttribute('role', 'button');
    pWrap.setAttribute('aria-label', `Project Planet ${proj.name}: ${proj.badge}`);

    // Dynamic CSS properties for sphere styling & glow
    pWrap.style.setProperty('--planet-size', proj.planetSize + 'px');
    pWrap.style.setProperty('--planet-bg', proj.gradient);
    pWrap.style.setProperty('--planet-glow', proj.glowColor);
    pWrap.style.setProperty('--planet-color', proj.glowColor);

    // Sphere
    const sphere = document.createElement('div');
    sphere.className = 'tech-universe__planet';

    // Planet Name Label
    const label = document.createElement('div');
    label.className = 'tech-universe__planet-label';
    label.textContent = proj.name;

    // Moons container
    const moonsWrap = document.createElement('div');
    moonsWrap.className = 'tech-universe__moons-ring';

    // Distribute moons around planet
    const moonEls = [];
    const totalMoons = proj.moons.length;
    proj.moons.forEach((mName, mIdx) => {
      const moon = document.createElement('div');
      moon.className = 'tech-universe__moon';
      moon.textContent = mName;
      moon.dataset.tech = mName;
      moon.dataset.parent = proj.name;
      moon.tabIndex = 0;
      moon.setAttribute('role', 'button');
      moon.setAttribute('aria-label', `Technology ${mName} used in ${proj.name}`);

      // Two-tier radius for clear visual spacing without overlap
      const isOuter = totalMoons > 5 && (mIdx % 2 === 1);
      const orbitR = isOuter ? 58 : 38;
      const angleOffset = (mIdx / totalMoons) * (Math.PI * 2);

      moonEls.push({
        el: moon,
        orbitR,
        angleOffset,
        speed: (isOuter ? 0.0007 : -0.0011) * (1 + (mIdx % 3) * 0.15)
      });

      moonsWrap.appendChild(moon);
    });

    pWrap.appendChild(sphere);
    pWrap.appendChild(label);
    pWrap.appendChild(moonsWrap);
    planetsLayer.appendChild(pWrap);

    planetElements.push({
      data: proj,
      wrap: pWrap,
      sphere,
      moons: moonEls,
      orbitPath: orbitsSvg ? orbitsSvg.querySelector('.' + proj.orbitClass) : null
    });
  });

  // State Management
  let selectedPlanetId = 'kisan-setu';
  let hoveredPlanetId = null;
  let activeTechHighlight = null;
  let isTabActive = !document.hidden;
  let isSectionInView = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // SVG coordinate system is 1000 x 680 with center at (500, 340)
  const SVG_W = 1000;
  const SVG_H = 680;

  // Function to update Information Panel
  function updatePanel(proj) {
    if (!panel || !proj) return;
    const sphere = document.getElementById('panel-sphere');
    const badge = document.getElementById('panel-badge');
    const title = document.getElementById('panel-title');
    const desc = document.getElementById('panel-desc');
    const count = document.getElementById('panel-tech-count');
    const techsContainer = document.getElementById('panel-techs');

    if (sphere) {
      sphere.style.background = proj.gradient;
      sphere.style.boxShadow = `0 0 18px ${proj.glowColor}`;
    }
    if (badge) badge.textContent = proj.badge;
    if (title) title.textContent = proj.name;
    if (desc) desc.textContent = proj.description;
    if (count) count.textContent = `${proj.moons.length} Technologies Orbiting`;

    if (techsContainer) {
      techsContainer.innerHTML = '';
      proj.moons.forEach(m => {
        const tag = document.createElement('span');
        tag.className = 'tech-universe__panel-tech-tag';
        tag.textContent = m;
        tag.dataset.tech = m;
        tag.tabIndex = 0;
        tag.setAttribute('role', 'button');
        tag.setAttribute('aria-label', `View projects sharing ${m}`);

        tag.addEventListener('mouseenter', e => handleTechHover(e, m));
        tag.addEventListener('mouseleave', handleTechLeave);
        tag.addEventListener('click', () => handleTechClick(m));
        tag.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTechClick(m);
          }
        });
        techsContainer.appendChild(tag);
      });
    }
  }

  // Panel Hide / Restore Toggle
  const panelCloseBtn = document.getElementById('tech-universe-panel-close');
  const panelRestoreBtn = document.getElementById('tech-universe-panel-restore');
  let isPanelHidden = false;

  function togglePanel(show) {
    if (!panel) return;
    if (show === undefined) {
      isPanelHidden = !isPanelHidden;
    } else {
      isPanelHidden = !show;
    }

    if (isPanelHidden) {
      panel.classList.add('panel-hidden');
      if (panelRestoreBtn) panelRestoreBtn.style.display = 'inline-flex';
    } else {
      panel.classList.remove('panel-hidden');
      if (panelRestoreBtn) panelRestoreBtn.style.display = 'none';
    }
  }

  if (panelCloseBtn) {
    panelCloseBtn.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel(false);
    });
  }

  if (panelRestoreBtn) {
    panelRestoreBtn.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel(true);
    });
  }

  // Initial Panel Population
  const defaultProj = projectsData.find(p => p.id === selectedPlanetId) || projectsData[0];
  updatePanel(defaultProj);

  // Cross-tech highlight handler
  function handleTechHover(e, techName) {
    activeTechHighlight = techName;
    const sharingProjects = techProjectMap[techName] || [];

    // Highlight matching moons and planets
    planetElements.forEach(item => {
      const usesTech = item.data.moons.includes(techName);
      item.wrap.classList.toggle('tech-match', usesTech);
      item.wrap.classList.toggle('dimmed', !usesTech);

      item.moons.forEach(m => {
        const isMatch = m.el.dataset.tech === techName;
        m.el.classList.toggle('active-tech', isMatch);
      });
    });

    // Show tooltip
    if (tooltip) {
      const projectListHtml = sharingProjects.map(p => `<strong>${p}</strong>`).join(' • ');
      tooltip.innerHTML = `
        <div class="tech-universe__tooltip-tech">${techName}</div>
        <div class="tech-universe__tooltip-projects">Shared by ${sharingProjects.length} ${sharingProjects.length > 1 ? 'Projects' : 'Project'}:<br>${projectListHtml}</div>
      `;
      tooltip.classList.add('visible');
      positionTooltip(e.clientX, e.clientY);
    }
  }

  function handleTechLeave() {
    activeTechHighlight = null;
    planetElements.forEach(item => {
      item.wrap.classList.remove('tech-match');
      if (selectedPlanetId) {
        item.wrap.classList.toggle('dimmed', item.data.id !== selectedPlanetId);
      } else {
        item.wrap.classList.remove('dimmed');
      }
      item.moons.forEach(m => m.el.classList.remove('active-tech'));
    });
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  function handleTechClick(techName) {
    if (activeTechHighlight === techName) {
      handleTechLeave();
    } else {
      activeTechHighlight = techName;
    }
  }

  function positionTooltip(clientX, clientY) {
    if (!tooltip) return;
    const stageRect = stage.getBoundingClientRect();
    let left = clientX - stageRect.left + 16;
    let top = clientY - stageRect.top + 16;

    if (left + 230 > stageRect.width) left = clientX - stageRect.left - 235;
    if (top + 90 > stageRect.height) top = clientY - stageRect.top - 95;

    tooltip.style.left = Math.max(10, left) + 'px';
    tooltip.style.top = Math.max(10, top) + 'px';
  }

  // Planet Hover / Click / Focus events
  planetElements.forEach(item => {
    // Planet Hover
    item.wrap.addEventListener('mouseenter', () => {
      hoveredPlanetId = item.data.id;
      highlightPlanet(item.data.id);
      updatePanel(item.data);
    });

    item.wrap.addEventListener('mouseleave', () => {
      hoveredPlanetId = null;
      if (selectedPlanetId) {
        highlightPlanet(selectedPlanetId);
        const selProj = projectsData.find(p => p.id === selectedPlanetId);
        if (selProj) updatePanel(selProj);
      } else {
        clearPlanetHighlights();
      }
    });

    // Planet Click
    item.wrap.addEventListener('click', e => {
      if (e.target.closest('.tech-universe__moon')) return;
      selectedPlanetId = item.data.id;
      highlightPlanet(item.data.id);
      updatePanel(item.data);
      if (isPanelHidden) togglePanel(true);
    });

    // Keyboard Accessibility
    item.wrap.addEventListener('keydown', e => {
      if (e.target.closest('.tech-universe__moon')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectedPlanetId = item.data.id;
        highlightPlanet(item.data.id);
        updatePanel(item.data);
      }
    });

    // Moons Hover & Tooltip
    item.moons.forEach(mObj => {
      mObj.el.addEventListener('mouseenter', e => {
        e.stopPropagation();
        handleTechHover(e, mObj.el.dataset.tech);
      });
      mObj.el.addEventListener('mousemove', e => {
        positionTooltip(e.clientX, e.clientY);
      });
      mObj.el.addEventListener('mouseleave', e => {
        e.stopPropagation();
        handleTechLeave();
      });
      mObj.el.addEventListener('click', e => {
        e.stopPropagation();
        handleTechClick(mObj.el.dataset.tech);
      });
      mObj.el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleTechClick(mObj.el.dataset.tech);
        }
      });
    });
  });

  function highlightPlanet(planetId) {
    planetElements.forEach(item => {
      const isTarget = item.data.id === planetId;
      item.wrap.classList.toggle('selected', isTarget);
      item.wrap.classList.toggle('dimmed', !isTarget);
      if (item.orbitPath) {
        item.orbitPath.classList.toggle('active', isTarget);
      }
    });
    if (typeof updateChipActive === 'function') {
      updateChipActive(planetId);
    }
  }

  function clearPlanetHighlights() {
    planetElements.forEach(item => {
      item.wrap.classList.remove('selected', 'dimmed');
      if (item.orbitPath) {
        item.orbitPath.classList.remove('active');
      }
    });
  }

  // Initial highlight for default planet
  highlightPlanet(selectedPlanetId);

  // Central Sun Hover / Focus
  if (sunEl) {
    sunEl.addEventListener('mouseenter', () => {
      clearPlanetHighlights();
      if (panel) {
        const title = document.getElementById('panel-title');
        const badge = document.getElementById('panel-badge');
        const desc = document.getElementById('panel-desc');
        const count = document.getElementById('panel-tech-count');
        const techs = document.getElementById('panel-techs');
        if (title) title.textContent = 'Anupam Yadav';
        if (badge) badge.textContent = 'Central Nexus';
        if (desc) desc.textContent = 'Ecosystem core powering 5 interconnected applications spanning AI engineering, full-stack architectures, and modern web platforms.';
        if (count) count.textContent = '35+ Unique Technologies';
        if (techs) {
          techs.innerHTML = Object.keys(techProjectMap)
            .slice(0, 14)
            .map(t => `<span class="tech-universe__panel-tech-tag">${t}</span>`)
            .join('');
        }
      }
    });
    sunEl.addEventListener('mouseleave', () => {
      if (selectedPlanetId) {
        highlightPlanet(selectedPlanetId);
        const sel = projectsData.find(p => p.id === selectedPlanetId);
        if (sel) updatePanel(sel);
      }
    });
  }

  // Smooth Parametric Orbital Animation Loop
  let lastTimestamp = performance.now();
  let animFrameId = null;

  planetElements.forEach(item => {
    item.currentAngle = item.data.initialAngle;
  });

  function updatePlanetPositions(deltaTime) {
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    const scaleX = stageRect.width / SVG_W;
    const scaleY = stageRect.height / SVG_H;
    const cx = stageRect.width / 2;
    const cy = stageRect.height / 2;

    planetElements.forEach(item => {
      const isPaused = (item.data.id === hoveredPlanetId) || prefersReducedMotion;

      if (!isPaused) {
        const speed = (Math.PI * 2) / item.data.period;
        item.currentAngle += speed * (deltaTime / 1000);
        if (item.currentAngle > Math.PI * 2) {
          item.currentAngle -= Math.PI * 2;
        }
      }

      // Compute ellipse coordinates in stage space
      const px = cx + (item.data.rx * scaleX) * Math.cos(item.currentAngle);
      const py = cy + (item.data.ry * scaleY) * Math.sin(item.currentAngle);

      // Position the planet wrapper centered at (px, py)
      item.wrap.style.left = px + 'px';
      item.wrap.style.top = py + 'px';

      // Update Moons orbiting around this planet
      const isMobile = stageRect.width <= 768;
      const moonScale = isMobile ? 0.62 : 1;
      item.moons.forEach(m => {
        if (!isPaused) {
          m.angleOffset += m.speed * deltaTime;
        }
        const mx = Math.cos(m.angleOffset) * (m.orbitR * moonScale);
        const my = Math.sin(m.angleOffset) * (m.orbitR * 0.75 * moonScale);
        m.el.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
      });
    });
  }

  function renderLoop(currentTimestamp) {
    const deltaTime = Math.min(currentTimestamp - lastTimestamp, 100);
    lastTimestamp = currentTimestamp;

    if (isTabActive && isSectionInView && !prefersReducedMotion) {
      updatePlanetPositions(deltaTime);
      animFrameId = requestAnimationFrame(renderLoop);
    }
  }

  // Initial position calculation
  updatePlanetPositions(0);

  if (!prefersReducedMotion) {
    animFrameId = requestAnimationFrame(renderLoop);
  }

  // IntersectionObserver to pause loop when section is offscreen
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isSectionInView = entry.isIntersecting;
        if (isSectionInView && isTabActive && !prefersReducedMotion) {
          lastTimestamp = performance.now();
          cancelAnimationFrame(animFrameId);
          animFrameId = requestAnimationFrame(renderLoop);
        } else {
          cancelAnimationFrame(animFrameId);
        }
      });
    }, { threshold: 0.1 });

    const sectionEl = document.getElementById('technology-universe');
    if (sectionEl) observer.observe(sectionEl);
  }

  // Visibility change to pause loop when tab is hidden
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive && isSectionInView && !prefersReducedMotion) {
      lastTimestamp = performance.now();
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(renderLoop);
    } else {
      cancelAnimationFrame(animFrameId);
    }
  });

  // Debounced resize handler
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updatePlanetPositions(0);
    }, 100);
  }, { passive: true });
}

// Initialize on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTechnologyUniverse);
} else {
  initTechnologyUniverse();
}


// ============================================
// DEVELOPER TERMINAL - INTERACTIVE ENGINE
// ============================================
function initDeveloperTerminal() {
  const terminalWindow = document.getElementById('dev-terminal-window');
  const terminalBody = document.getElementById('terminal-body');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const clearBtn = document.getElementById('terminal-clear-btn');
  const fullscreenBtn = document.getElementById('terminal-fullscreen-btn');
  const quickBar = document.querySelector('.dev-terminal__quick-bar');
  const windowDots = terminalWindow ? terminalWindow.querySelectorAll('.dev-terminal__dot') : [];

  if (!terminalWindow || !terminalOutput || !terminalInput) return;

  // Session state
  const commandHistory = [];
  let historyIndex = -1;
  let isBooted = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Static Data References (Source of Truth)
  const devProfile = {
    name: 'Anupam Yadav',
    role: 'B.Tech CSE Student (2nd Year)',
    institute: 'Kashi Institute of Technology, Varanasi',
    location: 'Varanasi, Uttar Pradesh, India',
    email: 'yadavanupam9119@gmail.com',
    github: 'https://github.com/yadav-anupam',
    linkedin: 'https://www.linkedin.com/in/anupam-yadavv',
    resumeUrl: './Anupam%20resume.pdf'
  };

  const ecosystemProjects = [
    {
      id: 'acadtrack',
      name: 'AcadTrack',
      type: 'Continuous Internal Assessment & Handwritten Coursework Evaluation Platform',
      techs: 'HTML5, CSS3, JavaScript, Supabase, PostgreSQL, Storage, RLS, Vercel',
      desc: 'Automated rubric grading and student evaluation platform with continuous assessment tracking.',
      github: devProfile.github,
      live: 'https://anupam-yadavv.vercel.app/#technology-universe'
    },
    {
      id: 'kisan-setu',
      aliases: ['kisan', 'kisansetu'],
      name: 'Kisan Setu',
      type: 'AI Agricultural Procurement & Queue Management Platform',
      techs: 'React, TypeScript, Tailwind CSS, Python, FastAPI, PostgreSQL, Supabase, WebSockets, Machine Learning, Vercel',
      desc: 'Smart procurement and dynamic mandi queue scheduling engine with real-time throughput analytics.',
      github: devProfile.github,
      live: 'https://anupam-yadavv.vercel.app/#technology-universe'
    },
    {
      id: 'webjugad-labs',
      aliases: ['webjugad', 'webjugadlabs'],
      name: 'WebJugad Labs',
      type: 'Digital Development & Creative Tech Ecosystem',
      techs: 'HTML, CSS, JavaScript, Firebase, Firestore, GitHub, Vercel, AI Tools, Automation',
      desc: 'Ecosystem incubating high-impact web applications, client solutions, and automation prototypes.',
      github: devProfile.github,
      live: 'https://anupam-yadavv.vercel.app/#technology-universe'
    },
    {
      id: 'mykhata',
      aliases: ['khata'],
      name: 'MyKhata',
      type: 'Financial Ledger & Transaction Manager PWA',
      techs: 'HTML, CSS, JavaScript, Firebase, Firestore, PWA, Local Storage, Vercel',
      desc: 'Progressive Web App for managing income, expense tracking, and offline-first transaction records.',
      github: devProfile.github,
      live: 'https://anupam-yadavv.vercel.app/#technology-universe'
    },
    {
      id: 'smart-vision-school',
      aliases: ['smartvision', 'school'],
      name: 'Smart Vision School',
      type: 'Digital School Management Platform',
      techs: 'HTML5, CSS3, JavaScript, Firebase, Firestore, Authentication, Responsive UI',
      desc: 'Role-based school administration, attendance tracking, and educational student management.',
      github: devProfile.github,
      live: 'https://anupam-yadavv.vercel.app/#technology-universe'
    },
    {
      id: 'hangman-game',
      aliases: ['hangman'],
      name: 'Hangman Game',
      type: 'Interactive Python CLI Game',
      techs: 'Python, CLI, Game Logic',
      desc: 'Interactive command-line Hangman game featuring dynamic word selection, scoring logic, and clean gameplay.',
      github: 'https://github.com/yadav-anupam/CodeAlpha_HangmanGame',
      live: 'https://github.com/yadav-anupam/CodeAlpha_HangmanGame'
    },
    {
      id: 'basic-chatbot',
      aliases: ['chatbot'],
      name: 'Basic Chatbot',
      type: 'Conversational Python AI Agent',
      techs: 'Python, NLP, AI',
      desc: 'Python chatbot answering predefined queries and simulating conversational flows using rule-based NLP.',
      github: 'https://github.com/yadav-anupam/CodeAlpha_BasicChatbot',
      live: 'https://github.com/yadav-anupam/CodeAlpha_BasicChatbot'
    },
    {
      id: 'stock-portfolio-tracker',
      aliases: ['stock', 'portfolio-tracker'],
      name: 'Stock Portfolio Tracker',
      type: 'Financial Asset Performance Engine',
      techs: 'Python, Finance, Data',
      desc: 'Portfolio tracking application to monitor stock investments and calculate real-time profit and loss performance.',
      github: 'https://github.com/yadav-anupam/CodeAlpha_StockPortfolioTracker',
      live: 'https://github.com/yadav-anupam/CodeAlpha_StockPortfolioTracker'
    }
  ];

  // Output Helper Methods (Strict textContent sanitization)
  function createEntryElement(cmdText) {
    const entry = document.createElement('div');
    entry.className = 'dev-terminal__entry';

    if (cmdText) {
      const echoLine = document.createElement('div');
      echoLine.className = 'dev-terminal__cmd-echo';

      const promptSpan = document.createElement('span');
      promptSpan.className = 'dev-terminal__cmd-echo-prompt';
      promptSpan.textContent = 'anupam@portfolio:~$';

      const textSpan = document.createElement('span');
      textSpan.className = 'dev-terminal__cmd-echo-text';
      textSpan.textContent = ' ' + cmdText;

      echoLine.appendChild(promptSpan);
      echoLine.appendChild(textSpan);
      entry.appendChild(echoLine);
    }

    return entry;
  }

  function appendOutput(entryElement) {
    terminalOutput.appendChild(entryElement);
    // Smooth auto-scroll to latest output
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function printPlainText(text, className = '') {
    const entry = createEntryElement(null);
    const line = document.createElement('div');
    line.className = 'dev-terminal__res' + (className ? ' ' + className : '');
    line.textContent = text;
    entry.appendChild(line);
    appendOutput(entry);
  }

  function printCard(titleText, linesArray, actionButtons = []) {
    const entry = createEntryElement(null);
    const card = document.createElement('div');
    card.className = 'dev-terminal__res-card';

    if (titleText) {
      const cardTitle = document.createElement('div');
      cardTitle.className = 'dev-terminal__res-card-title';
      cardTitle.textContent = titleText;
      card.appendChild(cardTitle);
    }

    linesArray.forEach(item => {
      const line = document.createElement('div');
      line.className = 'dev-terminal__res';
      if (typeof item === 'string') {
        line.textContent = item;
      } else if (item && item.label && item.value) {
        line.textContent = item.label.padEnd(12, ' ') + ': ' + item.value;
      }
      card.appendChild(line);
    });

    if (actionButtons.length > 0) {
      const actionsWrap = document.createElement('div');
      actionsWrap.style.marginTop = '0.5rem';
      actionButtons.forEach(btnInfo => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dev-terminal__action-btn';
        btn.textContent = btnInfo.text;
        btn.addEventListener('click', btnInfo.onClick);
        actionsWrap.appendChild(btn);
      });
      card.appendChild(actionsWrap);
    }

    entry.appendChild(card);
    appendOutput(entry);
  }

  // Navigation Helper
  function smoothScrollTo(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Command Registry
  const commands = {
    help: () => {
      const helpText = [
        'Available commands:',
        '',
        '  about        About Anupam Yadav & developer background',
        '  whoami       Display developer identity & primary roles',
        '  skills       View technical skill toolkit & proficiencies',
        '  projects     Explore ecosystem & portfolio projects',
        '  project      Inspect a specific project (e.g. project acadtrack)',
        '  experience   View academic experience & journey highlights',
        '  education    View degrees, schools, and academic track',
        '  certificates View verified industry credentials & awards',
        '  stack        View technology stack across the ecosystem',
        '  status       Check portfolio system status & health',
        '  contact      Get direct contact information & channels',
        '  social       View GitHub, LinkedIn, and online profiles',
        '  resume       Open and view official resume (PDF)',
        '  neofetch     Display developer profile summary card',
        '  date         Show current local date and time',
        '  echo         Print custom text to the console (sanitized)',
        '  clear        Clear terminal screen',
        '',
        'Tip: You can click the quick buttons below or run "stack --visual".'
      ].join('\n');

      const entry = createEntryElement(null);
      const res = document.createElement('div');
      res.className = 'dev-terminal__res';
      res.textContent = helpText;
      entry.appendChild(res);
      appendOutput(entry);
    },

    whoami: () => {
      printCard('DEVELOPER IDENTITY', [
        'Anupam Yadav',
        '',
        'B.Tech CSE Student (2nd Year)',
        'Kashi Institute of Technology, Varanasi',
        '',
        'Focus: Python Development · AI Systems · Web Engineering · Problem Solving'
      ]);
    },

    about: () => {
      printCard('ABOUT ANUPAM YADAV', [
        { label: 'NAME', value: devProfile.name },
        { label: 'ROLE', value: devProfile.role },
        { label: 'LOCATION', value: devProfile.location },
        { label: 'INSTITUTE', value: devProfile.institute },
        { label: 'INTERESTS', value: 'Software Development, AI, Automation, Web Architecture' },
        { label: 'STATUS', value: 'Available for Internships & Engineering Roles' }
      ]);
    },

    skills: () => {
      const skillsTree = [
        'TECHNICAL TOOLKIT & SKILLS',
        '',
        'LANGUAGES',
        '├── Python (85%)',
        '├── HTML5 (80%)',
        '├── CSS3 (75%)',
        '├── C Programming (70%)',
        '└── JavaScript (40%)',
        '',
        'DEVELOPMENT & ARCHITECTURE',
        '├── Problem Solving (82%)',
        '├── Responsive UI Design (78%)',
        '└── Frontend Web Development (72%)',
        '',
        'AI & MODERN TECH',
        '├── Prompt Engineering (75%)',
        '├── Generative AI Foundations (70%)',
        '├── AI Productivity Tools (68%)',
        '└── Task Automation (60%)',
        '',
        'TOOLS & PLATFORMS',
        '├── VS Code (90%)',
        '├── GitHub (80%)',
        '└── Git Version Control (75%)'
      ].join('\n');
      printPlainText(skillsTree);
    },

    projects: () => {
      const projectLines = [
        'ECOSYSTEM & FEATURED PROJECTS',
        '',
        '[01] AcadTrack            - Handwritten Coursework Evaluation & Rubrics',
        '[02] Kisan Setu           - AI Agricultural Procurement & Queue Management',
        '[03] WebJugad Labs        - Creative Technology & Web App Ecosystem',
        '[04] MyKhata              - Financial Ledger & Transaction Tracking PWA',
        '[05] Smart Vision School  - Role-based School Management Platform',
        '[06] Hangman Game         - Dynamic word selection CLI game (Python)',
        '[07] Basic Chatbot        - Rule-based NLP conversational agent (Python)',
        '[08] Stock Portfolio      - Real-time P&L stock investment tracker (Python)',
        '',
        'Type "project <name>" to inspect details (e.g. "project acadtrack" or "project kisan-setu").'
      ];

      printCard('PROJECT DIRECTORY', projectLines, [
        {
          text: '⚡ View Projects in Portfolio',
          onClick: () => smoothScrollTo('projects')
        },
        {
          text: '🪐 View in Technology Universe',
          onClick: () => smoothScrollTo('technology-universe')
        }
      ]);
    },

    project: (args) => {
      if (!args || !args.trim()) {
        printPlainText('Usage: project <project-name>\nExample: project acadtrack\nType "projects" to view the full directory.', 'dev-terminal__res--info');
        return;
      }

      const q = args.trim().toLowerCase();
      const found = ecosystemProjects.find(p => 
        p.id === q || 
        p.name.toLowerCase() === q || 
        (p.aliases && p.aliases.includes(q))
      );

      if (!found) {
        printPlainText(`Project not found: "${args}".\nType "projects" to see the list of valid projects.`, 'dev-terminal__res--error');
        return;
      }

      const details = [
        found.type,
        '',
        'Description: ' + found.desc,
        'Technologies: ' + found.techs,
        'GitHub: ' + found.github,
        'Live URL: ' + found.live
      ];

      printCard(`PROJECT: ${found.name.toUpperCase()}`, details, [
        {
          text: 'Open GitHub Repo',
          onClick: () => window.open(found.github, '_blank', 'noopener,noreferrer')
        },
        {
          text: 'View in Portfolio',
          onClick: () => smoothScrollTo('projects')
        }
      ]);
    },

    stack: (args) => {
      if (args && args.trim() === '--visual') {
        printPlainText('Navigating to Technology Universe solar system...', 'dev-terminal__res--success');
        smoothScrollTo('technology-universe');
        return;
      }

      const stackText = [
        'TECHNOLOGY UNIVERSE ARCHITECTURE',
        '',
        'AcadTrack',
        '→ HTML5 · CSS3 · JavaScript · Supabase · PostgreSQL · Storage · RLS · Vercel',
        '',
        'Kisan Setu',
        '→ React · TypeScript · Tailwind CSS · Python · FastAPI · PostgreSQL · Supabase · WebSockets · ML · Vercel',
        '',
        'WebJugad Labs',
        '→ HTML · CSS · JavaScript · Firebase · Firestore · GitHub · Vercel · AI Tools · Automation',
        '',
        'MyKhata',
        '→ HTML · CSS · JavaScript · Firebase · Firestore · PWA · Local Storage · Vercel',
        '',
        'Smart Vision School',
        '→ HTML5 · CSS3 · JavaScript · Firebase · Firestore · Authentication · Responsive UI',
        '',
        'Run "stack --visual" to interact with the 3D celestial solar orbit system!'
      ];

      printCard('CORE ECOSYSTEM STACK', stackText, [
        {
          text: '🪐 Explore Technology Universe (3D)',
          onClick: () => {
            smoothScrollTo('technology-universe');
          }
        }
      ]);
    },

    certificates: () => {
      const certLines = [
        'VERIFIED INDUSTRY CREDENTIALS',
        '',
        '[01] AI Skills Passport',
        '     Issuer: EY & Microsoft (2026)',
        '     Skills: AI Skills · Sustainability · Technology',
        '',
        '[02] AI Fluency: Framework & Foundations',
        '     Issuer: Anthropic (2026)',
        '     Skills: AI Fluency · Large Language Models · Foundations',
        '',
        '[03] Career Essentials in Generative AI',
        '     Issuer: LinkedIn & Microsoft (2026 · 4h 18m)',
        '     Skills: Microsoft Copilot · Generative AI · Responsible AI',
        '',
        '[04] GenAI Powered Data Analytics Job Simulation',
        '     Issuer: TATA & Forage (2026)',
        '     Skills: Data Analytics · GenAI · Risk Profiling'
      ];

      printCard('CERTIFICATIONS', certLines, [
        {
          text: '📜 View Certifications Gallery',
          onClick: () => smoothScrollTo('certifications')
        }
      ]);
    },

    education: () => {
      printCard('EDUCATION PATHWAY', [
        { label: 'DEGREE', value: 'B.Tech — Computer Science Engineering (2025 — 2029)' },
        { label: 'INSTITUTE', value: 'Kashi Institute Of Technology, Varanasi' },
        { label: 'TOPICS', value: 'Data Structures, Algorithms, DBMS, Software Engineering, AI' },
        '',
        { label: 'CLASS 12TH', value: 'PCM with English & Physical Education (2025)' },
        { label: 'SCHOOL', value: 'Smart Vision School, Varanasi' },
        '',
        { label: 'CLASS 10TH', value: 'Secondary School Certificate (2023)' },
        { label: 'HONORS', value: '2nd Topper in Whole Class — Smart Vision School' }
      ], [
        {
          text: 'View Education Section',
          onClick: () => smoothScrollTo('education')
        }
      ]);
    },

    experience: () => {
      printCard('ACADEMIC & PRACTICAL EXPERIENCE', [
        'Status: Aspiring IT Engineer & Fresher',
        'Focus : Python, Full-Stack Web Development, and AI Engineering',
        '',
        'Key Accomplishments:',
        '> Independently engineered 3 Python projects (Hangman Game, Basic Chatbot, Stock Portfolio Tracker).',
        '> Earned 4 industry certifications from EY, Microsoft, Anthropic, and TATA.',
        '> Active builder across web technologies, database integration, and UI frameworks.',
        '> Open to internship opportunities and engineering collaborations in IT, AI, or Web Dev.'
      ], [
        {
          text: 'View Journey Section',
          onClick: () => smoothScrollTo('experience')
        }
      ]);
    },

    contact: () => {
      printCard('CONTACT & CONNECT', [
        { label: 'NAME', value: devProfile.name },
        { label: 'EMAIL', value: devProfile.email },
        { label: 'LOCATION', value: devProfile.location },
        { label: 'STATUS', value: 'Available for Internships' }
      ], [
        {
          text: '✉️ Send Message via Form',
          onClick: () => smoothScrollTo('contact')
        },
        {
          text: '🐙 Open GitHub',
          onClick: () => window.open(devProfile.github, '_blank', 'noopener,noreferrer')
        },
        {
          text: '💼 Open LinkedIn',
          onClick: () => window.open(devProfile.linkedin, '_blank', 'noopener,noreferrer')
        }
      ]);
    },

    social: () => {
      const entry = createEntryElement(null);
      const card = document.createElement('div');
      card.className = 'dev-terminal__res-card';

      const title = document.createElement('div');
      title.className = 'dev-terminal__res-card-title';
      title.textContent = 'ONLINE PROFILES';
      card.appendChild(title);

      const list = [
        { label: 'GitHub', url: devProfile.github },
        { label: 'LinkedIn', url: devProfile.linkedin },
        { label: 'Email', url: 'mailto:' + devProfile.email }
      ];

      list.forEach(item => {
        const line = document.createElement('div');
        line.className = 'dev-terminal__res';
        line.style.margin = '0.25rem 0';
        line.innerHTML = `${item.label.padEnd(10, ' ')} → <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="dev-terminal__link">${item.url}</a>`;
        card.appendChild(line);
      });

      entry.appendChild(card);
      appendOutput(entry);
    },

    resume: () => {
      printPlainText("Opening Anupam Yadav's official resume in a new tab...", 'dev-terminal__res--success');
      try {
        window.open(devProfile.resumeUrl, '_blank');
      } catch (e) {
        printPlainText('Unable to automatically launch pop-up. You can download it directly from the hero section.', 'dev-terminal__res--error');
      }
    },

    status: () => {
      const statusText = [
        'PORTFOLIO SYSTEM STATUS',
        '─────────────────────────────────────',
        'Portfolio UI       : [ ONLINE ]  v2.5.0',
        'Developer Terminal : [ ONLINE ]  Active Session',
        'Projects Layer     : [ ONLINE ]  8 Projects Ready',
        'Solar Universe     : [ ONLINE ]  5 Planets Orbiting',
        'Particles Engine   : [ ONLINE ]  Canvas Active',
        'Theme System       : [ ONLINE ]  Dark / Light Synced',
        'Firestore Security : [ SECURE ]  Public Read Active',
        '─────────────────────────────────────',
        'All client systems operational with zero errors.'
      ].join('\n');
      printPlainText(statusText, 'dev-terminal__res--success');
    },

    neofetch: () => {
      const art = [
        '                 █████╗ ██╗   ██╗',
        '                ██╔══██╗╚██╗ ██╔╝',
        '                ███████║ ╚████╔╝ ',
        '                ██╔══██║  ╚██╔╝  ',
        '                ██║  ██║   ██║   ',
        '                ╚═╝  ╚═╝   ╚═╝   ',
        '         ───────────────────────────────',
        '         anupam@portfolio',
        '         ───────────────────────────────',
        '         OS          : PortfolioOS (Vanilla Web)',
        '         Developer   : Anupam Yadav',
        '         Role        : B.Tech CSE Student (2nd Year)',
        '         College     : Kashi Institute of Technology',
        '         Location    : Varanasi, India',
        '         Core Stack  : Python · C · HTML5 · CSS3 · JavaScript',
        '         Databases   : PostgreSQL · Supabase · Firebase',
        '         Ecosystem   : 5 Interconnected Applications',
        '         Projects    : 8 Total Handcrafted Solutions',
        '         Certs       : 4 Verified Industry Credentials',
        '         Editor      : VS Code',
        '         Uptime      : Active Session'
      ].join('\n');
      printPlainText(art, 'dev-terminal__res--info');
    },

    date: () => {
      printPlainText(new Date().toString());
    },

    echo: (args) => {
      printPlainText(args || '');
    },

    clear: () => {
      terminalOutput.innerHTML = '';
    },

    python: (args) => {
      if (!args || args.trim() === 'anupam.py') {
        const pythonCode = [
          '# anupam.py',
          '',
          'class Developer:',
          '  def __init__(self):',
          '    self.name = "Anupam Yadav"',
          '    self.role = "Python Dev"',
          '    self.passion = "AI & Tech"',
          '',
          '  def code(self):',
          '    while True:',
          '      learn_something_new()',
          '      build_cool_stuff()',
          '',
          'me = Developer()',
          'me.code() # 🚀',
          '',
          '[Execution Output]',
          'Status: Developer instance active · Ready to solve problems & engineer solutions!'
        ].join('\n');
        printPlainText(pythonCode, 'dev-terminal__res--info');
      } else {
        printPlainText(`python: executed "${args}" (0 errors)`, 'dev-terminal__res--success');
      }
    },

    // Easter Eggs
    coffee: () => {
      printPlainText('☕ Developer fuel initialized. Coffee consumed: 100%. Ready to code.', 'dev-terminal__res--success');
    },

    sudo: () => {
      printPlainText('Nice try! This developer terminal operates strictly in sandbox userland with zero root privileges.', 'dev-terminal__res--error');
    },

    matrix: () => {
      printPlainText('Wake up, Neo... Follow the white rabbit. 🐇\nThe Matrix has you.', 'dev-terminal__res--info');
    },

    secret: () => {
      printPlainText('✨ Secret unlocked: This entire portfolio runs on Vanilla HTML5, CSS3, and JavaScript — no React, no Next.js, and zero bundle bloat!', 'dev-terminal__res--success');
    }
  };

  // Safe Command Dispatcher
  function executeCommand(rawInput) {
    if (!rawInput || !rawInput.trim()) return;

    const trimmed = rawInput.trim();
    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    // Echo the command prompt line
    const echoEntry = createEntryElement(trimmed);
    appendOutput(echoEntry);

    // Parse command name and arguments
    const spaceIdx = trimmed.indexOf(' ');
    let cmdName = '';
    let cmdArgs = '';

    if (spaceIdx === -1) {
      cmdName = trimmed.toLowerCase();
    } else {
      cmdName = trimmed.slice(0, spaceIdx).toLowerCase();
      cmdArgs = trimmed.slice(spaceIdx + 1);
    }

    if (Object.prototype.hasOwnProperty.call(commands, cmdName)) {
      commands[cmdName](cmdArgs);
    } else {
      printPlainText(`Command not found: "${cmdName}".\nType "help" to see all available commands.`, 'dev-terminal__res--error');
    }

    // Scroll to bottom
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Handle Form Submission
  terminalForm.addEventListener('submit', e => {
    e.preventDefault();
    const cmd = terminalInput.value;
    terminalInput.value = '';
    executeCommand(cmd);
  });

  // History Navigation and Autocomplete
  terminalInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentVal = terminalInput.value.trim().toLowerCase();
      if (!currentVal) return;

      const availableCmds = Object.keys(commands);
      const matches = availableCmds.filter(c => c.startsWith(currentVal));

      if (matches.length === 1) {
        terminalInput.value = matches[0];
      } else if (matches.length > 1) {
        printPlainText('Suggestions: ' + matches.join('  '), 'dev-terminal__res--info');
      }
    }
  });

  // Quick Command Pills
  if (quickBar) {
    quickBar.addEventListener('click', e => {
      const pill = e.target.closest('.dev-terminal__quick-pill');
      if (!pill) return;
      const cmd = pill.dataset.cmd;
      if (cmd) {
        terminalInput.value = '';
        executeCommand(cmd);
        terminalInput.focus();
      }
    });
  }

  // Clear Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      terminalOutput.innerHTML = '';
      terminalInput.focus();
    });
  }

  // Expand / Collapse In-Place Toggle (No navbar overlap & page never freezes)
  function toggleFullscreen() {
    const isExpanded = terminalWindow.classList.toggle('is-expanded');
    // Ensure full-screen modal classes and body scrolling locks are completely removed
    terminalWindow.classList.remove('is-fullscreen');
    document.body.classList.remove('terminal-fullscreen-active');
    
    if (fullscreenBtn) {
      const label = fullscreenBtn.querySelector('.dev-terminal__btn-label');
      if (label) label.textContent = isExpanded ? 'Collapse' : 'Expand';
      fullscreenBtn.setAttribute('title', isExpanded ? 'Collapse terminal' : 'Expand terminal');
    }
    if (isExpanded) {
      terminalWindow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    terminalInput.focus();
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  // Window Dots Actions
  if (windowDots.length >= 3) {
    windowDots[0].addEventListener('click', () => {
      terminalOutput.innerHTML = '';
      terminalInput.focus();
    });
    windowDots[1].addEventListener('click', () => {
      terminalOutput.innerHTML = '';
      printPlainText('Terminal session refreshed. Type "help" to view commands.', 'dev-terminal__res--info');
      terminalInput.focus();
    });
    windowDots[2].addEventListener('click', toggleFullscreen);
  }

  // Escape exits fullscreen
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (terminalWindow.classList.contains('is-expanded') || terminalWindow.classList.contains('is-fullscreen'))) {
      toggleFullscreen();
    }
    // Ctrl + ` shortcut to focus terminal input
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      terminalInput.focus();
      terminalWindow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Konami Code Easter Egg (Up Up Down Down Left Right Left Right B A)
  const konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === konamiSeq[konamiIdx].toLowerCase() || e.key === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        printPlainText('🌟 KONAMI CODE ACTIVATED: Retro gamer mode unlocked! 30 extra engineering lives granted.', 'dev-terminal__res--success');
        smoothScrollTo('developer-terminal');
      }
    } else {
      konamiIdx = 0;
    }
  });

  // Boot Sequence Simulation (Runs once when section scrolls into view)
  function runBootSequence() {
    if (isBooted) return;
    isBooted = true;

    if (prefersReducedMotion) {
      printPlainText([
        'Welcome to Anupam Yadav\'s Developer Terminal [v2.5.0]',
        'Type "help" to explore available commands.',
        ''
      ].join('\n'), 'dev-terminal__res--info');
      return;
    }

    const bootSteps = [
      'anupam@portfolio:~$ python anupam.py',
      '[OK] Developer initialized: Anupam Yadav (Python Dev · AI & Tech)',
      '> while True: learn_something_new() && build_cool_stuff() 🚀',
      '',
      'Terminal interactive console ready. Type "help" or click pills below.',
      ''
    ];

    let step = 0;
    function printNextBootStep() {
      if (step < bootSteps.length) {
        printPlainText(bootSteps[step], step >= 3 ? 'dev-terminal__res--success' : '');
        step++;
        setTimeout(printNextBootStep, 100);
      }
    }
    printNextBootStep();
  }

  // Trigger boot on scroll into view or immediate if visible
  if ('IntersectionObserver' in window) {
    const termObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runBootSequence();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    termObserver.observe(terminalWindow);
  } else {
    runBootSequence();
  }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeveloperTerminal);
} else {
  initDeveloperTerminal();
}
