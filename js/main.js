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
    const sections = ['contact', 'play', 'github', 'stack', 'experience', 'work', 'services', 'about', 'hero'];
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
        const primaryHref = p.url || p.apk;
        const hasUrl = Boolean(primaryHref);
        const title = escapeHtml(p.title);
        const blurb = escapeHtml(p.blurb || p.desc);
        const year = escapeHtml(p.year);
        const img = escapeHtml(p.img);
        const cat = escapeHtml(p.categoryLabel || p.category);
        const url = hasUrl ? escapeHtml(primaryHref) : '';
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

        const ctas = [];
        if (p.apk) {
          const apkLabel = /expo\.dev/i.test(p.apk) ? 'app ↗' : 'apk ↗';
          ctas.push(
            `<a href="${escapeHtml(p.apk)}" class="project__cta" target="_blank" rel="noopener noreferrer">${apkLabel}</a>`
          );
        }
        if (p.url && p.url !== p.apk) {
          const label = /github\.com/i.test(p.url) ? 'repo ↗' : 'visit ↗';
          ctas.push(
            `<a href="${escapeHtml(p.url)}" class="project__cta" target="_blank" rel="noopener noreferrer">${label}</a>`
          );
        }
        const action = ctas.length
          ? `<span class="project__actions">${ctas.join('<span class="project__actions-sep" aria-hidden="true"> · </span>')}</span>`
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
    let wakeStrength = 0; // 0–1, fades after touch ends (mobile-friendly)
    let ink = { r: 10, g: 10, b: 10 };
    let isDark = true;
    let time = 0;
    let ripples = []; // tap ripples for mobile

    let nebula = [];
    let dust = [];
    let meteors = [];
    let lastMeteor = 0;
    let lastScrollY = 0;
    let scrollVel = 0;
    let scrollBoost = 0;

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

    function themeMul() {
      return isDark ? 1 : 0.82;
    }

    function scrollProgress() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    }

    function makeStars() {
      const area = width * height;
      const list = [];
      const far = Math.min(180, Math.floor(area / 9000));
      const mid = Math.min(70, Math.floor(area / 20000));
      const near = Math.min(32, Math.floor(area / 42000));

      function push(count, layer) {
        for (let i = 0; i < count; i += 1) {
          list.push({
            layer,
            x: Math.random(),
            y: Math.random(),
            r: layer === 'far' ? 0.45 + Math.random() * 0.55
              : layer === 'mid' ? 0.7 + Math.random() * 0.7
              : 1.05 + Math.random() * 1.05,
            base: layer === 'far' ? 0.07 + Math.random() * 0.1
              : layer === 'mid' ? 0.12 + Math.random() * 0.13
              : 0.18 + Math.random() * 0.16,
            tw: Math.random() * Math.PI * 2,
            drift: (Math.random() - 0.5) * (layer === 'near' ? 0.00022 : layer === 'mid' ? 0.00012 : 0.00006),
            depth: layer === 'far' ? 0.18 : layer === 'mid' ? 0.42 : 0.78,
            pulse: 0.4 + Math.random() * 1.2,
          });
        }
      }

      push(far, 'far');
      push(mid, 'mid');
      push(near, 'near');
      stars = list;

      dust = [];
      const dustN = Math.min(70, Math.floor(area / 22000));
      for (let i = 0; i < dustN; i += 1) {
        dust.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.35 + Math.random() * 0.45,
          a: 0.06 + Math.random() * 0.08,
          drift: (Math.random() - 0.5) * 0.00012,
          depth: 0.25 + Math.random() * 0.35,
        });
      }

      nebula = [
        { x: 0.18, y: 0.22, r: 0.38, ox: 0.18, oy: 0.22, t: 0 },
        { x: 0.78, y: 0.7, r: 0.42, ox: 0.78, oy: 0.7, t: 1.7 },
        { x: 0.52, y: 0.4, r: 0.28, ox: 0.52, oy: 0.4, t: 3.4 },
      ];
    }

    function wrap(v, max) {
      if (max <= 0) return 0;
      return ((v % max) + max) % max;
    }

    function starPos(s) {
      const parallax = (scrollP * height * 1.35 + scrollVel * 0.55) * s.depth;
      const shear = scrollVel * s.depth * 0.22;
      return {
        x: wrap(s.x * width + shear, width),
        y: wrap(s.y * height + parallax, height),
      };
    }
      const fromLeft = Math.random() > 0.5;
      meteors.push({
        x: fromLeft ? -0.05 : 1.05,
        y: Math.random() * 0.45,
        vx: (fromLeft ? 0.012 : -0.012) * (0.8 + Math.random() * 0.5),
        vy: 0.006 + Math.random() * 0.008,
        life: 0,
      });
      if (meteors.length > 3) meteors.shift();
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
      nebula.forEach((n) => {
        const nx = n.x * width;
        const ny = n.y * height;
        const nr = n.r * Math.max(width, height) * 0.55;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        const a = (isDark ? 0.045 : 0.028) * themeMul();
        g.addColorStop(0, `rgba(${ink.r},${ink.g},${ink.b},${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      });
      stars.forEach((s) => {
        const pos = starPos(s);
        const alpha = Math.min(isDark ? 0.55 : 0.32, s.base * density * 1.35);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${alpha})`;
        ctx.arc(pos.x, pos.y, s.r * 1.15, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function frame(ts) {
      if (!running) return;
      time = ts * 0.001;
      scrollP = scrollProgress();
      scrollBoost += (Math.min(1, Math.abs(scrollVel) / 22) - scrollBoost) * 0.28;
      scrollVel *= 0.88;
      ctx.clearRect(0, 0, width, height);

      const targetWake = pointer.active ? 1 : Math.max(0.55, scrollBoost);
      wakeStrength += (targetWake - wakeStrength) * (pointer.active ? 0.35 : 0.12);

      const ambientX = 0.5 + Math.sin(scrollP * Math.PI * 2) * 0.16;
      const ambientY = 0.42 + scrollP * 0.22;
      const usePointer = pointer.active && wakeStrength > 0.02;
      const focusX = usePointer ? pointer.x : ambientX;
      const focusY = usePointer ? pointer.y : ambientY;
      const focusMul = Math.max(wakeStrength, 0.55 + scrollP * 0.45);

      const density = (0.9 + scrollP * 0.7 + scrollBoost * 0.45) * themeMul();
      const speed = 0.7 + scrollP * 1.1 + scrollBoost * 1.4;
      const px = focusX * width;
      const py = focusY * height;
      const wakeR = (finePointer.matches ? 140 : 170) + scrollP * 60;

      nebula.forEach((n) => {
        n.x = n.ox + Math.sin(time * 0.12 + n.t) * 0.04;
        n.y = n.oy + Math.cos(time * 0.09 + n.t) * 0.03;
        const nx = n.x * width + (focusX - 0.5) * 18 * focusMul;
        const ny = n.y * height + (focusY - 0.5) * 14 * focusMul;
        const nr = n.r * Math.max(width, height) * (0.5 + scrollP * 0.08);
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        const a = (isDark ? 0.09 : 0.055) * themeMul() * (1 + scrollBoost * 0.4);
        g.addColorStop(0, `rgba(${ink.r},${ink.g},${ink.b},${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      });

      dust.forEach((d) => {
        d.x += d.drift * speed;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        const dy = wrap(d.y * height + (scrollP * height * 0.9 + scrollVel * 0.4) * (d.depth || 0.3), height);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${d.a * themeMul() * (1.2 + scrollBoost)})`;
        ctx.arc(d.x * width, dy, d.r * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (focusMul > 0.05) {
        const aura = ctx.createRadialGradient(px, py, 0, px, py, wakeR);
        const auraA = (isDark ? 0.07 : 0.04) * focusMul * (0.75 + scrollP * 0.4);
        aura.addColorStop(0, `rgba(${ink.r},${ink.g},${ink.b},${auraA})`);
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.fillRect(px - wakeR, py - wakeR, wakeR * 2, wakeR * 2);
      }

      if (ts - lastMeteor > 5200 + Math.random() * 4000) {
        spawnMeteor();
        lastMeteor = ts;
      }

      meteors = meteors.filter((m) => {
        m.life += 0.016;
        m.x += m.vx;
        m.y += m.vy;
        if (m.life > 1.4 || m.x < -0.1 || m.x > 1.1) return false;
        const a = (1 - m.life / 1.4) * (isDark ? 0.35 : 0.18) * themeMul();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${a})`;
        ctx.lineWidth = 1.15;
        ctx.moveTo(m.x * width, m.y * height);
        ctx.lineTo((m.x - m.vx * 12) * width, (m.y - m.vy * 12) * height);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${a})`;
        ctx.arc(m.x * width, m.y * height, 1.4, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ripples = ripples.filter((r) => {
        r.life += 0.016;
        if (r.life > 1) return false;
        const radius = 18 + r.life * 150;
        const a = (1 - r.life) * (isDark ? 0.22 : 0.12) * themeMul();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${a})`;
        ctx.lineWidth = 1.35 * (1 - r.life);
        ctx.arc(r.x * width, r.y * height, radius, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      const pull = {
        far: (6 + scrollP * 6) * focusMul,
        mid: (12 + scrollP * 12) * focusMul,
        near: (22 + scrollP * 18) * focusMul,
      };

      const drawn = [];

      stars.forEach((s) => {
        s.x += s.drift * speed;
        if (s.x < -0.02) s.x = 1.02;
        if (s.x > 1.02) s.x = -0.02;

        const pos = starPos(s);
        const ox = (focusX - 0.5) * pull[s.layer];
        const oy = (focusY - 0.5) * pull[s.layer];
        const x = wrap(pos.x + ox, width);
        const y = wrap(pos.y + oy, height);
        let alpha = s.base * density * 1.35;

        if (s.layer !== 'far') {
          alpha *= 0.86 + 0.14 * Math.sin(time * s.pulse + s.tw);
        }

        const d = Math.hypot(x - px, y - py);
        if (d < wakeR) {
          alpha *= 1 + (1 - d / wakeR) * 0.85 * focusMul;
        }
        if (s.layer !== 'far' || d < wakeR * 1.15) {
          drawn.push({ x, y, d, layer: s.layer });
        }

        ripples.forEach((r) => {
          const rd = Math.hypot(x - r.x * width, y - r.y * height);
          const wave = 18 + r.life * 180;
          if (Math.abs(rd - wave) < 40) {
            alpha *= 1 + (1 - r.life) * 1.1;
          }
        });

        alpha = Math.min(isDark ? 0.72 : 0.42, alpha);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${alpha})`;
        ctx.arc(x, y, s.r * (1.05 + scrollP * 0.22 + scrollBoost * 0.2), 0, Math.PI * 2);
        ctx.fill();
      });

      const ringR = 70 + scrollP * (Math.min(width, height) * 0.42) + scrollBoost * 40;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${(isDark ? 0.16 : 0.1) * (0.45 + scrollBoost)})`;
      ctx.lineWidth = 1;
      ctx.arc(px, py, ringR, 0, Math.PI * 2);
      ctx.stroke();

      if (drawn.length > 1) {
        drawn.sort((a, b) => a.d - b.d);
        const near = drawn.filter((n) => n.layer !== 'far').slice(0, 14);
        ctx.lineWidth = 0.7;
        for (let i = 0; i < near.length; i += 1) {
          for (let j = i + 1; j < near.length; j += 1) {
            const a = near[i];
            const b = near[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist > 120 + scrollBoost * 40) continue;
            const lineA = (isDark ? 0.2 : 0.12) * (1 - dist / 160) * (0.55 + scrollBoost);
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

    function setPointerFromEvent(e) {
      pointer.x = e.clientX / Math.max(1, width);
      pointer.y = e.clientY / Math.max(1, height);
    }

    function onPointerMove(e) {
      setPointerFromEvent(e);
      pointer.active = true;
    }

    function onPointerDown(e) {
      setPointerFromEvent(e);
      pointer.active = true;
      ripples.push({ x: pointer.x, y: pointer.y, life: 0 });
      if (ripples.length > 5) ripples.shift();
      if (Math.random() > 0.65) spawnMeteor();
    }

    function onPointerUp() {
      pointer.active = false;
    }

    readTheme();
    resize();
    window.addEventListener('resize', resize, { passive: true });
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const delta = y - lastScrollY;
      scrollVel += delta;
      lastScrollY = y;
      scrollP = scrollProgress();
      if (Math.abs(delta) > 6) {
        ripples.push({
          x: 0.5 + (Math.random() - 0.5) * 0.4,
          y: delta > 0 ? 0.62 : 0.28,
          life: 0,
        });
        if (ripples.length > 6) ripples.shift();
      }
      if (reducedMotion.matches) drawStatic();
    }, { passive: true });
    window.addEventListener('wheel', (e) => {
      scrollVel += e.deltaY * 0.45;
    }, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('pointerleave', onPointerUp, { passive: true });
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

  function initPlayground() {
    const canvas = document.getElementById('play-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lines = ['CHANGE IT', '& DESIGN'];
    let dpr = 1;
    let w = 0;
    let h = 0;
    let letters = [];
    let pointer = { x: 0, y: 0, down: false, inside: false };
    let raf = 0;
    let running = false;
    let ink = { r: 10, g: 10, b: 10 };
    let isDark = false;
    let burst = [];

    function readInk() {
      isDark = document.documentElement.classList.contains('dark');
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().replace('#', '');
      if (raw.length === 6) {
        ink = {
          r: parseInt(raw.slice(0, 2), 16),
          g: parseInt(raw.slice(2, 4), 16),
          b: parseInt(raw.slice(4, 6), 16),
        };
      }
    }

    function layout() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const size = Math.max(22, Math.min(42, w / 12));
      ctx.font = `600 ${size}px "Source Serif 4", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const next = [];
      const gapY = size * 1.35;
      const startY = h / 2 - ((lines.length - 1) * gapY) / 2;
      lines.forEach((line, li) => {
        const chars = line.split('');
        const widths = chars.map((ch) => (ch === ' ' ? size * 0.38 : ctx.measureText(ch).width + 6));
        const total = widths.reduce((a, b) => a + b, 0);
        let x = (w - total) / 2;
        chars.forEach((ch, ci) => {
          const cw = widths[ci];
          const hx = x + cw / 2;
          const hy = startY + li * gapY;
          const prev = letters[next.length];
          next.push({
            ch,
            hx,
            hy,
            x: prev ? prev.x : hx,
            y: prev ? prev.y : hy,
            vx: prev ? prev.vx : 0,
            vy: prev ? prev.vy : 0,
            space: ch === ' ',
          });
          x += cw;
        });
      });
      letters = next;
    }

    function scatter(cx, cy, power) {
      letters.forEach((p) => {
        if (p.space) return;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.max(24, Math.hypot(dx, dy));
        p.vx += (dx / d) * power;
        p.vy += (dy / d) * power;
      });
    }

    function reform() {
      letters.forEach((p) => {
        p.vx *= 0.2;
        p.vy *= 0.2;
      });
    }

    function addBurst(x, y) {
      for (let i = 0; i < 14; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.2 + Math.random() * 3.2;
        burst.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
      }
    }

    function step() {
      if (!running) return;
      readInk();
      ctx.clearRect(0, 0, w, h);

      const magnet = pointer.inside ? 1 : 0;
      letters.forEach((p) => {
        if (p.space) return;
        const toHomeX = (p.hx - p.x) * 0.045;
        const toHomeY = (p.hy - p.y) * 0.045;
        p.vx += toHomeX;
        p.vy += toHomeY;

        if (magnet) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 140 && d > 1) {
            const pull = pointer.down ? 0.08 : 0.035;
            p.vx += (dx / d) * pull * (1 - d / 140) * 18;
            p.vy += (dy / d) * pull * (1 - d / 140) * 18;
          }
        }

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;
      });

      // constellation between nearby letters
      ctx.lineWidth = 0.7;
      for (let i = 0; i < letters.length; i += 1) {
        const a = letters[i];
        if (a.space) continue;
        for (let j = i + 1; j < letters.length; j += 1) {
          const b = letters[j];
          if (b.space) continue;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 78) continue;
          const alpha = (isDark ? 0.18 : 0.12) * (1 - dist / 78);
          ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const size = Math.max(22, Math.min(42, w / 12));
      ctx.font = `600 ${size}px "Source Serif 4", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`;
      letters.forEach((p) => {
        if (p.space) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.vx * 0.02);
        ctx.fillText(p.ch, 0, 0);
        ctx.restore();
      });

      burst = burst.filter((dot) => {
        dot.life -= 0.02;
        if (dot.life <= 0) return false;
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.vx *= 0.96;
        dot.vy *= 0.96;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${dot.life * 0.45})`;
        ctx.arc(dot.x, dot.y, 1.6 * dot.life, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      if (pointer.inside) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${isDark ? 0.28 : 0.18})`;
        ctx.lineWidth = 1;
        ctx.arc(pointer.x, pointer.y, pointer.down ? 18 : 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(step);
    }

    function start() {
      if (running || reduced.matches) return;
      running = true;
      raf = requestAnimationFrame(step);
    }

    function localPoint(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }

    canvas.addEventListener('pointerenter', (e) => {
      pointer.inside = true;
      localPoint(e);
    });
    canvas.addEventListener('pointerleave', () => {
      pointer.inside = false;
      pointer.down = false;
    });
    canvas.addEventListener('pointermove', (e) => {
      localPoint(e);
      pointer.inside = true;
    });
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      localPoint(e);
      pointer.down = true;
      pointer.inside = true;
      scatter(pointer.x, pointer.y, 7.5);
      addBurst(pointer.x, pointer.y);
    });
    canvas.addEventListener('pointerup', () => {
      pointer.down = false;
    });

    document.querySelector('[data-play-scatter]')?.addEventListener('click', () => {
      scatter(w / 2, h / 2, 11);
      addBurst(w / 2, h / 2);
    });
    document.querySelector('[data-play-reform]')?.addEventListener('click', reform);

    window.addEventListener('resize', layout, { passive: true });
    new MutationObserver(() => readInk()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    readInk();
    layout();
    if (reduced.matches) {
      ctx.clearRect(0, 0, w, h);
      const size = Math.max(22, Math.min(42, w / 12));
      ctx.font = `600 ${size}px "Source Serif 4", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`;
      letters.forEach((p) => {
        if (!p.space) ctx.fillText(p.ch, p.hx, p.hy);
      });
      return;
    }
    start();
  }

  function initCertModal() {
    const modal = document.getElementById('cert-modal');
    if (!modal) return;

    const img = document.getElementById('cert-modal-img');
    const titleEl = document.getElementById('cert-modal-title');
    const pdfLink = document.getElementById('cert-modal-pdf');
    const openers = document.querySelectorAll('[data-cert-open]');
    let lastFocus = null;

    function openCert(trigger) {
      lastFocus = trigger;
      const src = trigger.getAttribute('data-cert-src') || '';
      const pdf = trigger.getAttribute('data-cert-pdf') || '';
      const title = trigger.getAttribute('data-cert-title') || 'Certificate';
      const alt = trigger.getAttribute('data-cert-alt') || title;

      if (img) {
        img.src = src;
        img.alt = alt;
      }
      if (titleEl) titleEl.textContent = title;
      if (pdfLink) {
        if (pdf) {
          pdfLink.href = pdf;
          pdfLink.hidden = false;
        } else {
          pdfLink.hidden = true;
        }
      }

      modal.hidden = false;
      document.body.classList.add('cert-modal-open');
      const closeBtn = modal.querySelector('.cert-modal__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeCert() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove('cert-modal-open');
      if (img) {
        img.removeAttribute('src');
        img.alt = '';
      }
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
      lastFocus = null;
    }

    openers.forEach((btn) => {
      btn.addEventListener('click', () => openCert(btn));
    });

    modal.querySelectorAll('[data-cert-close]').forEach((el) => {
      el.addEventListener('click', closeCert);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) {
        e.preventDefault();
        closeCert();
      }
    });
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
    initCertModal();
    initPlayground();
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
