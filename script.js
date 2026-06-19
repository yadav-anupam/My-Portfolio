// LOADER
window.addEventListener('load',()=>{
  setTimeout(()=>document.getElementById('loader').classList.add('hidden'),1700);
});

// PARTICLES
const canvas=document.getElementById('particles-canvas');
const ctx=canvas.getContext('2d');
let particles=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();window.addEventListener('resize',resize);
for(let i=0;i<80;i++){
  particles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,a:Math.random()*.5+.2});
}
function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(198,138,78,${p.a})`;ctx.fill();
  });
  particles.forEach((p,i)=>{
    for(let j=i+1;j<particles.length;j++){
      const d=Math.hypot(p.x-particles[j].x,p.y-particles[j].y);
      if(d<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle=`rgba(198,138,78,${.06*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke();}
    }
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// SCROLL PROGRESS
const progressBar=document.getElementById('scroll-progress');
window.addEventListener('scroll',()=>{
  const pct=(scrollY/(document.documentElement.scrollHeight-innerHeight))*100;
  progressBar.style.width=pct+'%';
});

// NAV
const navbar=document.getElementById('navbar');
const hamburger=document.getElementById('hamburger');
const navLinks=document.getElementById('nav-links');
window.addEventListener('scroll',()=>{
  navbar.classList.toggle('scrolled',scrollY>60);
  document.getElementById('back-to-top').classList.toggle('show',scrollY>400);
});
hamburger.addEventListener('click',()=>{navLinks.classList.toggle('open');});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));

// BACK TO TOP
document.getElementById('back-to-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// TYPING ANIMATION
const words=['Python Developer','AI Enthusiast','Problem Solver','Future IT Engineer'];
let wi=0,ci=0,del=false;
const el=document.getElementById('typing-text');
function type(){
  const w=words[wi];
  el.textContent=del?w.slice(0,ci--):w.slice(0,ci++);
  if(!del&&ci>w.length){del=true;setTimeout(type,1500);return;}
  if(del&&ci<0){del=false;wi=(wi+1)%words.length;ci=0;}
  setTimeout(type,del?60:100);
}
setTimeout(type,2000);

// FADE IN OBSERVER
const fades=document.querySelectorAll('.fade-in');
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      // animate skill bars
      e.target.querySelectorAll('.skill-bar').forEach(b=>{b.style.width=b.dataset.pct+'%'});
    }
  });
},{threshold:.12});
fades.forEach(f=>obs.observe(f));
// Also observe skill bars in already-visible groups
document.querySelectorAll('.skill-bar').forEach(b=>{
  const barObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.pct+'%';barObs.disconnect();}});
  },{threshold:.1});
  barObs.observe(b);
});

// PROJECT FILTER
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');
    const f=this.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card=>{
      const tags=card.dataset.tags||'';
      card.style.display=(f==='all'||tags.includes(f))?'block':'none';
    });
  });
});

// â”€â”€ STACKED CARD DECK (horizontal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initDeck(deckId, prevBtnId, nextBtnId, dotsId) {
  const deck = document.getElementById(deckId);
  if (!deck) return;
  const cards = Array.from(deck.children);
  const total = cards.length;
  let current = 0;
  let busy = false;

  // build dots
  const dotsEl = document.getElementById(dotsId);
  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'deck-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function updateDots() {
    dotsEl.querySelectorAll('.deck-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function setPositions(animate, outCard) {
    cards.forEach((card, i) => {
      const raw = (i - current + total) % total;
      // mirror: last cards peek from the LEFT
      let pos;
      if (raw === 0) pos = 0;
      else if (raw === total - 1) pos = 'left1';
      else if (raw === total - 2) pos = 'left2';
      else pos = Math.min(raw, 3);
      card.dataset.pos = pos;
      card.classList.remove('slide-out','slide-in');
    });
    if (animate && outCard !== undefined) {
      cards[outCard].classList.add('slide-out');
      cards[current].classList.add('slide-in');
      setTimeout(()=>{
        cards[outCard].classList.remove('slide-out');
        cards[current].classList.remove('slide-in');
        busy = false;
      }, 380);
    }
    // animate skill bars on front card
    cards[current].querySelectorAll('.skill-bar').forEach(b => { b.style.width = '0%'; });
    setTimeout(()=>{
      cards[current].querySelectorAll('.skill-bar').forEach(b => { b.style.width = b.dataset.pct + '%'; });
    }, 50);
  }

  function goTo(index) {
    if (busy) return;
    const prev = current;
    const next = ((index % total) + total) % total;
    if (next === prev) return;
    busy = true;
    current = next;
    setPositions(true, prev);
    updateDots();
  }

  document.getElementById(prevBtnId).addEventListener('click', () => goTo(current - 1));
  document.getElementById(nextBtnId).addEventListener('click', () => goTo(current + 1));

  setPositions(false);
  updateDots();
  setTimeout(() => {
    cards[0].querySelectorAll('.skill-bar').forEach(b => { b.style.width = b.dataset.pct + '%'; });
  }, 700);
}




// CONTACT FORM â€” Web3Forms submit
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fmsg = document.getElementById('form-msg');
    const sendBtn = document.getElementById('send-btn');
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

// CERT MODALS
function openCertModal(id){
  document.getElementById(id).classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCertModal(overlay){
  overlay.classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape') document.querySelectorAll('.cert-modal-overlay.open').forEach(m=>m.classList.remove('open')); });

// â”€â”€ CURSOR GLOW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// â”€â”€ THEME TOGGLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || 'light';

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  themeBtn.textContent = isLight ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-pressed', String(isLight));
  themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  themeBtn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}

applyTheme(initialTheme);

themeBtn.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
});

// â”€â”€ SECTION PROGRESS DOTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const sections = ['hero','about','skills','projects','certifications','education','experience','testimonials','profiles','contact'];
const sdots = document.querySelectorAll('.sdot');
sdots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    const target = document.getElementById(sections[i]);
    if(target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
function updateDots() {
  const scrollY = window.scrollY + window.innerHeight / 2;
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    sdots[i]?.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}
window.addEventListener('scroll', updateDots, { passive: true });
updateDots();

