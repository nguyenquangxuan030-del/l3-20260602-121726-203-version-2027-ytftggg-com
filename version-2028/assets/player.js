(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer(container) {
        var video = container.querySelector("video");
        var overlay = container.querySelector(".player-cover");
        var stream = container.getAttribute("data-m3u8");
        var started = false;

        if (!video || !overlay || !stream) {
            return;
        }

        function attachStream() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                container.hlsInstance = hls;
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            attachStream();
            overlay.classList.add("hidden");
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".player-section")).forEach(initPlayer);
    });
})();
