document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".stream-player").forEach(function (video) {
    var source = video.querySelector("source");
    var src = source ? source.getAttribute("src") : "";
    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector(".play-layer") : null;
    var prepared = false;

    var prepare = function () {
      if (prepared || !src) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    var play = function () {
      prepare();
      if (button) {
        button.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  });
});
