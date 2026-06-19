(function(){
  document.querySelectorAll('[data-player]').forEach(function(box){
    var video=box.querySelector('video')
    var cover=box.querySelector('.play-cover')
    var url=box.getAttribute('data-stream')
    var ready=false
    function prepare(){
      if(ready||!video||!url)return
      ready=true
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url}
      else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true});hls.loadSource(url);hls.attachMedia(video)}
      else{video.src=url}
    }
    function start(){
      prepare()
      if(cover)cover.classList.add('is-hidden')
      if(video){var p=video.play();if(p&&p.catch)p.catch(function(){})}
    }
    if(cover)cover.addEventListener('click',start)
    if(video)video.addEventListener('click',function(){if(video.paused)start()})
  })
})();