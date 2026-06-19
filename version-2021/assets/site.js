(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const startTimer = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-search-input]');
    const region = filterPanel.querySelector('[data-region-filter]');
    const year = filterPanel.querySelector('[data-year-filter]');
    const genre = filterPanel.querySelector('[data-genre-filter]');
    const cards = Array.from(document.querySelectorAll('[data-search-grid] .movie-card'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const runFilter = () => {
      const keyword = normalize(input ? input.value : '');
      const regionValue = normalize(region ? region.value : '');
      const yearValue = normalize(year ? year.value : '');
      const genreValue = normalize(genre ? genre.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const target = normalize(`${card.dataset.title} ${card.dataset.region} ${card.dataset.year} ${card.dataset.genre} ${card.dataset.tags}`);
        const matchesKeyword = !keyword || target.includes(keyword);
        const matchesRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
        const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        const matchesGenre = !genreValue || normalize(card.dataset.genre).includes(genreValue) || normalize(card.dataset.tags).includes(genreValue);
        const isVisible = matchesKeyword && matchesRegion && matchesYear && matchesGenre;
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, region, year, genre].forEach((control) => {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }

  const playerBox = document.querySelector('[data-stream]');

  if (playerBox) {
    const video = playerBox.querySelector('video');
    const button = playerBox.querySelector('.play-cover');
    const streamUrl = playerBox.dataset.stream;
    let prepared = false;
    let hlsInstance = null;

    const prepareVideo = () => {
      if (!video || !streamUrl || prepared) {
        return Promise.resolve();
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return new Promise((resolve) => {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hlsInstance.on(window.Hls.Events.ERROR, resolve);
        });
      }

      video.src = streamUrl;
      return Promise.resolve();
    };

    const startPlayback = () => {
      prepareVideo().then(() => {
        if (button) {
          button.classList.add('is-hidden');
        }
        if (video) {
          const result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(() => {
              if (button) {
                button.classList.remove('is-hidden');
              }
            });
          }
        }
      });
    };

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
