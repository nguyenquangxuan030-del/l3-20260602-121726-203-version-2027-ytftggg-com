document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-tab]"));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle("is-active", tabIndex === index);
      });
    };

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showSlide(Number(tab.getAttribute("data-hero-tab")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var count = scope.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .wide-card"));

    var normalize = function (value) {
      return String(value || "").toLowerCase().trim();
    };

    var applyFilter = function () {
      var term = normalize(input ? input.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchTerm = !term || haystack.indexOf(term) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var matchYear = !year || cardYear === year;
        var matched = matchTerm && matchType && matchYear;

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "找到 " + visible + " 个结果";
      }
    };

    [input, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
});
