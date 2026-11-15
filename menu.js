/* PUNKTY + SKINY BRONI (localStorage) */
const SK=[{n:'Czarny',c:null,p:0},{n:'Czerwony',c:'#e23b3b',p:50},{n:'Niebieski',c:'#3b6fe2',p:50},{n:'Zielony',c:'#3bb04a',p:50},{n:'Złoty',c:'#e0b030',p:100}];
let SV={k:0,sp:0,own:['1:0','2:0','3:0'],sel:{1:0,2:0,3:0}};
try{Object.assign(SV,JSON.parse(localStorage.getItem('bc')||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem('bc',JSON.stringify(SV))}catch(e){}},pts=()=>SV.k-SV.sp;
function applySkin(s){const k=SK[SV.sel[s]||0];[pol,fde].forEach(m=>{if(!m._m)m._m=m.map;m.map=k.c?null:m._m;m.color.set(k.c||'#ffffff');m.needsUpdate=true})}
const WSVG={1:'<rect x="30" y="18" width="120" height="16" rx="3"/><path d="M40 34h28l-8 32H42z"/>',
2:'<rect x="95" y="24" width="100" height="6"/><rect x="40" y="22" width="60" height="16"/><rect x="2" y="22" width="40" height="18"/><rect x="110" y="20" width="40" height="12"/><path d="M80 38h14l8 26h-16z"/><path d="M50 38h12l-4 22h-10z"/>',
3:'<rect x="70" y="22" width="125" height="7"/><rect x="70" y="30" width="110" height="6"/><rect x="40" y="22" width="40" height="18"/><path d="M2 24h38v16L10 46z"/><rect x="110" y="34" width="34" height="10"/>'};
function renderWeapons(){
  $('mmPts').textContent='PUNKTY: '+pts()+' (zabici łącznie: '+SV.k+')';
  $('wpList').innerHTML=[1,2,3].map(s=>{const cur=SK[SV.sel[s]||0];
    return '<div class="wc"><svg viewBox="0 0 200 70" fill="currentColor" style="color:'+(cur.c||'#2a2c30')+'">'+WSVG[s]+'</svg><div><b>'+W[s].n+'</b>'+
    SK.map((k,i)=>{const o=SV.own.includes(s+':'+i);return '<button class="sw'+(SV.sel[s]==i?' on':'')+'" style="background:'+(k.c||'#2a2c30')+'" data-s="'+s+'" data-i="'+i+'" title="'+k.n+'">'+(o?'':k.p)+'</button>'}).join('')+'</div></div>'}).join('');
}
$('wpList').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;const s=+b.dataset.s,i=+b.dataset.i,id=s+':'+i;
  if(!SV.own.includes(id)){if(pts()<SK[i].p)return;SV.sp+=SK[i].p;SV.own.push(id)}
  SV.sel[s]=i;sv();renderWeapons()};
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const id='p_'+b.dataset.p,p=$(id),on=p.classList.contains('on');
  document.querySelectorAll('.mmPanel').forEach(x=>x.classList.remove('on'));if(!on){p.classList.add('on');if(id==='p_wp')renderWeapons()}});
$('sens2').oninput=e=>{sens=+e.target.value;$('sens').value=e.target.value};
renderWeapons();

/* MULTIPLAYER – klient (pozycje graczy; trafienia PvP jeszcze nie) */
let MP=false,ws=null;const RP={};
function mkRemote(){const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:0x3b6fe2});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,1.3,12),m);b.position.y=.75;
  const h=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),new THREE.MeshLambertMaterial({color:0xc68e6b}));h.position.y=1.6;
  g.add(b,h);scene.add(g);return g}
$('mpGo').onclick=()=>{
  const msg=$('mpMsg');
  try{ws=new WebSocket($('srv').value.trim())}catch(e){msg.textContent='Błędny adres serwera';return}
  msg.textContent='Łączenie… (serwer na Render może się budzić do 60 s)';
  ws.onerror=()=>msg.textContent='Nie udało się połączyć z serwerem';
  ws.onopen=()=>{
    ws.send(JSON.stringify({t:'join',nick:$('nick').value||'Gracz'}));
    MP=true;for(const n of npcs){scene.remove(n.g);scene.remove(n.cen);if(n.pool)scene.remove(n.pool)}npcs.length=0;rebuild();
    $('startBtn').onclick();
  };
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
    if(m.t!=='state')return;const seen={};
    m.p.forEach(p=>{seen[p.id]=1;const r=RP[p.id]||(RP[p.id]=mkRemote());r.position.set(p.x,0,p.z);r.rotation.y=p.y});
    for(const id in RP)if(!seen[id]){scene.remove(RP[id]);delete RP[id]}};
  ws.onclose=()=>{MP=false;for(const id in RP){scene.remove(RP[id]);delete RP[id]}};
};
setInterval(()=>{if(ws&&ws.readyState===1&&!dead)ws.send(JSON.stringify({t:'pos',x:P.x,z:P.z,y:yaw}))},100);
