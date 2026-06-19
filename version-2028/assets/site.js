(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-button");
        var mobilePanel = document.querySelector(".mobile-panel");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var open = mobilePanel.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        var nextButton = document.querySelector(".hero-next");
        var prevButton = document.querySelector(".hero-prev");
        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(index + 1);
            });
        }
        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(index - 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim().toLowerCase();
        var searchInput = document.getElementById("searchInput");
        var searchableCards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

        function applySearch(value) {
            var query = (value || "").trim().toLowerCase();
            searchableCards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-region") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("hidden-by-search", query.length > 0 && text.indexOf(query) === -1);
            });
        }

        if (searchInput) {
            searchInput.value = keyword;
            applySearch(keyword);
            searchInput.addEventListener("input", function () {
                applySearch(searchInput.value);
            });
        }
    });
})();
