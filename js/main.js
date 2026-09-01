/* =========================================================
   PORTFOLIO INTERACTION SYSTEM
   - Persistent theme
   - Active navigation pill
   - Mobile navigation
   - Page transition
   - Scroll reveal
   - Project filtering
   - Cursor-aware cards
   - Subtle sparse interactive grid
   - Click ripples
   ========================================================= */

(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  /* ---------- Theme ---------- */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const storedTheme = localStorage.getItem('portfolio-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;
  else root.dataset.theme = 'dark';

  const updateThemeUI = () => {
    if (!themeToggle) return;
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.setAttribute('title', light ? 'Dark mode' : 'Light mode');
    const sun = themeToggle.querySelector('[data-sun]');
    const moon = themeToggle.querySelector('[data-moon]');
    if (sun) sun.hidden = !light;
    if (moon) moon.hidden = light;
  };

  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
    updateThemeUI();
  });
  updateThemeUI();

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('[data-navigation]');
  const menu = document.querySelector('[data-menu-toggle]');
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const navLinks = [...document.querySelectorAll('[data-navigation] a')];
  navLinks.forEach(link => {
    const url = new URL(link.href, location.href);
    const page = url.pathname.split('/').pop() || 'index.html';
    if (page === currentPage || (currentPage.startsWith('project-') && page === 'projects.html')) {
      link.classList.add('active');
    }
  });

  const positionNavPill = () => {
    if (!nav) return;
    const active = nav.querySelector('a.active');
    if (!active || window.innerWidth <= 760) {
      nav.classList.remove('has-active-pill');
      return;
    }
    nav.classList.add('has-active-pill');
    nav.style.setProperty('--pill-left', `${active.offsetLeft}px`);
    nav.style.setProperty('--pill-width', `${active.offsetWidth}px`);
  };
  positionNavPill();
  window.addEventListener('resize', positionNavPill, { passive: true });

  menu?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open') ?? false;
    menu.setAttribute('aria-expanded', String(open));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.getAttribute('href')?.startsWith('#')) return;
      event.preventDefault();
      const href = link.href;
      nav?.classList.remove('is-open');
      menu?.setAttribute('aria-expanded', 'false');
      if (reducedMotion) location.href = href;
      else {
        body.classList.add('page-leave');
        window.setTimeout(() => { location.href = href; }, 260);
      }
    });
  });

  /* ---------- Reveal ---------- */
  const reveal = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveal.forEach(el => el.classList.add('revealed'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -35px' });
    reveal.forEach(el => observer.observe(el));
  }

  /* ---------- Project filtering ---------- */
  const filterButtons = document.querySelectorAll('[data-project-filter]');
  const projectItems = document.querySelectorAll('[data-project-category]');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter;
      filterButtons.forEach(b => b.classList.toggle('active', b === button));
      projectItems.forEach(project => {
        const show = filter === 'all' || project.dataset.projectCategory === filter;
        project.classList.toggle('project-hidden', !show);
      });
    });
  });

  /* ---------- Cursor-aware cards ---------- */
  const interactiveCards = document.querySelectorAll('.card, .project-card, .article-card, .timeline-item, .contact-card');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    interactiveCards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
        const tilt = card.classList.contains('project-card') ? 2.2 : 1.2;
        const rx = ((y - 50) / 50) * -tilt;
        const ry = ((x - 50) / 50) * tilt;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Main-panel pointer glow ---------- */
  const panel = document.querySelector('.main-panel');
  if (panel && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    panel.addEventListener('pointermove', event => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      panel.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Interactive sparse grid ---------- */
  class InteractionGrid {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.spacing = 31;
      this.radius = 150;
      this.points = [];
      this.ripples = [];
      this.mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
      this.last = performance.now();
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerLeave = () => { this.mouse.active = false; };
      window.addEventListener('resize', this.resize, { passive: true });
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
      window.addEventListener('blur', this.onPointerLeave);
      this.resize();
      requestAnimationFrame(this.frame);
    }

    resize() {
      this.width = innerWidth;
      this.height = innerHeight;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.spacing = innerWidth < 760 ? 29 : 31;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.build();
    }

    build() {
      this.points.length = 0;
      const cols = Math.ceil(this.width / this.spacing) + 1;
      const rows = Math.ceil(this.height / this.spacing) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          this.points.push({ x: col * this.spacing + this.spacing / 2, y: row * this.spacing + this.spacing / 2, px: 0, py: 0, a: .055, s: .75 });
        }
      }
    }

    onPointerMove(e) {
      this.mouse.tx = e.clientX;
      this.mouse.ty = e.clientY;
      this.mouse.active = true;
    }

    onPointerDown(e) {
      if (reducedMotion || e.button !== 0) return;
      this.ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: .16 });
      if (this.ripples.length > 3) this.ripples.shift();
    }

    update() {
      this.mouse.x += (this.mouse.tx - this.mouse.x) * 1.045;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 1.045;
      for (const p of this.points) {
        let tx = 0, ty = 0, targetA = .055, targetS = .75;
        if (this.mouse.active) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < this.radius) {
            const f = Math.pow(1 - d / this.radius, 2);
            /* Attraction is intentionally tiny: the grid stays uniform. */
            tx = dx * f * .095;
            ty = dy * f * .095;
            targetA += f * 3.17;
            targetS += f * 2.05;
          }
        }
        p.px += (tx - p.px) * .055;
        p.py += (ty - p.py) * .055;
        p.a += (targetA - p.a) * .055;
        p.s += (targetS - p.s) * .055;
      }
      for (const r of this.ripples) {
        r.r += 2.0;
        r.a *= .972;
      }
      this.ripples = this.ripples.filter(r => r.r < 220 && r.a > .025);
    }

    draw() {
      const light = root.dataset.theme === 'light';
      const rgb = light ? '25, 30, 30' : '226, 229, 229';
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (const p of this.points) {
        this.ctx.beginPath();
        this.ctx.arc(p.x + p.px, p.y + p.py, p.s, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
        this.ctx.fill();
      }

      if (this.mouse.active && !reducedMotion) {
        const g = this.ctx.createRadialGradient(this.mouse.x, this.mouse.y, 0, this.mouse.x, this.mouse.y, this.radius);
        g.addColorStop(0, 'rgba(222, 187, 98, 0.03)');
        g.addColorStop(.55, 'rgba(228, 189, 93, 0.01)');
        g.addColorStop(1, 'rgba(239,198,91,0)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(this.mouse.x - this.radius, this.mouse.y - this.radius, this.radius * 2, this.radius * 2);
      }

      for (const r of this.ripples) {
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(239,198,91,${r.a})`;
        this.ctx.lineWidth = .7;
        this.ctx.stroke();
      }
    }

    frame(now) {
      if (now - this.last < 100) { this.update(); this.draw(); }
      this.last = now;
      requestAnimationFrame(this.frame);
    }
  }

  const canvas = document.querySelector('#interactive-grid');
  if (canvas) new InteractionGrid(canvas);
})();

/* =========================================
   Resume Read More
   ========================================= */

document.querySelectorAll(".read-more-btn").forEach((button) => {

    button.addEventListener("click", () => {

        const entry = button.closest(".timeline-item");
        const expandable = entry.querySelector(".resume-expandable");

        const isExpanded =
            button.getAttribute("aria-expanded") === "true";

        if (isExpanded) {

            expandable.classList.remove("is-expanded");

            button.setAttribute(
                "aria-expanded",
                "false"
            );

            button.querySelector(".read-more-label").textContent =
                "Read more";

        } else {

            expandable.classList.add("is-expanded");

            button.setAttribute(
                "aria-expanded",
                "true"
            );

            button.querySelector(".read-more-label").textContent =
                "Read less";
        }
    });

});