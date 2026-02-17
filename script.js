/* =============================================
   EVENSIA PORTFOLIO — JAVASCRIPT
   All interactions, animations, and behaviors
   Author: Evensia
   ============================================= */

'use strict';

// =============================================
// 1. UTILITIES
// =============================================

/**
 * Lightweight query selector helpers
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Debounce: delay-limits high-frequency events (scroll, resize)
 */
function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// =============================================
// 2. CUSTOM CURSOR
// =============================================

function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  // Only on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot snaps immediately
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow via requestAnimationFrame
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Enlarge ring on interactive elements
  const hoverEls = $$('a, button, .skill-card, .project-card, .service-card, .contact-link, select, input, textarea');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

// =============================================
// 3. NAVBAR — scroll behavior & active links
// =============================================

function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  // Add 'scrolled' class once user scrolls past 60px
  const handleScroll = debounce(() => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }, 20);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on init

  /**
   * Highlight the nav link corresponding to the current section in view
   */
  function updateActiveNavLink() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
}

// =============================================
// 4. HAMBURGER MENU (mobile)
// =============================================

function initHamburger() {
  const btn  = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on mobile link click
  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// =============================================
// 5. SMOOTH SCROLL — for all anchor links
// =============================================

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = $(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = $('#navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// =============================================
// 6. REVEAL ON SCROLL (Intersection Observer)
// =============================================

function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger sibling reveals for visual delight
          const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
          siblings.forEach((el, idx) => {
            setTimeout(() => el.classList.add('visible'), idx * 90);
          });
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// =============================================
// 7. SKILL PROGRESS BARS
// =============================================

function initSkillBars() {
  const bars = $$('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width || '80';
          entry.target.style.width = width + '%';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(bar => observer.observe(bar));
}

// =============================================
// 8. BACK-TO-TOP BUTTON
// =============================================

function initBackTop() {
  const btn = $('#backTop');
  if (!btn) return;

  const handleScroll = debounce(() => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =============================================
// 9. CONTACT FORM
// =============================================

function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  const btn     = $('#submitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    $$('[required]', form).forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'rgba(252, 90, 90, 0.7)';
        field.addEventListener('input', () => (field.style.borderColor = ''), { once: true });
      }
    });
    if (!valid) return;

    // Email format check
    const emailEl = $('#email');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailEl && !emailRx.test(emailEl.value)) {
      emailEl.style.borderColor = 'rgba(252, 90, 90, 0.7)';
      emailEl.focus();
      return;
    }

    // Simulate sending (replace with real endpoint / EmailJS / etc.)
    const btnText = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';
    if (btnIcon) { btnIcon.className = 'fas fa-spinner fa-spin'; }

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
      if (btnIcon) { btnIcon.className = 'fas fa-paper-plane'; }
      if (success) success.classList.add('show');

      // Hide success after 5 seconds
      setTimeout(() => success?.classList.remove('show'), 5000);
    }, 1800);
  });
}

// =============================================
// 10. FOOTER — dynamic year
// =============================================

function initYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// =============================================
// 11. TYPING EFFECT — hero tagline words
// =============================================

function initTypingEffect() {
  const el = document.querySelector('.hero-roles');
  if (!el) return;

  const words = [
    'Software Developer',
    'AI Enthusiast',
    'IT Support Specialist',
    'SEO & Content Manager'
  ];
  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const word = words[wordIdx];

    if (!deleting) {
      el.textContent = word.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; tick(); }, 2000);
        return;
      }
    } else {
      el.textContent = word.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }

    const speed = deleting ? 55 : 95;
    if (!paused) setTimeout(tick, speed);
  }

  // Replace static text with typing
  el.textContent = '';
  setTimeout(tick, 1200);
}

// =============================================
// 12. PROJECT CARDS — tilt effect on hover
// =============================================

function initTilt() {
  const cards = $$('.project-card, .skill-card');
  if (!window.matchMedia('(hover: hover)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(600px)
        rotateX(${-y * 5}deg)
        rotateY(${x  * 5}deg)
        translateY(-4px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// =============================================
// 13. ANIMATED NUMBER COUNTER — stat cards
// =============================================

function initCounters() {
  const counters = $$('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el   = entry.target;
        const text = el.textContent.replace(/\D/g, '');
        const end  = parseInt(text, 10);
        const suffix = el.textContent.replace(/[0-9]/g, '');
        if (!end) return;

        let start = 0;
        const step = Math.ceil(end / 35);
        const timer = setInterval(() => {
          start = Math.min(start + step, end);
          el.textContent = start + suffix;
          if (start === end) clearInterval(timer);
        }, 38);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// =============================================
// 14. PERFORMANCE — prefers-reduced-motion
// =============================================

function respectReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable costly animations for accessibility
    document.documentElement.style.setProperty('--ease-spring', 'linear');
    document.querySelectorAll('.blob, .scroll-line::after').forEach(el => {
      el.style.animation = 'none';
    });
    // Reveal elements immediately
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }
}

// =============================================
// 15. INIT — DOMContentLoaded
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  respectReducedMotion();
  initCursor();
  initNavbar();
  initHamburger();
  initSmoothScroll();
  initReveal();
  initSkillBars();
  initBackTop();
  initContactForm();
  initYear();
  initTypingEffect();
  initTilt();
  initCounters();

  // Log to console for devs looking under the hood 🙂
  console.log(
    '%c[ Evensia Portfolio ]%c\nBuilt with HTML · CSS · JS\nLooking for a developer? → evensia@email.com',
    'color: #63dcb9; font-size: 14px; font-weight: bold;',
    'color: #7b7b9a; font-size: 11px;'
  );
});

// =============================================
// 16. HANDLE WINDOW RESIZE
// =============================================

window.addEventListener('resize', debounce(() => {
  // Close mobile menu if viewport grows beyond mobile
  if (window.innerWidth > 768) {
    const menu = $('#mobileMenu');
    const btn  = $('#hamburger');
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn?.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
}, 200));
