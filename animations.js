/**
 * ============================================================================
 * AGLA PAG — ULTRA-PREMIUM INTERACTION & ANIMATION ENGINE v2.0 (animations.js)
 * ============================================================================
 */

(function () {
  'use strict';

  // Global State Variables
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let lerpMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let haloEl = null;
  let progressBarEl = null;

  document.addEventListener('DOMContentLoaded', () => {
    setupProgressBar();
    setupCursorHalo();
    setupAppleDockProximity();
    setup3DCardsAndSpecularSheen();
    setupMagneticPhysics();
    setupRippleEffect();
    setupScrollEngine();
    setupContrastAndTextEffects();
    
    // Start Animation Render Loop
    requestAnimationFrame(renderLoop);
  });

  /* --------------------------------------------------------------------------
   * 1. PHYSICS LERP RENDER LOOP (Butter-smooth spring cursor & parallax)
   * -------------------------------------------------------------------------- */
  function renderLoop() {
    // Linear interpolation formula: current + (target - current) * factor
    lerpMouse.x += (mouse.x - lerpMouse.x) * 0.12;
    lerpMouse.y += (mouse.y - lerpMouse.y) * 0.12;

    // Update global CSS variables for fluid ambient background
    document.documentElement.style.setProperty('--mouse-lerp-x', `${lerpMouse.x}px`);
    document.documentElement.style.setProperty('--mouse-lerp-y', `${lerpMouse.y}px`);

    // Update Cursor Halo Position
    if (haloEl) {
      haloEl.style.transform = `translate3d(${lerpMouse.x}px, ${lerpMouse.y}px, 0)`;
    }

    requestAnimationFrame(renderLoop);
  }

  /* --------------------------------------------------------------------------
   * 2. CURSOR & MOUSE POSITION TRACKER
   * -------------------------------------------------------------------------- */
  function setupCursorHalo() {
    haloEl = document.getElementById('cursor-halo');
    if (!haloEl) {
      haloEl = document.createElement('div');
      haloEl.id = 'cursor-halo';
      document.body.appendChild(haloEl);
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      document.documentElement.style.setProperty('--mouse-x', `${mouse.x}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouse.y}px`);
    });

    // Detect Hoverable Contexts for Halo State Morphs
    document.querySelectorAll('a, button, .dock-item, .btn-magnetic').forEach((el) => {
      el.addEventListener('mouseenter', () => haloEl.classList.add('hover-active'));
      el.addEventListener('mouseleave', () => haloEl.classList.remove('hover-active'));
    });

    document.querySelectorAll('.glass-panel').forEach((card) => {
      card.addEventListener('mouseenter', () => haloEl.classList.add('hover-card'));
      card.addEventListener('mouseleave', () => haloEl.classList.remove('hover-card'));
    });
  }

  /* --------------------------------------------------------------------------
   * 3. SCROLL PROGRESS ENGINE
   * -------------------------------------------------------------------------- */
  function setupProgressBar() {
    progressBarEl = document.getElementById('scroll-progress-bar');
    if (!progressBarEl) {
      progressBarEl = document.createElement('div');
      progressBarEl.id = 'scroll-progress-bar';
      document.body.appendChild(progressBarEl);
    }
  }

  function setupScrollEngine() {
    const onScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));

      // Reveal-up Observer Triggering
      document.querySelectorAll('.reveal-up:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.88) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run initial check
  }

  /* --------------------------------------------------------------------------
   * 4. APPLE DOCK GAUSSIAN NEIGHBOR PROXIMITY SCALING
   * -------------------------------------------------------------------------- */
  function setupAppleDockProximity() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    if (!nav.classList.contains('apple-dock-wrapper')) {
      nav.classList.add('apple-dock-wrapper');
      const innerContainer = nav.querySelector('div:nth-child(2)');
      if (innerContainer) {
        innerContainer.classList.add('apple-dock');
        innerContainer.querySelectorAll('button, a').forEach((item) => {
          item.classList.add('dock-item');
        });
      }
    }

    const dockItems = document.querySelectorAll('.dock-item');
    const maxDistance = 150;
    const maxScale = 1.35;

    window.addEventListener('mousemove', (e) => {
      dockItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (distance < maxDistance) {
          // Gaussian Bell Curve formula for natural expansion
          const scale = 1 + (maxScale - 1) * Math.exp(-Math.pow(distance / (maxDistance * 0.5), 2));
          const translateY = -12 * (scale - 1);
          item.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(2)}px)`;
        } else {
          item.style.transform = 'scale(1) translateY(0px)';
        }
      });
    });

    const dock = document.querySelector('.apple-dock');
    if (dock) {
      dock.addEventListener('mouseleave', () => {
        dockItems.forEach((item) => {
          item.style.transform = 'scale(1) translateY(0px)';
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
   * 5. 3D GYROSCOPIC TILT & SPECULAR SHEEN MATH
   * -------------------------------------------------------------------------- */
  function setup3DCardsAndSpecularSheen() {
    const cards = document.querySelectorAll('.glass-panel');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (((y - centerY) / centerY) * -10).toFixed(2);
        const rotateY = (((x - centerX) / centerX) * 10).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;
        card.style.setProperty('--card-x', `${x}px`);
        card.style.setProperty('--card-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 6. MAGNETIC BUTTON PHYSICS
   * -------------------------------------------------------------------------- */
  function setupMagneticPhysics() {
    const magneticElements = document.querySelectorAll('.btn-magnetic, .dock-item');

    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = ((e.clientX - centerX) * 0.38).toFixed(2);
        const deltaY = ((e.clientY - centerY) * 0.38).toFixed(2);

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 7. BUTTON CLICK RIPPLE SPLASH ENGINE
   * -------------------------------------------------------------------------- */
  function setupRippleEffect() {
    document.querySelectorAll('button, .btn-magnetic, a.px-8, a.px-6, a.px-10').forEach((button) => {
      button.classList.add('btn-magnetic');

      button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-wave');

        const existingRipple = this.querySelector('.ripple-wave');
        if (existingRipple) {
          existingRipple.remove();
        }

        this.appendChild(circle);
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 8. AUTOMATIC HIGH CONTRAST & LEGIBILITY BOOST
   * -------------------------------------------------------------------------- */
  function setupContrastAndTextEffects() {
    document.querySelectorAll('h1, h2, h3, .font-display').forEach((el) => {
      el.classList.add('high-contrast-text');
    });

    document.querySelectorAll('p, .font-editorial').forEach((p) => {
      p.style.color = '#f4f4f8';
      p.style.fontWeight = '500';
    });
  }
})();