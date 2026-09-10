(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const body = document.body;
  const progress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* =========================================================
   PORTFOLIO BOOT LOADER
   ========================================================= */

  (() => {
    const loader = document.getElementById('portfolioLoader');

    if (!loader) return;

    const progressBar = document.getElementById('portfolioLoaderBar');
    const progressPercent = document.getElementById('portfolioLoaderPercent');
    const progressMessage = document.getElementById('portfolioLoaderMessage');

    const messages = [
      'Initializing portfolio...',
      'Loading skills...',
      'Loading projects...',
      'Preparing experience...',
      'Setting up creative mode...',
      'Optimizing user experience...',
      'Almost there...'
    ];

    let progress = 0;
    let messageIndex = 0;

    const updateProgress = (value) => {
      progress = Math.min(100, value);

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (progressPercent) {
        progressPercent.textContent = `${Math.round(progress)}%`;
      }
    };

    const updateMessage = (index) => {
      if (!progressMessage) return;

      progressMessage.textContent =
        messages[Math.min(index, messages.length - 1)];
    };

    /*
     * Keep the loader long enough to feel intentional,
     * but don't block the portfolio unnecessarily.
     */
    const startTime = performance.now();
    const minimumDisplayTime = 1300;

    const runLoader = () => {
      updateMessage(0);

      const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;

        if (progress >= 100) {
          progress = 100;
        }

        updateProgress(progress);

        const nextMessageIndex = Math.min(
          Math.floor(progress / (100 / messages.length)),
          messages.length - 1
        );

        if (nextMessageIndex !== messageIndex) {
          messageIndex = nextMessageIndex;
          updateMessage(messageIndex);
        }

        if (progress >= 100) {
          clearInterval(interval);

          const elapsed = performance.now() - startTime;
          const remaining = Math.max(
            0,
            minimumDisplayTime - elapsed
          );

          setTimeout(() => {
            loader.classList.add('is-hidden');

            /*
             * Remove it completely after the fade.
             * This prevents the loader from sitting above
             * the portfolio and intercepting clicks.
             */
            setTimeout(() => {
              loader.remove();
            }, 650);

          }, remaining);
        }

      }, 120);
    };

    /*
     * If the user prefers reduced motion,
     * finish quickly.
     */
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      updateProgress(100);
      updateMessage(messages.length - 1);

      setTimeout(() => {
        loader.classList.add('is-hidden');

        setTimeout(() => {
          loader.remove();
        }, 100);

      }, 200);

      return;
    }

    runLoader();
  })();

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
    navLinks.forEach(a =>
      a.classList.toggle(
        'active',
        a.getAttribute('href') === '#' + id
      )
    );

    railLinks.forEach(a =>
      a.classList.toggle(
        'rail-active',
        a.getAttribute('href') === '#' + id
      )
    );
  };

  const safeScrollTo = (target) => {
    const element = document.querySelector(target);

    if (!element) return;

    element.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start'
    });
  };

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
    window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    const cursorLoop = () => {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();
    document.querySelectorAll('a,button,.capability,.map-node').forEach(el => {
      el.addEventListener('pointerenter', () => { ring.style.width = '52px'; ring.style.height = '52px'; });
      el.addEventListener('pointerleave', () => { ring.style.width = '34px'; ring.style.height = '34px'; });
    });
  }

  // Skills Matrix filters
  const skillFilters = document.querySelectorAll('.skill-filter');
  const skillChips = document.querySelectorAll('.skill-chip');

  skillFilters.forEach((filterButton) => {
    filterButton.addEventListener('click', () => {
      const selectedFilter = filterButton.dataset.filter;

      // Update active state
      skillFilters.forEach((button) => {
        const isActive = button === filterButton;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });

      // Filter skills
      skillChips.forEach((chip) => {
        const category = chip.dataset.category;

        const shouldShow =
          selectedFilter === 'all' ||
          category === selectedFilter;

        chip.classList.toggle('hidden', !shouldShow);
      });
    });
  });

  /* =========================================================
   PORTFOLIO TERMINAL — INTERACTIVE VERSION
   ========================================================= */
  /* =========================================================
       PORTFOLIO TERMINAL
       macOS-style visual, but follows the portfolio's navy/orange theme.
       ========================================================= */

  const terminalOverlay = document.createElement('div');
  terminalOverlay.className = 'terminal-overlay';
  terminalOverlay.setAttribute('aria-hidden', 'true');

  terminalOverlay.innerHTML = `
    <section class="portfolio-terminal" role="dialog" aria-modal="false" aria-label="Portfolio terminal">
      <div class="terminal-titlebar">
        <div class="terminal-window-controls" aria-label="Terminal window controls">
          <button class="terminal-control terminal-close" type="button" aria-label="Close terminal"></button>
          <button class="terminal-control terminal-minimize" type="button" aria-label="Minimize terminal"></button>
          <button class="terminal-control terminal-maximize" type="button" aria-label="Maximize terminal"></button>
        </div>
        <div class="terminal-title">amit@portfolio — zsh</div>
        <div class="terminal-title-spacer" aria-hidden="true"></div>
      </div>

      <div class="terminal-body" aria-live="polite" aria-label="Terminal output"></div>

      <form class="terminal-input-row" autocomplete="off">
        <span class="portfolio-terminal-prompt" aria-hidden="true">amit@portfolio %</span>
        <input
          class="terminal-input"
          type="text"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          aria-label="Terminal command"
        />
      </form>
    </section>
  `;

  document.body.appendChild(terminalOverlay);

  const terminalWindow = $('.portfolio-terminal', terminalOverlay);
  const terminalTitlebar = $('.terminal-titlebar', terminalWindow);
  const terminalOutput = $('.terminal-body', terminalWindow);
  const terminalForm = $('.terminal-input-row', terminalWindow);
  const terminalInput = $('.terminal-input', terminalWindow);
  const terminalClose = $('.terminal-close', terminalWindow);
  const terminalMinimize = $('.terminal-minimize', terminalWindow);
  const terminalMaximize = $('.terminal-maximize', terminalWindow);

  const terminalLauncher = document.createElement('button');
  terminalLauncher.className = 'terminal-launcher';
  terminalLauncher.type = 'button';
  terminalLauncher.setAttribute('aria-label', 'Open portfolio terminal');
  terminalLauncher.innerHTML = '<span>&gt;_</span>';
  document.body.appendChild(terminalLauncher);

  const terminalHistory = [];
  let terminalHistoryIndex = -1;
  let terminalInitialized = false;

  const terminalCommands = {
    help: () => [
      'Available commands:',
      '  about        — who I am',
      '  experience   — professional experience',
      '  skills       — technical skills',
      '  stack        — core engineering stack',
      '  projects     — selected projects',
      '  architecture — architecture & engineering approach',
      '  ai           — how I use AI in development',
      '  writing      — engineering notes',
      '  github       — open GitHub profile',
      '  linkedin     — open LinkedIn profile',
      '  contact      — jump to contact section',
      '  resume       — open resume if configured',
      '  work         — selected work',
      '  whoami       — quick profile',
      '  clear        — clear terminal',
      '  help         — show this list'
    ],

    whoami: () => [
      'Amit Kumar Pandya',
      'Senior Software Engineer',
      'React Native · TypeScript · React.js · Mobile Architecture',
      'Focus: Mobile Engineering → Full-Stack → AI Engineering'
    ],

    about: () => [
      'Senior Software Engineer with 9+ years of software engineering experience.',
      'I build scalable mobile and web applications with a focus on architecture,',
      'performance, real-time communication, testing and production delivery.'
    ],

    experience: () => [
      'Experience:',
      '  PurpleTalk India — Senior Analyst (Oct 2020 — Present)',
      '  Palred Technologies — React Native Developer (Jan 2020 — Aug 2020)',
      '  Norm Software — React Native Developer (Apr 2019 — Dec 2019)',
      '  Stimulus Cloud — Freelancer (Mar 2018 — Apr 2019)',
      '  Kellton Tech Solutions — Junior Software Developer (Jan 2017 — Feb 2018)'
    ],

    skills: () => [
      'Core skills:',
      '  React Native · Expo · React.js · TypeScript · JavaScript',
      '  Node.js · NestJS · Express · REST APIs · GraphQL · Prisma',
      '  MySQL · MongoDB · Supabase · Docker · AWS · Azure',
      '  WebSockets · MQTT · Jest · Playwright · GitHub Actions',
      '  Clean Architecture · SOLID · Design Patterns · CI/CD'
    ],

    stack: () => [
      'Primary stack:',
      '  Mobile   → React Native + Expo + TypeScript',
      '  Web      → React.js + TypeScript',
      '  Backend  → Node.js + NestJS / Express',
      '  Data     → MySQL + MongoDB + Supabase',
      '  Delivery → Docker + GitHub Actions + Cloud',
      '  Quality  → Jest + Playwright'
    ],

    projects: () => [
      'Selected projects:',
      '  01. rn-scanner — React Native dependency intelligence CLI',
      '  02. Ecommerce Monorepo — React + NestJS + Prisma + MySQL',
      '',
      'Use "work" to jump to the selected work section.'
    ],

    architecture: () => [
      'Engineering approach:',
      '  • Clean architecture and separation of responsibilities',
      '  • Maintainable APIs and predictable data flow',
      '  • Real-time communication with WebSockets / MQTT where required',
      '  • Testing and automation around critical workflows',
      '  • CI/CD and production-minded delivery'
    ],

    ai: () => [
      'AI in development:',
      '  • GitHub Copilot for development acceleration',
      '  • Cursor and Claude for technical exploration',
      '  • Debugging, code analysis and refactoring assistance',
      '  • Architecture exploration and documentation',
      '  • Learning new technologies through AI-assisted research'
    ],

    writing: () => [
      'Engineering notes:',
      '  • Building AI Into Mobile Apps in 2026',
      '  • React Native vs Flutter in 2026',
      '  • Integrating Biometric Authentication in React Native',
      '',
      'Use "writing" to jump to the full writing section.'
    ],

    work: () => [
      'Opening selected work...'
    ],

    contact: () => [
      'Opening contact section...'
    ],

    github: () => [
      'Opening GitHub...'
    ],

    linkedin: () => [
      'Opening LinkedIn...'
    ],

    resume: () => [
      'Resume link is not configured yet.',
      'Add your resume URL to the terminal command in script.js when ready.'
    ]
  };

  function appendTerminalLine(text = '', type = '') {
    const line = document.createElement('div');
    line.className = `portfolio-terminal-line${type ? ` ${type}` : ''}`;
    line.textContent = text;
    terminalOutput?.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function appendTerminalCommand(command) {
    const row = document.createElement('div');
    row.className = 'portfolio-terminal-command';

    const prompt = document.createElement('span');
    prompt.className = 'portfolio-terminal-command-prompt';
    prompt.textContent = 'amit@portfolio %';

    const value = document.createElement('span');
    value.textContent = ` ${command}`;

    row.append(prompt, value);
    terminalOutput?.appendChild(row);
  }

  function openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function executeTerminalCommand(rawCommand) {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;

    terminalHistory.push(rawCommand.trim());
    terminalHistoryIndex = terminalHistory.length;

    appendTerminalCommand(rawCommand.trim());

    if (command === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    if (command === 'github') {
      appendTerminalLine('Opening GitHub...', 'success');
      openExternal('https://github.com/amit13091992');
      return;
    }

    if (command === 'linkedin') {
      appendTerminalLine('Opening LinkedIn...', 'success');
      openExternal('https://www.linkedin.com/in/amit-kumar-pandya-258699120');
      return;
    }

    if (command === 'contact' || command === 'work' || command === 'projects' || command === 'writing') {
      const target = command === 'contact' ? '#contact'
        : command === 'writing' ? '#writing'
          : '#projects';

      appendTerminalLine(
        command === 'contact' ? 'Opening contact section...' : 'Opening selected work...',
        'success'
      );

      closeTerminal();
      safeScrollTo(target);
      return;
    }

    if (command === 'resume') {
      const resumeUrl = window.PORTFOLIO_RESUME_URL || '';
      if (resumeUrl) {
        appendTerminalLine('Opening resume...', 'success');
        openExternal(resumeUrl);
      } else {
        terminalCommands.resume().forEach((line) => appendTerminalLine(line));
      }
      return;
    }

    const handler = terminalCommands[command];

    if (!handler) {
      appendTerminalLine(`zsh: command not found: ${command}`, 'error');
      appendTerminalLine('Type "help" to see available commands.');
      return;
    }

    const output = handler();
    output.forEach((line) => appendTerminalLine(line));
  }

  function initializeTerminal() {
    if (terminalInitialized) return;
    terminalInitialized = true;

    appendTerminalLine('Amit Pandya — portfolio terminal', 'accent');
    appendTerminalLine('Type "help" to explore.', 'muted');
    appendTerminalLine('');
  }

  function openTerminal() {
    initializeTerminal();
    terminalOverlay.classList.add('is-open');
    terminalOverlay.setAttribute('aria-hidden', 'false');

    window.setTimeout(() => {
      terminalInput?.focus();
    }, prefersReduced ? 0 : 120);
  }

  function closeTerminal() {
    terminalOverlay.classList.remove('is-open');
    terminalOverlay.setAttribute('aria-hidden', 'true');
  }

  terminalLauncher.addEventListener('click', () => {
    if (terminalOverlay.classList.contains('is-open')) {
      closeTerminal();
    } else {
      openTerminal();
    }
  });

  terminalClose?.addEventListener('click', closeTerminal);

  terminalMinimize?.addEventListener('click', closeTerminal);

  terminalMaximize?.addEventListener('click', () => {
    if (!terminalWindow) return;

    terminalWindow.classList.toggle('is-maximized');

    const isMaximized = terminalWindow.classList.contains('is-maximized');

    terminalMaximize.setAttribute(
      'aria-label',
      isMaximized ? 'Restore terminal' : 'Maximize terminal'
    );
  });

  terminalOverlay.addEventListener('click', (event) => {
    if (event.target === terminalOverlay) closeTerminal();
  });

  terminalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    executeTerminalCommand(terminalInput.value);
    terminalInput.value = '';
  });

  terminalInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!terminalHistory.length) return;

      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
      terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!terminalHistory.length) return;

      terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
      terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
    }

    if (event.key === 'Escape') {
      closeTerminal();
    }
  });

  /* =========================================================
     PORTFOLIO TERMINAL — DRAGGING
     Uses left/top instead of transform.
     This intentionally avoids transform because the terminal
     has open/maximize animation and right/bottom positioning.
     ========================================================= */

  let isTerminalDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let terminalStartLeft = 0;
  let terminalStartTop = 0;

  terminalTitlebar?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.terminal-window-controls')) return;
    if (!terminalWindow || window.innerWidth <= 620) {
      // Mobile still supports touch scrolling/clicking but keeps the
      // terminal anchored to its mobile layout instead of dragging it.
      return;
    }

    const rect = terminalWindow.getBoundingClientRect();

    terminalWindow.style.left = `${rect.left}px`;
    terminalWindow.style.top = `${rect.top}px`;
    terminalWindow.style.right = 'auto';
    terminalWindow.style.bottom = 'auto';

    terminalStartLeft = rect.left;
    terminalStartTop = rect.top;

    dragStartX = event.clientX;
    dragStartY = event.clientY;

    isTerminalDragging = true;
    terminalWindow.classList.add('is-dragging');

    terminalTitlebar.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  terminalTitlebar?.addEventListener('pointermove', (event) => {
    if (!isTerminalDragging || !terminalWindow) return;

    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;

    let newLeft = terminalStartLeft + deltaX;
    let newTop = terminalStartTop + deltaY;

    const rect = terminalWindow.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minimumVisible = 60;

    const maxLeft = viewportWidth - minimumVisible;
    const maxTop = viewportHeight - 44;

    newLeft = Math.max(
      -rect.width + minimumVisible,
      Math.min(newLeft, maxLeft)
    );

    newTop = Math.max(
      0,
      Math.min(newTop, maxTop)
    );

    terminalWindow.style.left = `${newLeft}px`;
    terminalWindow.style.top = `${newTop}px`;
  });

  function stopTerminalDragging(event) {
    if (!isTerminalDragging) return;

    isTerminalDragging = false;
    terminalWindow?.classList.remove('is-dragging');

    try {
      terminalTitlebar?.releasePointerCapture(event.pointerId);
    } catch (error) {
      /* Pointer capture already released. */
    }
  }

  terminalTitlebar?.addEventListener('pointerup', stopTerminalDragging);
  terminalTitlebar?.addEventListener('pointercancel', stopTerminalDragging);

  /* =========================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================= */

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (event.key === '`' && !isTyping) {
      event.preventDefault();
      if (terminalOverlay.classList.contains('is-open')) {
        closeTerminal();
      } else {
        openTerminal();
      }
    }
  });

  /* =========================================================
     INITIAL HASH
     ========================================================= */

  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      window.setTimeout(() => {
        initialTarget.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 50);
    }
  } else {
    activate('home');
  }

  // =========================================================
  // CONTACT FORM — CLOUDFLARE WORKER + RESEND
  // =========================================================

  const CONTACT_ENDPOINT =
    'https://amit-portfolio-contact.pandeyamit1392.workers.dev';

  const contactForm =
    document.getElementById('contactForm');

  const contactFormStatus =
    document.getElementById('contactFormStatus');

  // Message character counter
  const messageInput =
    document.getElementById('contactMessage');

  const messageCounter =
    document.getElementById('messageCounter');

  if (messageInput && messageCounter) {
    const updateMessageCounter = () => {
      const length = messageInput.value.length;

      messageCounter.textContent =
        `${length.toLocaleString()} / 5,000`;
    };

    messageInput.addEventListener(
      'input',
      updateMessageCounter
    );

    // Initialize counter
    updateMessageCounter();
  }

  if (contactForm) {
    contactForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();

        console.log(
          '========== CONTACT FORM SUBMIT =========='
        );

        /*
         * Get fields directly by ID.
         * This avoids FormData/name-attribute issues.
         */

        const nameInput =
          document.getElementById('contactName');

        const emailInput =
          document.getElementById('contactEmail');

        const subjectInput =
          document.getElementById('contactSubject');

        const messageInput =
          document.getElementById('contactMessage');

        const messageCounter =
          document.getElementById('messageCounter');

        if (messageInput && messageCounter) {
          const updateMessageCounter = () => {
            const length =
              messageInput.value.length;

            messageCounter.textContent =
              `${length.toLocaleString()} / 5,000`;
          };

          messageInput.addEventListener(
            'input',
            updateMessageCounter
          );

          updateMessageCounter();
        }
        console.log('Input elements:', {
          nameInput,
          emailInput,
          subjectInput,
          messageInput
        });



        /*
         * Make sure all input elements exist
         */

        if (
          !nameInput ||
          !emailInput ||
          !subjectInput ||
          !messageInput
        ) {
          console.error(
            'Contact form input element is missing.'
          );

          contactFormStatus.textContent =
            'Contact form configuration error.';

          contactFormStatus.className =
            'contact-form-status error';

          return;
        }

        /*
         * Read values directly
         */

        const name =
          nameInput.value.trim();

        const email =
          emailInput.value.trim();

        const subject =
          subjectInput.value.trim();

        const message =
          messageInput.value.trim();

        /*
         * DEBUG
         */

        console.log(
          '========== FORM VALUES =========='
        );

        console.log('Name:', name);
        console.log(
          'Name length:',
          name.length
        );

        console.log('Email:', email);
        console.log(
          'Email length:',
          email.length
        );

        console.log('Subject:', subject);
        console.log(
          'Subject length:',
          subject.length
        );

        console.log('Message:', message);
        console.log(
          'Message length:',
          message.length
        );

        /*
         * Browser validation
         */

        if (!contactForm.checkValidity()) {
          console.warn(
            'Browser validation failed.'
          );

          contactForm.reportValidity();

          return;
        }

        /*
         * Basic validation
         */

        if (!name) {
          console.warn(
            'Name is empty.'
          );

          contactFormStatus.textContent =
            'Please enter your name.';

          contactFormStatus.className =
            'contact-form-status error';

          nameInput.focus();

          return;
        }

        if (!email) {
          console.warn(
            'Email is empty.'
          );

          contactFormStatus.textContent =
            'Please enter your email.';

          contactFormStatus.className =
            'contact-form-status error';

          emailInput.focus();

          return;
        }

        if (!subject) {
          console.warn(
            'Subject is empty.'
          );

          contactFormStatus.textContent =
            'Please enter a subject.';

          contactFormStatus.className =
            'contact-form-status error';

          subjectInput.focus();

          return;
        }

        if (!message) {
          console.warn(
            'Message is empty.'
          );

          contactFormStatus.textContent =
            'Please enter a message.';

          contactFormStatus.className =
            'contact-form-status error';

          messageInput.focus();

          return;
        }

        /*
         * Minimum length validation
         */

        if (name.length < 2) {
          contactFormStatus.textContent =
            'Please enter your full name.';

          contactFormStatus.className =
            'contact-form-status error';

          nameInput.focus();

          return;
        }

        if (subject.length < 2) {
          contactFormStatus.textContent =
            'Please enter a subject.';

          contactFormStatus.className =
            'contact-form-status error';

          subjectInput.focus();

          return;
        }

        if (message.length < 10) {
          contactFormStatus.textContent =
            'Please enter at least 10 characters in your message.';

          contactFormStatus.className =
            'contact-form-status error';

          messageInput.focus();

          return;
        }

        console.log(
          '✅ Frontend validation passed.'
        );

        /*
         * Payload
         */

        const payload = {
          name,
          email,
          subject,
          message
        };

        console.log(
          '========== PAYLOAD =========='
        );

        console.log(payload);

        /*
         * Button state
         */

        const submitButton =
          contactForm.querySelector(
            '.contact-submit'
          );

        const originalButtonText =
          submitButton.innerHTML;

        submitButton.disabled = true;

        submitButton.innerHTML =
          'Sending... <span>↗</span>';

        contactFormStatus.textContent =
          'Sending your message...';

        contactFormStatus.className =
          'contact-form-status';

        /*
         * Send to Cloudflare Worker
         */

        try {
          console.log(
            '========== CALLING WORKER =========='
          );

          console.log(
            'Endpoint:',
            CONTACT_ENDPOINT
          );

          const response =
            await fetch(
              CONTACT_ENDPOINT,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify(payload)
              }
            );

          console.log(
            'Worker HTTP status:',
            response.status
          );

          console.log(
            'Worker response OK:',
            response.ok
          );

          /*
           * Read response
           */

          const responseText =
            await response.text();

          console.log(
            'Worker response:',
            responseText
          );

          let result = {};

          try {
            result =
              JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              'Response is not valid JSON:',
              parseError
            );
          }

          /*
           * Worker returned an error
           */

          if (!response.ok) {
            throw new Error(
              result?.message ||
              `Worker returned HTTP ${response.status}`
            );
          }

          /*
           * Success
           */

          console.log(
            '🎉 Message successfully accepted by Worker.'
          );

          contactFormStatus.textContent =
            'Message sent successfully. I’ll get back to you soon.';

          contactFormStatus.className =
            'contact-form-status success';

          contactForm.reset();
          updateMessageCounter();

          contactFormStatus.textContent = 'Message sent successfully.';
          contactFormStatus.className = 'contact-form-status success';
        } catch (error) {

          console.error(
            '========== CONTACT FORM ERROR =========='
          );

          console.error(
            error
          );

          console.error(
            'Error message:',
            error?.message
          );

          contactFormStatus.textContent =
            'Something went wrong. Please try again or email me directly.';

          contactFormStatus.className =
            'contact-form-status error';

        } finally {

          submitButton.disabled = false;

          submitButton.innerHTML =
            originalButtonText;

          console.log(
            '========== CONTACT FORM END =========='
          );
        }
      }
    );
  }
})();
