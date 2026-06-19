(function(){
  function qs(sel,root){return (root||document).querySelector(sel)}
  function qsa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  var hero=qs('[data-hero]')
  if(hero){
    var slides=qsa('.hero-slide',hero),dots=qsa('.hero-dot',hero),index=0
    function show(i){slides.forEach(function(s,k){s.classList.toggle('active',k===i)});dots.forEach(function(d,k){d.classList.toggle('active',k===i)});index=i}
    dots.forEach(function(d,k){d.addEventListener('click',function(){show(k)})})
    if(slides.length>1){setInterval(function(){show((index+1)%slides.length)},5200)}
  }
  qsa('[data-search-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault()
      var input=qs('input',form)
      var q=input?input.value.trim():''
      location.href='search.html'+(q?'?q='+encodeURIComponent(q):'')
    })
  })
  qsa('[data-filter-page]').forEach(function(root){
    var input=qs('[data-filter-text]',root),year=qs('[data-filter-year]',root),type=qs('[data-filter-type]',root),cards=qsa('.movie-card',root)
    function run(){
      var q=(input&&input.value||'').toLowerCase().trim(), y=year&&year.value||'', t=type&&type.value||''
      cards.forEach(function(card){
        var text=(card.getAttribute('data-text')||'').toLowerCase(), cy=card.getAttribute('data-year')||'', ct=card.getAttribute('data-type')||''
        var ok=(!q||text.indexOf(q)>-1)&&(!y||cy===y)&&(!t||ct.indexOf(t)>-1)
        card.style.display=ok?'':'none'
      })
    }
    ;[input,year,type].forEach(function(el){if(el)el.addEventListener('input',run)})
  })
  var results=qs('#search-results')
  if(results&&window.SEARCH_INDEX){
    var params=new URLSearchParams(location.search),box=qs('#search-input'),q=params.get('q')||''
    if(box)box.value=q
    function card(m){return '<article class="movie-card" data-text=""><a class="poster" href="'+m.url+'"><img src="'+m.cover+'" alt="'+m.title+'" loading="lazy"><span class="badge">'+m.year+'</span></a><div class="card-body"><a class="card-title" href="'+m.url+'">'+m.title+'</a><div class="card-meta"><span>'+m.region+'</span><span>·</span><span>'+m.type+'</span><span>·</span><span>'+m.genre+'</span></div><p class="card-text">'+m.one+'</p></div></article>'}
    function render(){
      var term=(box&&box.value||'').toLowerCase().trim()
      var list=window.SEARCH_INDEX.filter(function(m){return !term||m.text.indexOf(term)>-1}).slice(0,120)
      results.innerHTML=list.length?list.map(card).join(''):'<div class="result-empty">没有匹配的影片，换一个关键词试试。</div>'
    }
    if(box)box.addEventListener('input',render)
    render()
  }
})();