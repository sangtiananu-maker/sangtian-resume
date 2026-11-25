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
  const navContainer = document.querySelector('.hud-nav');
  let ticking = false;
  let lastActiveId = null;

  function scrollNavToActive(activeLink) {
    if (!navContainer || !activeLink) return;
    if (navContainer.scrollWidth <= navContainer.clientWidth) return;
    const navRect = navContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const linkCenterInNav = (linkRect.left - navRect.left) + navContainer.scrollLeft + (linkRect.width / 2);
    const maxScroll = navContainer.scrollWidth - navContainer.clientWidth;
    const targetLeft = Math.max(0, Math.min(maxScroll, linkCenterInNav - (navRect.width / 2)));
    navContainer.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
  }

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

    // Ensure the last section highlights when scrolled to the bottom
    if (sections.length > 0 && (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 24)) {
      currentId = sections[sections.length - 1].getAttribute('id');
    }

    let activeLink = null;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
      if (isActive) activeLink = link;
    });

    if (currentId !== lastActiveId) {
      lastActiveId = currentId;
      scrollNavToActive(activeLink);
    }
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
            lastActiveId = targetId.slice(1);
            scrollNavToActive(link);
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

// 5. Smartphone Touch Scroll Control (Android / iOS Calm Momentum) & Selection Guard
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
  let isVerticalDrag = false;
  let startX = 0;
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
      isVerticalDrag = false;
      return;
    }
    if (e.target && e.target.closest && e.target.closest('.hud-nav')) {
      tracking = false;
      isVerticalDrag = false;
      return;
    }
    tracking = true;
    isVerticalDrag = false;
    startX = e.touches[0].clientX;
    startY = lastY = e.touches[0].clientY;
    lastTime = performance.now();
    velocity = 0;
  }, { passive: true });

  // Non-passive touchmove intercepts Chrome Android's compositor runaway fling
  window.addEventListener('touchmove', (e) => {
    if (!tracking || e.touches.length !== 1) return;

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const totalDx = Math.abs(x - startX);
    const totalDy = Math.abs(y - startY);

    // Determine gesture direction once finger moves > 3px
    if (!isVerticalDrag) {
      if (totalDx > totalDy && totalDx > 4) {
        // Horizontal gesture — release to browser
        tracking = false;
        return;
      }
      if (totalDy >= 3) {
        isVerticalDrag = true;
      } else {
        return;
      }
    }

    const dy = lastY - y; // positive = scroll down, negative = scroll up

    // Allow native pull-to-refresh when already at very top and pulling down
    if (window.scrollY <= 0 && dy < 0) {
      lastY = y;
      lastTime = performance.now();
      return;
    }

    // Take ownership of vertical scroll so Android doesn't launch runaway fling
    if (e.cancelable) {
      e.preventDefault();
    }

    const now = performance.now();
    const dt = now - lastTime;

    // Slightly calmer 0.85x drag scale for controlled, comfortable reading
    const dragScale = 0.85;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const nextY = Math.max(0, Math.min(maxScroll, window.scrollY + dy * dragScale));
    window.scrollTo(0, nextY);

    if (dt > 0 && dt < 120) {
      const instantV = (dy * dragScale) / dt;
      velocity = velocity * 0.35 + instantV * 0.65;
    }
    lastY = y;
    lastTime = now;
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!tracking) return;
    const wasVertical = isVerticalDrag;
    tracking = false;
    isVerticalDrag = false;

    if (!wasVertical) return;

    const sinceLastMove = performance.now() - lastTime;

    // Apply calm, capped, refresh-rate-independent deceleration (60Hz/90Hz/120Hz)
    if (sinceLastMove < 85 && Math.abs(velocity) > 0.12) {
      const maxVelPerFrame = 18; // ~180px max glide on hard flick
      let vFrame = velocity * 16.67 * 0.4;
      if (vFrame > maxVelPerFrame) vFrame = maxVelPerFrame;
      if (vFrame < -maxVelPerFrame) vFrame = -maxVelPerFrame;

      const frictionPer60Hz = 0.9;
      let prevTime = performance.now();

      function step(now) {
        const dt = Math.min(40, Math.max(1, now - prevTime));
        prevTime = now;
        const frameScale = dt / 16.67;

        vFrame *= Math.pow(frictionPer60Hz, frameScale);
        if (Math.abs(vFrame) < 0.35) {
          animFrameId = null;
          return;
        }

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const nextY = Math.max(0, Math.min(maxScroll, window.scrollY + vFrame * frameScale));
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
    isVerticalDrag = false;
    stopMomentum();
  }, { passive: true });
}