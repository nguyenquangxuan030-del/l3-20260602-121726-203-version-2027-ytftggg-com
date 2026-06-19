(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var dotsWrap = root.querySelector('[data-hero-dots]');
    var current = 0;
    var timer = null;

    function renderDots() {
      if (!dotsWrap) {
        return;
      }
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (!slides.length) {
      return;
    }
    renderDots();
    show(0);
    restart();

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
        card.style.display = !q || haystack.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  function initSortCards() {
    var select = document.querySelector('[data-sort-cards]');
    var list = document.querySelector('[data-card-list]');
    if (!select || !list) {
      return;
    }
    var original = Array.prototype.slice.call(list.children);
    select.addEventListener('change', function () {
      var cards = original.slice();
      if (select.value === 'year-desc') {
        cards.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      if (select.value === 'year-asc') {
        cards.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      }
      if (select.value === 'title') {
        cards.sort(function (a, b) {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        });
      }
      cards.forEach(function (card) {
        list.appendChild(card);
      });
    });
  }

  function createSearchCard(movie) {
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '" aria-label="查看' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">' +
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="poster-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!form || !input || !results || !summary || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function runSearch(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }
      var words = q.split(/\s+/).filter(Boolean);
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = movie.searchText.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      summary.textContent = '找到 ' + matches.length + ' 条匹配结果，最多显示 120 条。';
      results.innerHTML = matches.map(createSearchCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value;
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(null, '', url.toString());
      runSearch(query);
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    runSearch(initial);
  }

  toggleMobileMenu();
  initHero();
  initPageFilter();
  initSortCards();
  initSearchPage();
})();
