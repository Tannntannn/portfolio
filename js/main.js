(function () {
  'use strict';

  const html = document.documentElement;
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const workGrid = document.getElementById('work-grid');
  const filterBar = document.getElementById('project-filters');
  const yearEl = document.getElementById('year');
  const yearFooter = document.getElementById('year-footer');

  let activeFilter = 'all';

  function countProjectsForCategory(categoryValue) {
    if (typeof PROJECTS === 'undefined') return 0;
    if (categoryValue === 'all') return PROJECTS.length;
    return PROJECTS.filter((p) => p.category === categoryValue).length;
  }

  function getStoredTheme() {
    return localStorage.getItem('theme'); // 'light' | 'dark' | null (system)
  }

  function resolveThemeFromMode(mode) {
    if (mode === 'system' || !mode) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }

  function padWeeks(days) {
    // Align to weeks starting Sunday like GitHub
    const out = days.slice();
    if (!out.length) return out;
    const first = new Date(out[0].date + 'T00:00:00');
    const lead = first.getDay(); // 0 Sun
    for (let i = 0; i < lead; i += 1) {
      out.unshift({ date: '', count: 0, level: 0, empty: true });
    }
    while (out.length % 7 !== 0) {
      out.push({ date: '', count: 0, level: 0, empty: true });
    }
    return out;
  }

  function renderGhChart(days) {
    const host = document.getElementById('gh-chart');
    const totalEl = document.getElementById('gh-total');
    if (!host) return;

    const padded = padWeeks(days);
    const weeks = padded.length / 7;
    const cell = 12;
    const pad = 2;
    const width = weeks * cell;
    const height = 7 * cell;

    // Level → radius (halftone circle size) and opacity
    const radiusFor = (level) => {
      if (level <= 0) return 1.1;
      if (level === 1) return 2.2;
      if (level === 2) return 3.2;
      if (level === 3) return 4.1;
      return 5.0;
    };
    const opacityFor = (level) => {
      if (level <= 0) return 0.22;
      if (level === 1) return 0.45;
      if (level === 2) return 0.65;
      if (level === 3) return 0.85;
      return 1;
    };

    let circles = '';
    for (let i = 0; i < padded.length; i += 1) {
      const day = padded[i];
      const week = Math.floor(i / 7);
      const dow = i % 7;
      const cx = week * cell + cell / 2;
      const cy = dow * cell + cell / 2;
      const level = day.level || 0;
      const r = radiusFor(level);
      const op = opacityFor(level);
      const title = day.date
        ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
        : '';
      circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" opacity="${op}"><title>${title}</title></circle>`;
    }

    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="presentation" aria-hidden="true">${circles}</svg>`;

    const total = days.reduce((sum, d) => sum + (d.count || 0), 0);
    if (totalEl) {
      totalEl.textContent = `${total.toLocaleString()} CONTRIBUTIONS IN THE LAST YEAR`;
    }
  }

  async function initGhChart() {
    const host = document.getElementById('gh-chart');
    const totalEl = document.getElementById('gh-total');
    if (!host) return;

    try {
      const res = await fetch('https://github-contributions-api.jogruber.de/v4/Tannntannn?y=last');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const days = Array.isArray(data.contributions) ? data.contributions : [];
      renderGhChart(days);
    } catch (err) {
      if (totalEl) {
        totalEl.innerHTML = 'Could not load chart — <a class="ext" href="https://github.com/Tannntannn" target="_blank" rel="noopener noreferrer">view on GitHub</a>';
      }
      host.innerHTML = '';
    }
  }

  function setThemeMode(mode, event) {
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);

    const apply = () => {
      const resolved = resolveThemeFromMode(mode);
      html.classList.toggle('dark', resolved === 'dark');
      html.dataset.theme = resolved;
      syncThemeButtons(mode === 'system' || !mode ? 'system' : mode);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!event || !document.startViewTransition || reduced) {
      apply();
      return;
    }

    const x = event.clientX ?? window.innerWidth / 2;
    const y = event.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(apply);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 540,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }).catch(() => {});
  }

  function syncThemeButtons(mode) {
    document.querySelectorAll('[data-theme-opt]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.themeOpt === mode);
    });

    if (themeToggleMobile) {
      const resolved = resolveThemeFromMode(mode === 'system' ? null : mode);
      themeToggleMobile.setAttribute(
        'aria-label',
        `Theme: ${mode === 'system' ? 'system' : resolved}. Click to cycle.`
      );
    }
  }

  function nextThemeMode() {
    const stored = getStoredTheme();
    if (!stored) return 'light';
    if (stored === 'light') return 'dark';
    return 'system';
  }

  function initTheme() {
    const stored = getStoredTheme();
    setThemeMode(stored || 'system');

    document.querySelectorAll('[data-theme-opt]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        setThemeMode(btn.dataset.themeOpt, event);
      });
    });

    themeToggleMobile?.addEventListener('click', (event) => {
      setThemeMode(nextThemeMode(), event);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!getStoredTheme()) setThemeMode('system');
    });
  }

  function setMenuOpen(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }

  function initMobileMenu() {
    menuToggle?.addEventListener('click', () => {
      setMenuOpen(mobileMenu.hidden);
    });

    mobileMenu?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    });
  }

  function updateActiveNav() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    const sections = ['contact', 'github', 'stack', 'experience', 'work', 'services', 'about', 'hero'];
    const offset = 120;
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;

    let current = 'hero';
    if (atBottom) {
      current = 'contact';
    } else {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - offset) {
          current = id;
          break;
        }
      }
    }

    links.forEach((link) => {
      const match = link.dataset.section === current;
      link.classList.toggle('is-active', match);
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function initScrollSpy() {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  function observeReveal(el) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      requestAnimationFrame(() => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    observer.observe(el);
  }

  function initReveal() {
    document.querySelectorAll('.reveal').forEach(observeReveal);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderProjects() {
    if (!workGrid || typeof PROJECTS === 'undefined') return;

    const filtered =
      activeFilter === 'all'
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeFilter);

    if (filtered.length === 0) {
      workGrid.innerHTML = '<p class="work-empty">No projects in this category yet.</p>';
      return;
    }

    workGrid.innerHTML = filtered
      .map((p, index) => {
        const hasUrl = Boolean(p.url);
        const title = escapeHtml(p.title);
        const blurb = escapeHtml(p.blurb || p.desc);
        const year = escapeHtml(p.year);
        const img = escapeHtml(p.img);
        const cat = escapeHtml(p.categoryLabel || p.category);
        const url = hasUrl ? escapeHtml(p.url) : '';
        const idx = String(index + 1).padStart(2, '0');
        const flip = index % 2 === 1 ? ' project--flip' : '';

        const shotInner = `
          <div class="project__chrome" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div class="project__frame">
            <img src="${img}" alt="" loading="lazy" width="960" height="600">
          </div>`;

        const media = hasUrl
          ? `<a href="${url}" class="project__shot" target="_blank" rel="noopener noreferrer" aria-label="Open ${title}">${shotInner}</a>`
          : `<div class="project__shot" role="img" aria-label="${title}">${shotInner}</div>`;

        const titleBlock = hasUrl
          ? `<a href="${url}" class="project__title" target="_blank" rel="noopener noreferrer">${title}</a>`
          : `<h3 class="project__title">${title}</h3>`;

        const action = hasUrl
          ? `<a href="${url}" class="project__cta" target="_blank" rel="noopener noreferrer">${/github\.com/i.test(p.url) ? 'repo ↗' : 'visit ↗'}</a>`
          : `<span class="project__cta project__cta--static">android app</span>`;

        const tags = p.tags.map((tag) => escapeHtml(tag)).join('<span aria-hidden="true"> · </span>');

        return `
      <article class="project${flip} reveal">
        ${media}
        <div class="project__body">
          <div class="project__meta">
            <span>${idx}</span>
            <span>${cat}</span>
            <span>${year}</span>
          </div>
          ${titleBlock}
          <p class="project__blurb">${blurb}</p>
          <div class="project__foot">
            <p class="project__tags">${tags}</p>
            ${action}
          </div>
        </div>
      </article>`;
      })
      .join('');

    workGrid.querySelectorAll('.reveal').forEach(observeReveal);
  }

  function initProjectFilters() {
    if (!filterBar || typeof PROJECT_FILTERS === 'undefined') return;

    filterBar.innerHTML = PROJECT_FILTERS.map((f) => {
      const count = countProjectsForCategory(f.value);
      const isActive = f.value === 'all';
      return `<button type="button" class="filter-tab ${isActive ? 'is-active' : ''}" data-filter="${f.value}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(f.label)} <span class="filter-tab__count">${count}</span></button>`;
    }).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      filterBar.querySelectorAll('.filter-tab').forEach((chip) => {
        const match = chip.dataset.filter === activeFilter;
        chip.classList.toggle('is-active', match);
        chip.setAttribute('aria-pressed', match ? 'true' : 'false');
      });
      renderProjects();
    });
  }

  /* —— Soft site-wide space field (subtle in light + dark) —— */
  function initSpaceField() {
    const canvas = document.getElementById('space-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let raf = 0;
    let running = false;
    let scrollP = 0;
    let pointer = { x: 0.5, y: 0.5, active: false };
    let ink = { r: 10, g: 10, b: 10 };
    let isDark = true;
    let time = 0;

    function readTheme() {
      isDark = document.documentElement.classList.contains('dark')
        || document.documentElement.dataset.theme === 'dark';
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
      const hex = raw.replace('#', '');
      if (hex.length === 6) {
        ink = {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }
    }

    // Light mode stays softer so the white page doesn't look dirty
    function themeMul() {
      return isDark ? 1 : 0.52;
    }

    function scrollProgress() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    }

    function makeStars() {
      const area = width * height;
      // A little more presence, still calm
      const baseFar = Math.min(95, Math.floor(area / 16000));
      const baseMid = Math.min(40, Math.floor(area / 36000));
      const baseNear = Math.min(16, Math.floor(area / 80000));
      const list = [];

      function push(count, layer) {
        for (let i = 0; i < count; i += 1) {
          list.push({
            layer,
            x: Math.random(),
            y: Math.random(),
            r: layer === 'far' ? 0.5 + Math.random() * 0.5
              : layer === 'mid' ? 0.7 + Math.random() * 0.65
              : 0.95 + Math.random() * 0.85,
            base: layer === 'far' ? 0.08 + Math.random() * 0.1
              : layer === 'mid' ? 0.12 + Math.random() * 0.12
              : 0.16 + Math.random() * 0.14,
            tw: Math.random() * Math.PI * 2,
            drift: (Math.random() - 0.5) * (layer === 'near' ? 0.00018 : layer === 'mid' ? 0.0001 : 0.00005),
          });
        }
      }

      push(baseFar, 'far');
      push(baseMid, 'mid');
      push(baseNear, 'near');
      stars = list;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
      if (reducedMotion.matches) drawStatic();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      const p = scrollProgress();
      const density = (0.65 + p * 0.4) * themeMul();
      stars.forEach((s) => {
        if (s.layer === 'near' && p < 0.25) return;
        const alpha = Math.min(isDark ? 0.36 : 0.18, s.base * density);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${alpha})`;
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function frame(ts) {
      if (!running) return;
      time = ts * 0.001;
      scrollP = scrollProgress();
      ctx.clearRect(0, 0, width, height);

      const density = (0.62 + scrollP * 0.5) * themeMul();
      const speed = 0.4 + scrollP * 0.65;
      const wake = finePointer.matches && pointer.active;
      const px = pointer.x * width;
      const py = pointer.y * height;
      const wakeR = 120 + scrollP * 50;

      // Soft cursor aura (interactive without being loud)
      if (wake) {
        const aura = ctx.createRadialGradient(px, py, 0, px, py, wakeR);
        const auraA = (isDark ? 0.045 : 0.028) * (0.7 + scrollP * 0.4);
        aura.addColorStop(0, `rgba(${ink.r},${ink.g},${ink.b},${auraA})`);
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.fillRect(px - wakeR, py - wakeR, wakeR * 2, wakeR * 2);
      }

      const pull = {
        far: 5 + scrollP * 5,
        mid: 10 + scrollP * 10,
        near: 18 + scrollP * 16,
      };

      const drawn = [];

      stars.forEach((s) => {
        if (s.layer === 'near' && scrollP < 0.18) return;

        s.x += s.drift * speed;
        if (s.x < -0.02) s.x = 1.02;
        if (s.x > 1.02) s.x = -0.02;

        let ox = 0;
        let oy = 0;
        if (wake) {
          ox = (pointer.x - 0.5) * pull[s.layer];
          oy = (pointer.y - 0.5) * pull[s.layer];
        }

        const x = s.x * width + ox;
        const y = s.y * height + oy;
        let alpha = s.base * density;

        if (s.layer !== 'far') {
          alpha *= 0.9 + 0.1 * Math.sin(time * (0.6 + scrollP * 0.4) + s.tw);
        }

        if (wake) {
          const d = Math.hypot(x - px, y - py);
          if (d < wakeR) {
            alpha *= 1 + (1 - d / wakeR) * 0.55;
            drawn.push({ x, y, d, layer: s.layer });
          }
        }

        alpha = Math.min(isDark ? 0.42 : 0.2, alpha);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${alpha})`;
        ctx.arc(x, y, s.r * (1 + scrollP * 0.12), 0, Math.PI * 2);
        ctx.fill();
      });

      // Tiny constellation lines near the cursor
      if (wake && drawn.length > 1) {
        drawn.sort((a, b) => a.d - b.d);
        const near = drawn.slice(0, 8);
        ctx.lineWidth = 0.6;
        for (let i = 0; i < near.length; i += 1) {
          for (let j = i + 1; j < near.length; j += 1) {
            const a = near[i];
            const b = near[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist > 90) continue;
            const lineA = (isDark ? 0.1 : 0.05) * (1 - dist / 90);
            ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${lineA})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reducedMotion.matches) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    function onPointer(e) {
      if (!finePointer.matches) return;
      pointer.x = e.clientX / Math.max(1, width);
      pointer.y = e.clientY / Math.max(1, height);
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
    }

    readTheme();
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', () => {
      scrollP = scrollProgress();
      if (reducedMotion.matches) drawStatic();
    }, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!reducedMotion.matches) start();
    });

    const themeObs = new MutationObserver(() => {
      readTheme();
      if (reducedMotion.matches) drawStatic();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        stop();
        drawStatic();
      } else {
        start();
      }
    });

    if (reducedMotion.matches) drawStatic();
    else start();
  }

  /* —— Stack icon marquee —— */
  const STACK_TOOLS = [
    { name: 'JavaScript', icon: 'js' },
    { name: 'Python', icon: 'py' },
    { name: 'Java', icon: 'java' },
    { name: 'C#', icon: 'cs' },
    { name: 'React', icon: 'react' },
    { name: 'Node.js', icon: 'node' },
    { name: 'Express', icon: 'express' },
    { name: 'FastAPI', icon: 'api' },
    { name: 'Tailwind', icon: 'wind' },
    { name: 'Vite', icon: 'vite' },
    { name: 'Firebase', icon: 'fire' },
    { name: 'Supabase', icon: 'base' },
    { name: 'MySQL', icon: 'db' },
    { name: 'PostgreSQL', icon: 'db' },
    { name: 'WordPress', icon: 'wp' },
    { name: 'Elementor', icon: 'el' },
    { name: 'Android', icon: 'android' },
    { name: 'Figma', icon: 'figma' },
  ];

  function stackIcon(kind) {
    const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      js: '<path d="M7 8v8l4 2"/><path d="M17 8c-2 0-3 1-3 2.5S15 13 17 13s3 .8 3 2.2-1.2 2.8-3.2 2.8c-1.3 0-2.3-.4-3-.9"/>',
      py: '<path d="M12 3c-3 0-4 1.5-4 4v2h8V7c0-2.5-1-4-4-4z"/><path d="M12 21c3 0 4-1.5 4-4v-2H8v2c0 2.5 1 4 4 4z"/><circle cx="9.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/><circle cx="14.5" cy="17.5" r=".7" fill="currentColor" stroke="none"/>',
      java: '<path d="M9 18c2 1.2 5 1.2 7 0"/><path d="M8 15c2.5 1.4 6 1.4 8.5 0"/><path d="M12 4c-1.5 2 2.5 3 0 5-2.5-2 1.5-3 0-5z"/><path d="M8 21h8"/>',
      cs: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M10 9c-2 0-3 1.5-3 3s1 3 3 3"/><path d="M14 12h4"/>',
      react: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/>',
      node: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12v9"/>',
      express: '<path d="M4 8h10"/><path d="M4 12h16"/><path d="M4 16h10"/><path d="M16 8l4 4-4 4"/>',
      api: '<path d="M4 12h4l2-6 4 12 2-6h4"/>',
      wind: '<path d="M3 8h11a3 3 0 100-6"/><path d="M3 12h15a3 3 0 110 6"/><path d="M3 16h8a3 3 0 110 6"/>',
      vite: '<path d="M12 3l8 15H4L12 3z"/><path d="M12 10v8"/>',
      fire: '<path d="M12 21c4 0 6-2.5 6-6 0-3-2-5-3-7-1 2-2 3-3 3s-1.5-2-2-4c-2 2-4 4.5-4 8 0 3.5 2 6 6 6z"/>',
      base: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
      db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/>',
      wp: '<circle cx="12" cy="12" r="9"/><path d="M6.5 12c0 2 1 4.5 3.5 6.2L6.8 9.2A5.4 5.4 0 006.5 12z"/><path d="M17.8 11.2c0-.6 0-1.1-.2-1.6H9.4l.7 2h2.6l-2.2 6.4c1.3.4 2.5.3 3.5-.3l2.5-7.4c.2.5.3 1 .3 1.5 0 2.4-1.3 4.2-4.2 6.3"/>',
      el: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16M9 9v10"/>',
      android: '<path d="M8 10v7a2 2 0 002 2h4a2 2 0 002-2v-7"/><path d="M8 10h8"/><path d="M9 7l-1.2-2M15 7l1.2-2"/><circle cx="9.5" cy="12.5" r=".7" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12.5" r=".7" fill="currentColor" stroke="none"/>',
      figma: '<path d="M12 3H9a3 3 0 000 6h3V3z"/><path d="M12 9H9a3 3 0 000 6h3V9z"/><path d="M12 15H9a3 3 0 103 3v-3z"/><path d="M12 3h3a3 3 0 010 6h-3V3z"/><circle cx="15" cy="12" r="3"/>',
    };
    return `<svg ${common}>${paths[kind] || paths.js}</svg>`;
  }

  function initStackMarquee() {
    const root = document.querySelector('[data-marquee]');
    const track = document.querySelector('[data-marquee-track]');
    if (!root || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tile = (tool) =>
      `<span class="stack-tile"><span class="stack-tile__icon">${stackIcon(tool.icon)}</span><span>${escapeHtml(tool.name)}</span></span>`;

    const row = STACK_TOOLS.map(tile).join('');
    if (reduced) {
      root.classList.add('is-static');
      track.innerHTML = row;
      return;
    }

    // Duplicate for seamless loop (translate -50%)
    track.innerHTML = row + row;
    track.setAttribute('aria-hidden', 'true');
  }

  function init() {
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initReveal();
    initProjectFilters();
    renderProjects();
    initGhChart();
    initSpaceField();
    initStackMarquee();
    const y = String(new Date().getFullYear());
    if (yearEl) yearEl.textContent = y;
    if (yearFooter) yearFooter.textContent = y;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
