(function () {
  'use strict';

  const html = document.documentElement;
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeLabel = document.getElementById('theme-label');
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

  function updateGhChart(resolved) {
    const chart = document.getElementById('gh-chart');
    if (!chart) return;
    const color = resolved === 'dark' ? '8a8a92' : '525252';
    chart.src = `https://ghchart.rshah.org/${color}/Tannntannn`;
  }

  function setThemeMode(mode) {
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);

    const resolved = resolveThemeFromMode(mode);
    html.classList.toggle('dark', resolved === 'dark');
    html.dataset.theme = resolved;

    const label = getStoredTheme() ? resolved : 'system';
    if (themeLabel) themeLabel.textContent = label;

    const aria = `Theme: ${label}. Click to cycle.`;
    themeToggle?.setAttribute('aria-label', aria);
    themeToggleMobile?.setAttribute('aria-label', aria);
    updateGhChart(resolved);
  }

  function nextThemeMode() {
    const stored = getStoredTheme();
    if (!stored) return 'light';
    if (stored === 'light') return 'dark';
    return 'system';
  }

  function dropletThemeSwitch(event) {
    const next = nextThemeMode();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduced) {
      setThemeMode(next);
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setThemeMode(next);
    });

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

  function initTheme() {
    const stored = getStoredTheme();
    setThemeMode(stored || 'system');

    themeToggle?.addEventListener('click', dropletThemeSwitch);
    themeToggleMobile?.addEventListener('click', dropletThemeSwitch);

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
      .map((p) => {
        const hasUrl = Boolean(p.url);
        const title = escapeHtml(p.title);
        const desc = escapeHtml(p.desc);
        const year = escapeHtml(p.year);
        const img = escapeHtml(p.img);
        const url = hasUrl ? escapeHtml(p.url) : '';

        const media = hasUrl
          ? `<a href="${url}" class="project-card__media" target="_blank" rel="noopener noreferrer" aria-label="Open ${title}"><img src="${img}" alt="${title}" loading="lazy" width="400" height="250"></a>`
          : `<div class="project-card__media"><img src="${img}" alt="${title}" loading="lazy" width="400" height="250"></div>`;

        const titleBlock = hasUrl
          ? `<a href="${url}" class="project-card__title" target="_blank" rel="noopener noreferrer">${title}</a>`
          : `<h3 class="project-card__title">${title}</h3>`;

        const action = hasUrl
          ? `<a href="${url}" class="link-mono" target="_blank" rel="noopener noreferrer">visit ↗</a>`
          : `<span class="link-mono link-mono--static">android app</span>`;

        const tags = p.tags
          .map(
            (tag, i) =>
              `<span class="tag ${i === 0 ? 'tag--accent' : ''}">${escapeHtml(tag)}</span>`
          )
          .join('');

        return `
      <article class="project-card reveal">
        ${media}
        <div>
          ${titleBlock}
          <p class="project-card__desc">${desc}</p>
          <div class="tag-list">${tags}</div>
        </div>
        <div class="project-card__aside">
          <span class="project-card__year">${year}</span>
          ${action}
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
      return `<button type="button" class="filter-chip ${isActive ? 'is-active' : ''}" data-filter="${f.value}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(f.label)} (${count})</button>`;
    }).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      filterBar.querySelectorAll('.filter-chip').forEach((chip) => {
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
