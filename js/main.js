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
    const sections = ['contact', 'github', 'stack', 'experience', 'work', 'services', 'hero'];
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
          ? `<a href="${url}" class="project__cta" target="_blank" rel="noopener noreferrer">visit ↗</a>`
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

  function init() {
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initReveal();
    initProjectFilters();
    renderProjects();
    initGhChart();
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
