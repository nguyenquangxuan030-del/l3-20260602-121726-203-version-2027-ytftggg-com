(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll(".search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = document.querySelectorAll(".filter-scope");
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-region-filter]");
            var year = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-state]");

            if (input && queryValue && scope.hasAttribute("data-search-page")) {
                input.value = queryValue;
            }

            function normalize(value) {
                return String(value || "").toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value.trim() : "");
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var configNode = document.getElementById("player-config");
        var video = document.getElementById("movie-video");
        var trigger = document.querySelector("[data-player-trigger]");
        if (!configNode || !video) {
            return;
        }

        var config;
        try {
            config = JSON.parse(configNode.textContent);
        } catch (error) {
            config = null;
        }
        if (!config || !config.url) {
            return;
        }

        var hlsInstance = null;
        var loaded = false;

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(config.url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hlsInstance) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = config.url;
            }
        }

        function playVideo() {
            loadVideo();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", function () {
                trigger.classList.add("is-hidden");
                playVideo();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (trigger && video.currentTime === 0) {
                trigger.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayer();
    });
})();
