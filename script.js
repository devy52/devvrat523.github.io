// Devvrat Yadav — portfolio interactions
// Sliding project carousel, scroll reveals, nav. No frameworks.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll reveal ---------- */

  var revealTargets = document.querySelectorAll('.reveal, .signal-group, .rings');

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

  /* ---------- project slider ---------- */

  var slider = document.getElementById('projectSlider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('sliderDots');
    var prevBtn = document.getElementById('sliderPrev');
    var nextBtn = document.getElementById('sliderNext');
    var dots = [];

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function setActive(index) {
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
    }

    function goTo(index) {
      index = Math.max(0, Math.min(slides.length - 1, index));
      slides[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    }

    var currentIndex = 0;
    setActive(0);

    if ('IntersectionObserver' in window) {
      var slideSpy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
              currentIndex = slides.indexOf(entry.target);
              setActive(currentIndex);
            }
          });
        },
        { root: slider, threshold: [0.6] }
      );
      slides.forEach(function (s) { slideSpy.observe(s); });
    }

    prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });
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
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      root.style.transform =
        'translateX(calc(-50% + ' + (x * -12) + 'px)) translateY(' + (y * -8) + 'px)';
    });
    hero.addEventListener('mouseleave', function () {
      root.style.transform = 'translateX(-50%)';
    });
  }

  /* ---------- scroll-spy for nav active state ---------- */

  var navLinks = document.querySelectorAll('.site-nav a');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main .section, .hero'));

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { if (s.id) spy.observe(s); });
  }

})();
