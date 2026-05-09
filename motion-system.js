(function () {
  function toArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  function basenameFromLocation() {
    const path = String(window.location.pathname || '');
    const parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  function uniqueElements(selectors) {
    const seen = new Set();
    const nodes = [];
    toArray(selectors).forEach(selector => {
      if (!selector) return;
      document.querySelectorAll(selector).forEach(node => {
        if (seen.has(node)) return;
        seen.add(node);
        nodes.push(node);
      });
    });
    return nodes;
  }

  function markElements(selectors, attrName) {
    uniqueElements(selectors).forEach(node => node.setAttribute(attrName, ''));
  }

  function appendLayer(host, className) {
    if (!host || host.querySelector('.' + className)) return null;
    const layer = document.createElement('div');
    layer.className = className;
    host.appendChild(layer);
    return layer;
  }

  function parseNumericText(text) {
    const value = String(text || '').trim();
    const match = value.match(/-?\d[\d,]*/);
    if (!match) return null;
    const rawNumber = match[0];
    const parsed = parseInt(rawNumber.replace(/,/g, ''), 10);
    if (Number.isNaN(parsed)) return null;
    return {
      value: parsed,
      prefix: value.slice(0, match.index),
      suffix: value.slice(match.index + rawNumber.length)
    };
  }

  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isFinePointer() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  const FILE_CONFIG = {
    'index.html': {
      surfaces: ['main .panel', '.secondary-card', '.category-panel', '.tool-link', '.secondary-log-list > div'],
      magnetic: ['.tool-link'],
      reveal: ['header .hero-card', 'main .panel', '.secondary-card', '.category-panel', '.tool-link', '.secondary-log-list > div'],
      count: [],
      success: [],
      rowStagger: ['.tool-card-grid', '.secondary-log-list']
    },
    'calculators.html': {
      surfaces: [
        '#homeView > div',
        '.home-tool-grid > button',
        '.home-tool-grid > a',
        '.calculator-nav',
        '#fdpView',
        '#splitDutyView',
        '#extensionDutyView',
        '.calculator-workbench-main > div',
        '.calculator-workbench-sidebar > div'
      ],
      magnetic: [
        '.home-tool-grid > button',
        '.home-tool-grid > a',
        '.calculator-nav > a',
        '.calculator-nav > button',
        'a[href="./index.html"]'
      ],
      reveal: ['header .hero-card', '#homeView > div', '.calculator-nav', '#fdpView', '#splitDutyView', '#extensionDutyView'],
      success: [
        '#fdpResult',
        '#splitDutyResult',
        '#extensionDutyResult',
        '#fdpMessageResult',
        '#splitDutyMessageResult',
        '#extensionDutyMessageResult'
      ],
      rowStagger: ['.home-tool-grid'],
      viewPanels: ['#fdpView', '#splitDutyView', '#extensionDutyView']
    },
    'retime.html': {
      surfaces: ['main section'],
      magnetic: ['button', 'a[href="./index.html"]'],
      reveal: ['header > div', 'main section'],
      success: ['#reTimeResult', '#reTimeNoticePreview']
    },
    'kuatian.html': {
      surfaces: ['main section', '#dropzone'],
      magnetic: ['button', 'a[href="./index.html"]'],
      reveal: ['header > div', 'main section'],
      count: ['#rawCount', '#filteredCount', '#resultCount'],
      success: ['#uploadStatus', '#logBox', '#outputBox', '#errorBox'],
      rowStagger: ['#outputBox'],
      dropzone: ['#dropzone']
    },
    'flight_gd_shift_tool.html': {
      surfaces: ['.card', '.stat', '.table-wrap', '#specialFocusCard'],
      magnetic: ['button'],
      reveal: ['.page > .card', '.stat'],
      count: ['#countFlights', '#specialFocusCount'],
      success: ['#statusBar', '#resultBody', '#specialFocusList'],
      rowStagger: ['#resultBody', '#specialFocusList']
    },
    'telex.html': {
      surfaces: ['.panel', '.stat', '.table-wrap', '.result-panel'],
      magnetic: ['button:not([data-action="toggle-handled"])', '.btn-back'],
      reveal: ['.page-header-inner', '.panel', '.stat', '.box'],
      count: ['#countFlights', '#countGroups', '#countWarnings'],
      success: ['#statusBox', '#warningBox', '#resultBody'],
      rowStagger: ['#resultBody']
    }
  };

  function autoTagPage(fileName) {
    const config = FILE_CONFIG[fileName] || {};
    const pageType = document.body.dataset.motionPage || 'workbench';

    if (pageType === 'home' || pageType === 'calculator') {
      markElements(['header .hero-card'], 'data-motion-hero');
    }
    if (pageType === 'workbench') {
      markElements(['header > div:first-child', '.page > .card > .hero'], 'data-motion-hero');
    }
    if (pageType === 'ops') {
      markElements(['.page-header-inner'], 'data-motion-hero');
    }
    if (fileName === 'flight_gd_shift_tool.html') {
      markElements(['.hero'], 'data-motion-hero');
    }

    markElements(config.surfaces || [], 'data-motion-surface');
    markElements(config.magnetic || [], 'data-magnetic');
    markElements(config.reveal || [], 'data-reveal');
    markElements(config.count || [], 'data-countup');
    markElements(config.success || [], 'data-success-glow');
    markElements(config.rowStagger || [], 'data-stagger-rows');
    markElements(config.dropzone || [], 'data-dropzone');
    markElements(config.viewPanels || [], 'data-view-panel');

    markElements(['button', 'a.tool-link', '.btn-back', 'a[href="./index.html"]'], 'data-ripple');
    markElements(['#countFlights', '#countGroups', '#countWarnings', '#specialFocusCount'], 'data-countup');
  }

  function addAmbientLayers() {
    if (document.querySelector('.motion-sky')) return;
    const sky = document.createElement('div');
    sky.className = 'motion-sky';
    document.body.appendChild(sky);

    if (isFinePointer()) {
      const halo = document.createElement('div');
      halo.className = 'motion-cursor-halo';
      document.body.appendChild(halo);
    }
  }

  function enhanceHeroes() {
    document.querySelectorAll('[data-motion-hero]').forEach(hero => {
      appendLayer(hero, 'motion-hero-grid');
      appendLayer(hero, 'motion-hero-scan');
      appendLayer(hero, 'motion-hero-glow');
    });
  }

  function enhanceSurfaces() {
    document.querySelectorAll('[data-motion-surface]').forEach(surface => {
      surface.classList.add('motion-hoverable');
      appendLayer(surface, 'motion-sheen');
      appendLayer(surface, 'motion-surface-glow');
    });
  }

  function setLocalPointerVars(target, event) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    target.style.setProperty('--motion-local-x', x + 'px');
    target.style.setProperty('--motion-local-y', y + 'px');
  }

  function initPointerTracking() {
    if (!isFinePointer()) return;
    const root = document.documentElement;

    document.addEventListener('pointermove', event => {
      root.style.setProperty('--motion-pointer-x', event.clientX + 'px');
      root.style.setProperty('--motion-pointer-y', event.clientY + 'px');
      document.body.classList.add('motion-pointer-active');
    }, { passive: true });

    window.addEventListener('pointerout', event => {
      if (!event.relatedTarget) {
        document.body.classList.remove('motion-pointer-active');
      }
    });

    document.querySelectorAll('[data-motion-hero], [data-motion-surface]').forEach(host => {
      host.addEventListener('pointermove', event => setLocalPointerVars(host, event), { passive: true });
      host.addEventListener('pointerleave', () => {
        host.style.setProperty('--motion-local-x', '50%');
        host.style.setProperty('--motion-local-y', '50%');
      });
    });
  }

  function initMagnetic() {
    if (!isFinePointer() || isReducedMotion()) return;

    document.querySelectorAll('[data-magnetic]').forEach(node => {
      node.addEventListener('pointermove', event => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        node.style.setProperty('--motion-shift-x', (x * 7) + 'px');
        node.style.setProperty('--motion-shift-y', (y * 7) + 'px');
        node.style.setProperty('--motion-content-shift-x', (x * 3) + 'px');
        node.style.setProperty('--motion-content-shift-y', (y * 3) + 'px');
      }, { passive: true });

      node.addEventListener('pointerleave', () => {
        node.style.setProperty('--motion-shift-x', '0px');
        node.style.setProperty('--motion-shift-y', '0px');
        node.style.setProperty('--motion-content-shift-x', '0px');
        node.style.setProperty('--motion-content-shift-y', '0px');
      });
    });
  }

  function triggerRipple(event) {
    const host = event.currentTarget;
    if (!host || host.disabled || host.getAttribute('aria-disabled') === 'true') return;
    const rect = host.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'motion-ripple';
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    host.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  function initRipples() {
    document.querySelectorAll('[data-ripple]').forEach(node => {
      node.addEventListener('pointerdown', triggerRipple);
    });
  }

  function initRevealObserver() {
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!revealTargets.length || isReducedMotion()) {
      revealTargets.forEach(node => {
        node.classList.remove('motion-await-reveal');
        node.classList.add('motion-revealed');
      });
      return;
    }

    revealTargets.forEach(node => {
      const rect = node.getBoundingClientRect();
      const visible = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
      if (visible) {
        node.classList.add('motion-revealed');
      } else {
        node.classList.add('motion-await-reveal');
      }
    });

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('motion-await-reveal');
        entry.target.classList.add('motion-revealed');
        io.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px'
    });

    revealTargets.forEach((node, index) => {
      node.style.setProperty('transition-delay', Math.min(index % 6, 5) * 28 + 'ms');
      observer.observe(node);
    });
  }

  function animateCount(node, fromValue, toValue, prefix, suffix) {
    if (fromValue === toValue) {
      node.textContent = prefix + toValue + suffix;
      node.dataset.motionCountValue = String(toValue);
      return;
    }

    if (isReducedMotion()) {
      node.textContent = prefix + toValue + suffix;
      node.dataset.motionCountValue = String(toValue);
      return;
    }

    const start = performance.now();
    const duration = 620;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(fromValue + (toValue - fromValue) * eased);
      node.textContent = prefix + value + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        node.textContent = prefix + toValue + suffix;
        node.dataset.motionCountValue = String(toValue);
      }
    }

    requestAnimationFrame(frame);
  }

  function initCountups() {
    document.querySelectorAll('[data-countup]').forEach(node => {
      const initial = parseNumericText(node.textContent);
      if (initial) node.dataset.motionCountValue = String(initial.value);

      let lastText = node.textContent;
      const observer = new MutationObserver(() => {
        const currentText = node.textContent;
        if (currentText === lastText) return;
        lastText = currentText;
        const parsed = parseNumericText(currentText);
        if (!parsed) return;
        const fromValue = parseInt(node.dataset.motionCountValue || String(parsed.value), 10);
        animateCount(node, Number.isNaN(fromValue) ? parsed.value : fromValue, parsed.value, parsed.prefix, parsed.suffix);
      });

      observer.observe(node, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }

  function flashSuccess(node) {
    node.classList.remove('motion-success-flash');
    void node.offsetWidth;
    node.classList.add('motion-success-flash');
    window.setTimeout(() => node.classList.remove('motion-success-flash'), 960);
  }

  function initSuccessObservers() {
    document.querySelectorAll('[data-success-glow]').forEach(node => {
      let previous = node.textContent.trim();
      const observer = new MutationObserver(() => {
        const current = node.textContent.trim();
        if (!current || current === previous) return;
        previous = current;
        flashSuccess(node);
      });
      observer.observe(node, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: node.id === 'warningBox'
      });
    });
  }

  function animateStaggerChildren(container) {
    const children = Array.from(container.children || []);
    children.forEach((child, index) => {
      child.classList.remove('motion-row-enter');
      child.style.setProperty('--motion-row-delay', Math.min(index, 8) * 42 + 'ms');
      void child.offsetWidth;
      child.classList.add('motion-row-enter');
      window.setTimeout(() => child.classList.remove('motion-row-enter'), 760);
    });
  }

  function initRowStaggers() {
    document.querySelectorAll('[data-stagger-rows]').forEach(container => {
      if (container.children.length) animateStaggerChildren(container);

      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          animateStaggerChildren(container);
        });
      });
      observer.observe(container, { childList: true });
    });
  }

  function initDropzones() {
    document.querySelectorAll('[data-dropzone]').forEach(zone => {
      let depth = 0;
      zone.addEventListener('dragenter', () => {
        depth += 1;
        zone.classList.add('motion-drop-active');
      });
      zone.addEventListener('dragover', () => {
        zone.classList.add('motion-drop-active');
      });
      zone.addEventListener('dragleave', () => {
        depth = Math.max(0, depth - 1);
        if (depth === 0) zone.classList.remove('motion-drop-active');
      });
      zone.addEventListener('drop', () => {
        depth = 0;
        zone.classList.remove('motion-drop-active');
      });
    });
  }

  function initViewPanelObserver() {
    const visibleStateMap = new WeakMap();
    const animationTimeoutMap = new WeakMap();

    function isPanelVisible(panel) {
      if (!panel) return null;
      return !panel.classList.contains('hidden') && !panel.hidden;
    }

    function clearPanelAnimation(panel) {
      const timeoutId = animationTimeoutMap.get(panel);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        animationTimeoutMap.delete(panel);
      }
      panel.classList.remove('motion-view-enter');
    }

    document.querySelectorAll('[data-view-panel]').forEach(panel => {
      const initialVisible = isPanelVisible(panel);
      visibleStateMap.set(panel, initialVisible);

      const observer = new MutationObserver(() => {
        const isVisible = isPanelVisible(panel);
        const previousVisible = visibleStateMap.get(panel);

        if (typeof isVisible !== 'boolean') return;
        if (isVisible === previousVisible) return;

        visibleStateMap.set(panel, isVisible);

        if (!isVisible) {
          clearPanelAnimation(panel);
          return;
        }

        clearPanelAnimation(panel);
        void panel.offsetWidth;
        panel.classList.add('motion-view-enter');
        const timeoutId = window.setTimeout(() => {
          panel.classList.remove('motion-view-enter');
          animationTimeoutMap.delete(panel);
        }, 520);
        animationTimeoutMap.set(panel, timeoutId);
      });
      observer.observe(panel, {
        attributes: true,
        attributeFilter: ['class', 'hidden']
      });
    });
  }

  function initToggleFlash() {
    document.addEventListener('click', event => {
      const toggle = event.target.closest('[data-action="toggle-handled"]');
      if (!toggle) return;
      requestAnimationFrame(() => {
        const row = toggle.closest('tr');
        const target = row || toggle;
        target.classList.remove('motion-toggle-flash');
        void target.offsetWidth;
        target.classList.add('motion-toggle-flash');
        window.setTimeout(() => target.classList.remove('motion-toggle-flash'), 620);
      });
    });
  }

  function init() {
    if (!document.body) return;
    const fileName = basenameFromLocation();

    autoTagPage(fileName);
    document.body.dataset.motionReady = 'true';
    document.body.classList.add('motion-can-reveal');

    if (!isReducedMotion()) addAmbientLayers();
    enhanceHeroes();
    enhanceSurfaces();
    initPointerTracking();
    initMagnetic();
    initRipples();
    initRevealObserver();
    initCountups();
    initSuccessObservers();
    initRowStaggers();
    initDropzones();
    initViewPanelObserver();
    initToggleFlash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
