import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initNavigation() {
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-site-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initImageFallbacks() {
  $$('[data-image-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
    }, { once: true });
  });
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function initLocalFilters() {
  $$('[data-local-filter]').forEach((input) => {
    const scope = input.closest('.section-block') || document;
    const cards = $$('[data-card]', scope);
    const counter = $('[data-filter-count]', scope);

    function applyFilter() {
      const query = normalizeText(input.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalizeText(card.dataset.search || card.textContent);
        const matched = !query || haystack.includes(query);
        card.classList.toggle('is-filtered-out', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = `${visible} 部影片`;
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
}

function createMovieCard(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
          <article class="movie-card" data-card data-search="${escapeHtml(movie.search)}" data-year="${movie.year}">
            <a class="poster-link" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
              <span class="poster-media">
                <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy" data-image-fallback>
                <span class="play-hover">▶</span>
              </span>
            </a>
            <div class="movie-card-body">
              <div class="movie-meta-line">
                <span>${escapeHtml(movie.yearText)}</span>
                <span>${escapeHtml(movie.type)}</span>
              </div>
              <h2><a href="${movie.url}">${escapeHtml(movie.title)}</a></h2>
              <p>${escapeHtml(movie.oneLine)}</p>
              <div class="tag-row">${tags}</div>
            </div>
          </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initGlobalSearch() {
  const input = $('[data-global-search]');
  const results = $('[data-global-results]');
  const counter = $('[data-global-count]');

  if (!input || !results || !window.MOVIE_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (initialQuery) {
    input.value = initialQuery;
  }

  function render() {
    const query = normalizeText(input.value);
    const source = window.MOVIE_INDEX;
    const filtered = query
      ? source.filter((movie) => normalizeText(movie.search).includes(query))
      : source.slice(0, 60);
    const displayItems = filtered.slice(0, 120);

    results.innerHTML = displayItems.map(createMovieCard).join('\n');
    initImageFallbacks();

    if (counter) {
      counter.textContent = `${filtered.length} 部影片`;
    }
  }

  input.addEventListener('input', render);
  render();
}

function initPlayers() {
  $$('[data-play-button]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.videoTarget;
      const src = button.dataset.videoSrc;
      const video = targetId ? document.getElementById(targetId) : $('video');
      const message = $('[data-player-message]');

      if (!video || !src) {
        if (message) {
          message.textContent = '当前播放源未配置。';
        }
        return;
      }

      button.classList.add('is-hidden');

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            if (message) {
              message.textContent = '浏览器阻止了自动播放，请手动点击播放器开始。';
            }
          });
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!message || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            message.textContent = '网络连接异常，正在尝试重新加载。';
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            message.textContent = '媒体解析异常，正在尝试恢复。';
            hls.recoverMediaError();
          } else {
            message.textContent = '播放出现错误，请刷新页面后重试。';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {
          if (message) {
            message.textContent = '请手动点击播放器开始播放。';
          }
        });
      } else if (message) {
        message.textContent = '当前浏览器不支持 HLS 播放，请使用现代浏览器访问。';
      }
    });
  });
}

function init() {
  initNavigation();
  initHero();
  initImageFallbacks();
  initLocalFilters();
  initGlobalSearch();
  initPlayers();
}

document.addEventListener('DOMContentLoaded', init);
