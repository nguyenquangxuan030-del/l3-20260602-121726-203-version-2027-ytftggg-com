(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll('.filter-bar'));

    filterBars.forEach(function (bar) {
        var input = bar.querySelector('[data-filter="keyword"]');
        var typeSelect = bar.querySelector('[data-filter="type"]');
        var yearSelect = bar.querySelector('[data-filter="year"]');
        var scopeSelector = bar.getAttribute('data-scope') || '.movie-grid';
        var scope = document.querySelector(scopeSelector) || bar.parentElement;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var emptyState = scope.parentElement.querySelector('.empty-state');

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedType = typeSelect ? typeSelect.value : '';
            var selectedYear = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !selectedType || cardType.indexOf(selectedType) !== -1;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var shouldShow = matchesKeyword && matchesType && matchesYear;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();

function initPlayer(sourceUrl) {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('.player-overlay');
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (started) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        started = true;
    }

    function playVideo(event) {
        if (event) {
            event.preventDefault();
        }
        attachSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (!video.ended && overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
}
