(function () {
  'use strict';

  const html = document.documentElement;
  const header = document.getElementById('site-header');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const workGrid = document.getElementById('work-grid');
  const filterBar = document.getElementById('project-filters');
  const yearEl = document.getElementById('year');

  let activeFilter = 'all';

  function countProjectsForCategory(categoryValue) {
    if (categoryValue === 'all') return PROJECTS.length;
    return PROJECTS.filter((p) => p.category === categoryValue).length;
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'dark';
  }

  function applyTheme(theme) {
    html.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    themeToggle?.addEventListener('click', () => {
      applyTheme(html.classList.contains('dark') ? 'light' : 'dark');
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

  function initHeaderScroll() {
    const onScroll = () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 16);
      updateActiveNav();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function updateActiveNav() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    const sections = ['contact', 'about', 'stack', 'experience', 'work', 'services', 'hero'];
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

  function observeReveal(el) {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
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
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
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
      workGrid.innerHTML =
        '<p class="work-empty">No projects in this category yet.</p>';
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
          ? `<a href="${url}" class="project-row__media" target="_blank" rel="noopener noreferrer" aria-label="Open ${title}"><img src="${img}" alt="${title}" loading="lazy" width="400" height="250"></a>`
          : `<div class="project-row__media"><img src="${img}" alt="${title}" loading="lazy" width="400" height="250"></div>`;

        const titleBlock = hasUrl
          ? `<a href="${url}" class="project-row__title" target="_blank" rel="noopener noreferrer">${title}</a>`
          : `<h3 class="project-row__title">${title}</h3>`;

        const action = hasUrl
          ? `<a href="${url}" class="link-arrow" target="_blank" rel="noopener noreferrer">visit ↗</a>`
          : `<span class="link-arrow link-arrow--static">Android app</span>`;

        const tags = p.tags
          .map(
            (tag, i) =>
              `<span class="tag ${i === 0 ? 'tag--accent' : ''}">${escapeHtml(tag)}</span>`
          )
          .join('');

        return `
      <article class="project-row reveal">
        ${media}
        <div class="project-row__body">
          ${titleBlock}
          <p class="project-row__desc">${desc}</p>
          <div class="tag-list">${tags}</div>
        </div>
        <div class="project-row__aside">
          <span class="project-row__year">${year}</span>
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
    initHeaderScroll();
    initReveal();
    initProjectFilters();
    renderProjects();
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
