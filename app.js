// ==========================================================================
// THE MULTIVERSE OF SANGTIAN ANURAKWONGSRI — EXECUTIVE APP CONTROLLER
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initBootAnimation();
  initCosmicCanvas();
  initScrollSpy();
  initMilestoneTabs();
  initMobileScrollDamping();
});

// 1. Futuristic Boot / Welcome Sequence Animation
function initBootAnimation() {
  const overlay = document.getElementById('boot-overlay');
  if (!overlay) return;
  const skipBtn = document.getElementById('boot-skip-btn');

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    overlay.classList.add('boot-completed');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 700);
  }

  // Smooth auto-dismiss after sequence completion (~2.4s)
  const autoTimer = setTimeout(dismiss, 1800);

  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(autoTimer);
      dismiss();
    });
  }

  // Click anywhere to dismiss immediately
  overlay.addEventListener('click', () => {
    clearTimeout(autoTimer);
    dismiss();
  });

  // ESC or Space to skip immediately
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === ' ') {
      clearTimeout(autoTimer);
      dismiss();
    }
  });
}

// 2. Subtle Biopharma Cosmic Starfield Canvas
function initCosmicCanvas() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = Array.from({ length: 48 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    alpha: Math.random() * 0.5 + 0.15
  }));

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 184, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 125) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 125) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// 3. Sticky Navigation Scroll-Spy & Smooth Navigation Handler
function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  const header = document.querySelector('.hud-header');
  let ticking = false;

  function updateActive() {
    ticking = false;
    const headerHeight = header ? header.offsetHeight : 68;
    const scrollPos = window.scrollY + headerHeight + 24;
    let currentId = sections[0]?.getAttribute('id') || 'hero';

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.getAttribute('id');
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActive);
    }
  }, { passive: true });
  updateActive();

  // Precise smooth navigation click handler for all in-page anchors
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
        const targetSec = document.querySelector(targetId);
        if (targetSec) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 68;
          const rect = targetSec.getBoundingClientRect();
          const targetY = Math.max(0, rect.top + window.scrollY - headerHeight);
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
          try {
            history.pushState(null, '', targetId);
          } catch (_) {}
          if (link.classList.contains('nav-link')) {
            navLinks.forEach((l) => l.classList.toggle('active', l === link));
          }
        }
      }
    });
  });
}

// 4. Milestone Filter Tabs (All / PAC / UDL)
function initMilestoneTabs() {
  const tabs = document.querySelectorAll('.milestone-tab');
  const groups = document.querySelectorAll('.milestone-group');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      tabs.forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      groups.forEach((group) => {
        const groupName = group.getAttribute('data-group');
        if (target === 'panel-all') {
          group.style.display = 'block';
        } else if (target === 'panel-pac' && groupName === 'pac') {
          group.style.display = 'block';
        } else if (target === 'panel-udl' && groupName === 'udl') {
          group.style.display = 'block';
        } else {
          group.style.display = 'none';
        }
      });
    });
  });
}

// 5. Smartphone Touch Scroll Momentum Damping & Selection Guard
function initMobileScrollDamping() {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isTouchDevice) return;

  // Extra safeguard against accidental text selection on mobile
  document.addEventListener('selectstart', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
    }
  });

  let tracking = false;
  let startY = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0; // px per ms
  let animFrameId = null;

  function stopMomentum() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  window.addEventListener('touchstart', (e) => {
    stopMomentum();
    if (window.innerWidth > 768 || e.touches.length !== 1) {
      tracking = false;
      return;
    }
    if (e.target && e.target.closest && e.target.closest('.hud-nav')) {
      tracking = false;
      return;
    }
    tracking = true;
    startY = lastY = e.touches[0].clientY;
    lastTime = performance.now();
    velocity = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!tracking || e.touches.length !== 1) return;
    const now = performance.now();
    const y = e.touches[0].clientY;
    const dt = now - lastTime;
    if (dt > 0) {
      const dy = lastY - y;
      const instantV = dy / dt;
      velocity = velocity * 0.4 + instantV * 0.6;
      lastY = y;
      lastTime = now;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!tracking) return;
    tracking = false;

    const sinceLastMove = performance.now() - lastTime;
    const totalMove = Math.abs(startY - lastY);

    // Only apply gentle controlled deceleration for actual vertical swipes
    if (sinceLastMove < 90 && totalMove > 10 && Math.abs(velocity) > 0.15) {
      // Cancel browser's runaway native fling immediately
      const currentY = window.scrollY;
      window.scrollTo(0, currentY);

      // Convert px/ms to damped px/frame and cap max speed
      const maxVelPerFrame = 22;
      let vFrame = velocity * 16 * 0.55;
      if (vFrame > maxVelPerFrame) vFrame = maxVelPerFrame;
      if (vFrame < -maxVelPerFrame) vFrame = -maxVelPerFrame;

      const friction = 0.88;

      function step() {
        vFrame *= friction;
        if (Math.abs(vFrame) < 0.4) {
          animFrameId = null;
          return;
        }
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const nextY = Math.max(0, Math.min(maxScroll, window.scrollY + vFrame));
        window.scrollTo(0, nextY);
        if (nextY <= 0 || nextY >= maxScroll) {
          animFrameId = null;
          return;
        }
        animFrameId = requestAnimationFrame(step);
      }

      animFrameId = requestAnimationFrame(step);
    }
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    tracking = false;
    stopMomentum();
  }, { passive: true });
}