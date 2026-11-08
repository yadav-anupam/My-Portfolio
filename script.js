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

// --- CONSOLIDATED HIGH-PERFORMANCE SCROLL HANDLER ---
const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');
const sections = ['hero','about','skills','technology-universe','projects','certifications','education','experience','testimonials','profiles','contact'];
const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
const sdots = document.querySelectorAll('.sdot');

let isScrollTicking = false;

function handleScrollUpdates() {
  const currentScrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // 1. Scroll Progress Bar
  if (progressBar && docHeight > 0) {
    const pct = (currentScrollY / docHeight) * 100;
    progressBar.style.width = pct + '%';
  }

  // 2. Navbar & Back to Top Toggle
  if (navbar) {
    navbar.classList.toggle('scrolled', currentScrollY > 60);
  }
  if (backToTop) {
    backToTop.classList.toggle('show', currentScrollY > 400);
  }

  // 3. Section Indicator Dots
  if (sdots.length > 0) {
    const viewportMiddle = currentScrollY + window.innerHeight / 2;
    for (let i = 0; i < sectionElements.length; i++) {
      const el = sectionElements[i];
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < bottom) {
        sdots.forEach((dot, dotIdx) => dot.classList.toggle('active', dotIdx === i));
        break;
      }
    }
  }

  isScrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!isScrollTicking) {
    requestAnimationFrame(handleScrollUpdates);
    isScrollTicking = true;
  }
}, { passive: true });

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
      if (proj) updatePanel(proj);
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
