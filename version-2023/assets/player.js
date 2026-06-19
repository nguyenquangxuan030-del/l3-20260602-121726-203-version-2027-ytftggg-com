(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var src = shell.getAttribute('data-src');
    var hls = null;

    function loadAndPlay() {
      if (!video || !src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      if (button) {
        button.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }

    shell.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        loadAndPlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
