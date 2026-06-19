
(function () {
    window.initMoviePlayer = function (source, options) {
        var settings = options || {};
        var video = document.querySelector(settings.video || '#movie-player');
        var button = document.querySelector(settings.button || '#video-start');
        var shell = document.querySelector(settings.shell || '#player-shell');
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                        video.src = source;
                    }
                });
            } else {
                video.src = source;
            }
        }

        function showButton(show) {
            if (!button) {
                return;
            }
            button.classList.toggle('is-hidden', !show);
        }

        function playVideo() {
            showButton(false);
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showButton(true);
                });
            }
        }

        attachSource();

        if (button) {
            button.addEventListener('click', playVideo);
        }
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === shell) {
                    playVideo();
                }
            });
        }
        video.addEventListener('play', function () {
            showButton(false);
        });
        video.addEventListener('pause', function () {
            showButton(true);
        });
        video.addEventListener('ended', function () {
            showButton(true);
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
}());
