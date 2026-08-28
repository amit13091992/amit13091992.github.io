(() => {
  const body = document.body;
  const progress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme
  const savedTheme = localStorage.getItem('amit-theme');
  if (savedTheme === 'dark') body.classList.add('dark');
  themeIcon.textContent = body.classList.contains('dark') ? '☀' : '◐';
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const dark = body.classList.contains('dark');
    localStorage.setItem('amit-theme', dark ? 'dark' : 'light');
    themeIcon.textContent = dark ? '☀' : '◐';
  });

  // Mobile menu
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '×' : '☰';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  }));

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
    backTop.classList.toggle('show', window.scrollY > 700);
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

  // Active nav
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const railLinks = [...document.querySelectorAll('.side-rail > a')];
  const activate = (id) => {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    railLinks.forEach(a => a.classList.toggle('rail-active', a.getAttribute('href') === '#' + id));
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target.id); });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));

  // GSAP reveals and hero motion
  if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    gsap.from('.hero h1', { opacity: 0, y: 35, duration: 1.1, delay: .1, ease: 'power4.out' });
    gsap.from('.hero h2, .hero-text, .hero-actions, .social-row', {
      opacity: 0, y: 20, duration: .8, delay: .35, stagger: .08, ease: 'power3.out'
    });
    gsap.to('.orbit-a', { rotation: 360, duration: 28, repeat: -1, ease: 'none' });
    gsap.to('.orbit-b', { rotation: -360, duration: 34, repeat: -1, ease: 'none' });
    gsap.to('.orbit-c', { rotation: 360, duration: 45, repeat: -1, ease: 'none' });
    gsap.to('.tech-node', {
      y: 'random(-7,7)', x: 'random(-5,5)', duration: 2.8, repeat: -1,
      yoyo: true, stagger: .2, ease: 'sine.inOut'
    });
    gsap.to('.hero-visual', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateY: x * 3.5, rotateX: -y * 3.5, transformPerspective: 900, duration: .35 });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: .5 }));
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = '1';
      const target = Number(entry.target.dataset.count);
      if (prefersReduced) { entry.target.textContent = target + '+'; return; }
      let start = 0, startTime = null;
      const step = t => {
        if (!startTime) startTime = t;
        const p = Math.min((t - startTime) / 900, 1);
        start = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        entry.target.textContent = start + (p >= 1 ? '+' : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  counters.forEach(c => countObserver.observe(c));

  // Interactive engineering map: subtle response to pointer
  const map = document.getElementById('systemMap');
  if (map && !prefersReduced) {
    map.addEventListener('pointermove', e => {
      const r = map.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      map.querySelector('.map-center').style.transform = `translate(-50%, -50%) translate(${x * 8}px, ${y * 8}px)`;
      map.querySelectorAll('.map-node').forEach((node, i) => {
        const f = (i % 2 ? 1 : -1);
        node.style.transform = `translate(${x * 5 * f}px, ${y * 4}px)`;
      });
    });
    map.addEventListener('pointerleave', () => {
      map.querySelector('.map-center').style.transform = 'translate(-50%, -50%)';
      map.querySelectorAll('.map-node').forEach(n => n.style.transform = '');
    });
  }

  // Desktop custom cursor
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
    const cursorLoop = () => {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.left = rx+'px'; ring.style.top = ry+'px';
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();
    document.querySelectorAll('a,button,.capability,.map-node').forEach(el => {
      el.addEventListener('pointerenter', () => { ring.style.width='52px'; ring.style.height='52px'; });
      el.addEventListener('pointerleave', () => { ring.style.width='34px'; ring.style.height='34px'; });
    });
  }
})();
