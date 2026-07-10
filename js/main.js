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

  /* ── Theme ── */
  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    themeToggle?.addEventListener('click', () => {
      applyTheme(html.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* ── Mobile menu ── */
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

  /* ── Header scroll state ── */
  function initHeaderScroll() {
    const onScroll = () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 20);
      updateActiveNav();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll spy ── */
  function updateActiveNav() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    const sections = ['contact', 'about', 'experience', 'work', 'services', 'hero'];
    const offset = 130;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;

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

  /* ── Reveal on scroll ── */
  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ── Projects ── */
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
        const imageBlock = hasUrl
          ? `<a href="${p.url}" class="project-card__image" target="_blank" rel="noopener noreferrer" aria-label="Open ${p.title}"><img src="${p.img}" alt="${p.title}" loading="lazy" width="600" height="340"></a>`
          : `<div class="project-card__image"><img src="${p.img}" alt="${p.title}" loading="lazy" width="600" height="340"></div>`;
        const titleBlock = hasUrl
          ? `<a href="${p.url}" class="project-card__title" target="_blank" rel="noopener noreferrer">${p.title}</a>`
          : `<h3 class="project-card__title">${p.title}</h3>`;
        const actionBlock = hasUrl
          ? `<a href="${p.url}" class="link-arrow" target="_blank" rel="noopener noreferrer">Visit live site →</a>`
          : `<span class="link-arrow link-arrow--static">Android app</span>`;

        return `
      <article class="project-card reveal">
        ${imageBlock}
        <div class="project-card__body">
          <div class="tag-list">
            ${p.tags
              .map(
                (tag, i) =>
                  `<span class="tag ${i === 0 ? 'tag--accent' : ''}">${tag}</span>`
              )
              .join('')}
          </div>
          ${titleBlock}
          <p class="project-card__desc">${p.desc}</p>
          <div class="project-card__footer">
            ${actionBlock}
            <span class="project-card__year">${p.year}</span>
          </div>
        </div>
      </article>`;
      })
      .join('');

    workGrid.querySelectorAll('.reveal').forEach((el) => {
      requestAnimationFrame(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(el);
      });
    });
  }

  function initProjectFilters() {
    if (!filterBar || typeof PROJECT_FILTERS === 'undefined') return;

    filterBar.innerHTML = PROJECT_FILTERS.map((f) => {
      const count = countProjectsForCategory(f.value);
      const label = f.value === 'all' ? `${f.label} (${count})` : `${f.label} (${count})`;
      const isActive = f.value === 'all';
      return `<button type="button" class="filter-chip ${isActive ? 'is-active' : ''}" data-filter="${f.value}" aria-pressed="${isActive ? 'true' : 'false'}">${label}</button>`;
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

  /* ── Contact form (mailto fallback) ── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      if (form.action && form.action !== '#' && !form.action.endsWith('#')) return;
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim() || 'Portfolio inquiry';
      const message = form.message.value.trim();
      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      window.location.href = `mailto:devillamarktristan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ── Init ── */
  function init() {
    initTheme();
    initMobileMenu();
    initHeaderScroll();
    initReveal();
    initProjectFilters();
    renderProjects();
    initContactForm();
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
