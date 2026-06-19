(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });

    window.setInterval(function () {
      activate(index + 1);
    }, 6500);
  }

  function setupCatalogFilters() {
    var filter = document.querySelector("[data-catalog-filter]");
    var grid = document.querySelector("[data-catalog-grid]");

    if (!filter || !grid) {
      return;
    }

    var search = filter.querySelector("[data-catalog-search]");
    var year = filter.querySelector("[data-filter-year]");
    var region = filter.querySelector("[data-filter-region]");
    var count = filter.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && search) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function update() {
      var keyword = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
        var matchRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
        var shouldShow = matchKeyword && matchYear && matchRegion;

        card.classList.toggle("is-hidden", !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  }

  window.startMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var trigger = document.querySelector("[data-play-trigger]");
      var hlsInstance = null;
      var loaded = false;

      if (!video || !source) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        load();

        if (trigger) {
          trigger.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (trigger) {
              trigger.classList.remove("is-hidden");
            }
          });
        }
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }

      video.addEventListener("play", load, { once: true });
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCatalogFilters();
  });
})();
