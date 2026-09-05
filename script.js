// Devvrat Yadav — portfolio interactions
// Scroll reveals, project expand/collapse, mobile nav. No frameworks.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll reveal ---------- */

  var revealTargets = document.querySelectorAll(
    '.reveal, .signal-group, .rings'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- project branch expand/collapse ---------- */

  document.querySelectorAll('.branch-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var branch = btn.closest('.branch');
      var isOpen = branch.getAttribute('data-open') === 'true';

      // close any other open branch for a tidier accordion feel
      document.querySelectorAll('.branch[data-open="true"]').forEach(function (b) {
        if (b !== branch) {
          b.setAttribute('data-open', 'false');
          b.querySelector('.branch-toggle').setAttribute('aria-expanded', 'false');
        }
      });

      branch.setAttribute('data-open', String(!isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // open the first project by default so the section doesn't look empty
  var firstBranch = document.querySelector('.branch');
  if (firstBranch) {
    firstBranch.setAttribute('data-open', 'true');
    firstBranch.querySelector('.branch-toggle').setAttribute('aria-expanded', 'true');
  }

  /* ---------- mobile nav ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- subtle parallax on hero root graphic ---------- */

  var root = document.querySelector('.root-graphic');
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (root && hasFinePointer && !reduceMotion) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5..0.5
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      root.style.transform =
        'translateX(calc(-50% + ' + (x * -12) + 'px)) translateY(' + (y * -8) + 'px)';
    });
    hero.addEventListener('mouseleave', function () {
      root.style.transform = 'translateX(-50%)';
    });
  }

})();
