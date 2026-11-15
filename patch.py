import re,sys,pathlib
d=pathlib.Path(__file__).parent
src=pathlib.Path(sys.argv[1]);h=src.read_text(encoding='utf-8')
css,html,js=[(d/f).read_text(encoding='utf-8') for f in('menu.css','menu.html','menu.js')]
def sub(p,r):
    global h
    h,n=re.subn(p,lambda m:r,h,count=1,flags=re.S);assert n==1,'nie znaleziono: '+p[:40]
sub(r'/\* MENU GŁÓWNE \*/.*?(?=/\* EKRAN ŚMIERCI \*/)',css+'\n')
sub(r'<div id="mainMenu">.*?<button id="startBtn">START</button>\s*</div>',html)
sub(r'\nsetupMenu\(\);\n','\nsetupMenu();\n'+js+'\n')
for a,b in [('n.dead=true;kills++;','n.dead=true;kills++;SV.k++;sv();'),
            ('slot=s;for(const k in VM)','slot=s;applySkin(s);for(const k in VM)'),
            ("addEventListener('keydown',e=>{","addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;"),
            ('if(wv<=0){wv=6;if(npcs.filter','if(wv<=0){wv=6;if(!MP&&npcs.filter')]:
    assert a in h,'brak: '+a;h=h.replace(a,b,1)
out=src.with_name('index_new.html');out.write_text(h,encoding='utf-8');print('OK ->',out)
