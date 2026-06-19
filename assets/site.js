
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = qs('[data-nav-toggle]');
        var nav = qs('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFiltering() {
        var input = qs('[data-filter-input]');
        var buttons = qsa('[data-filter-button]');
        var empty = qs('[data-empty-filter]');
        var scopes = qsa('[data-filter-scope]');
        if (!input && !buttons.length) {
            return;
        }
        var activeValue = '全部';

        function getItems() {
            var items = [];
            scopes.forEach(function (scope) {
                items = items.concat(qsa('[data-movie-card], .ranking-item', scope));
            });
            return items;
        }

        function matchesValue(item) {
            if (activeValue === '全部') {
                return true;
            }
            var value = (item.getAttribute('data-filter-value') || item.textContent || '').toLowerCase();
            return value.indexOf(activeValue.toLowerCase()) !== -1;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            getItems().forEach(function (item) {
                var text = (item.getAttribute('data-filter-text') || item.textContent || '').toLowerCase();
                var ok = (!query || text.indexOf(query) !== -1) && matchesValue(item);
                item.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeValue = button.getAttribute('data-value') || '全部';
                apply();
            });
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFiltering();
    });
}());
