const {WebSocketServer}=require('ws');
const wss=new WebSocketServer({port:process.env.PORT||8080});
const players=new Map();let nid=1;
const cl=v=>Math.max(-47,Math.min(47,+v||0));
wss.on('connection',ws=>{
  const id=nid++;ws.id=id;players.set(id,{id,nick:'Gracz',x:30,z:-40,y:0});
  ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
    const p=players.get(id);if(!p)return;
    if(m.t==='join')p.nick=String(m.nick||'Gracz').slice(0,16);
    else if(m.t==='pos'){p.x=cl(m.x);p.z=cl(m.z);p.y=+m.y||0}});
  ws.on('close',()=>players.delete(id));
});
setInterval(()=>{const all=[...players.values()];
  for(const c of wss.clients)if(c.readyState===1)c.send(JSON.stringify({t:'state',p:all.filter(p=>p.id!==c.id)}))},100);
console.log('BODYCAM server up');
