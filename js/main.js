/* StudyFlow — núcleo: armazenamento, autenticação, layout, modais, CRUD genérico.
   BACKEND: todas as chamadas a DB/hash/login são o ponto onde ligar uma API real (REST + sessões/JWT). */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const GL=['users','currentUser','expenses','aiContent','messages'];
const uid=()=>Math.random().toString(36).slice(2,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10),ago=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10);
const fd=d=>d?new Date(d+'T00:00').toLocaleDateString('pt-PT'):'',eur=n=>n.toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
const hrs=a=>Math.round(a.reduce((x,y)=>x+y.min,0)/6)/10,sum=(a,k)=>a.reduce((x,y)=>x+(+y[k]||0),0);
const bar=p=>`<div class="bar"><i style="width:${p}%"></i></div>`,st=(v,l)=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`;
const DB={k(k){let u='';if(!GL.includes(k)){try{u=JSON.parse(localStorage.getItem('sf_currentUser'))+'_'}catch(e){}}return 'sf_'+u+k},
get(k,d=[]){try{const v=localStorage.getItem(DB.k(k));return v?JSON.parse(v):d}catch(e){return d}},
set(k,v){try{localStorage.setItem(DB.k(k),JSON.stringify(v))}catch(e){toast('Não foi possível guardar os dados.')}}};
/* Dados de demonstração (administrador + utilizadores fictícios) */
function seed(){if(localStorage.getItem('sf_users'))return;const d=n=>new Date(Date.now()-n*864e5).toISOString(),N=['Ana Sousa','Rui Matos','Inês Costa','Pedro Lima','Marta Reis','Tiago Faria'];
DB.set('users',[{id:'admin',name:'Administrador',email:'admin@studyflow.pt',pass:hash('admin123'),role:'admin',plan:'admin',created:d(200),blocked:false},
...N.map((n,i)=>({id:'u'+i,name:n,email:n.split(' ')[0].toLowerCase()+'@exemplo.pt',pass:hash('demo123'),role:'student',plan:i%2?'premium':i==4?'cancelled':'trial',created:d(i*28+5),blocked:false}))])}
/* Autenticação (SIMULAÇÃO: em produção a palavra-passe nunca é guardada no browser) */
const hash=p=>btoa(unescape(encodeURIComponent(p)));
const me=()=>{const id=DB.get('currentUser',null);return id?DB.get('users').find(u=>u.id===id)||null:null};
function registerUser(name,email,pw,pw2){email=email.trim().toLowerCase();const us=DB.get('users');
if(!name.trim()||!email||!pw||!pw2)return{ok:0,msg:'Preenche todos os campos.'};if(!/^\S+@\S+\.\S+$/.test(email))return{ok:0,msg:'E-mail inválido.'};
if(pw.length<6)return{ok:0,msg:'A palavra-passe precisa de pelo menos 6 caracteres.'};if(pw!==pw2)return{ok:0,msg:'As palavras-passe não coincidem.'};
if(us.some(u=>u.email===email))return{ok:0,msg:'Este e-mail já está registado.'};
const u={id:uid(),name:name.trim(),email,pass:hash(pw),role:'student',plan:'trial',created:new Date().toISOString(),blocked:false};us.push(u);DB.set('users',us);DB.set('currentUser',u.id);return{ok:1,msg:'Conta criada com sucesso!',user:u}}
function loginUser(email,pw){const u=DB.get('users').find(u=>u.email===email.trim().toLowerCase());
if(!u||u.pass!==hash(pw))return{ok:0,msg:'E-mail ou palavra-passe incorretos.'};if(u.blocked)return{ok:0,msg:'Esta conta está bloqueada.'};DB.set('currentUser',u.id);return{ok:1,msg:'Sessão iniciada!',user:u}}
const logoutUser=()=>{localStorage.removeItem('sf_currentUser');location.href='login.html'},isLoggedIn=()=>!!me();
function protectPage(role){const u=me();if(!u){sessionStorage.setItem('sf_msg','Inicia sessão para aceder a esta página.');location.href='login.html';return false}
if(role==='admin'&&u.role!=='admin'){location.href='dashboard.html';return false}return true}
/* UI utilitária */
function toast(t){let b=$('#toasts');if(!b){b=document.createElement('div');b.id='toasts';b.setAttribute('aria-live','polite');document.body.append(b)}const e=document.createElement('div');e.className='toast';e.textContent=t;b.append(e);setTimeout(()=>e.remove(),3300)}
function modal(html,mount){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="box" role="dialog" aria-modal="true"><button class="x" data-c aria-label="Fechar">×</button>${html}</div>`;document.body.append(m);
const close=()=>m.remove();m.onclick=e=>{if(e.target===m||e.target.closest('[data-c]'))close()};m.addEventListener('keydown',e=>{if(e.key==='Escape')close()});/* nunca devolver false num handler onX: cancela a escrita */mount&&mount(m,close);const f=$('input,select,textarea,.btn',m);f&&f.focus();return close}
function openForm(title,fields,item,save){item=item||{};modal(`<h2 class="gold">${title}</h2><form novalidate>${fields.map(f=>{const v=item[f.n]??f.def??'',o=typeof f.opts==='function'?f.opts():f.opts;
let i=f.t==='select'?`<select name="${f.n}">${o.map(x=>{x=[].concat(x);return `<option value="${esc(x[0])}" ${x[0]==v?'selected':''}>${esc(x[1]??x[0])}</option>`}).join('')}</select>`:
f.t==='textarea'?`<textarea name="${f.n}" rows="3">${esc(v)}</textarea>`:`<input name="${f.n}" type="${f.t||'text'}" value="${esc(v)}" ${f.min!=null?`min="${f.min}"`:''} ${f.step?`step="${f.step}"`:''}>`;
return `<label>${f.l}${f.req?' *':''}${i}</label>`}).join('')}<p class="err" role="alert"></p><button class="btn p">Guardar</button></form>`,(m,close)=>{
$('form',m).onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),miss=fields.find(f=>f.req&&!String(d[f.n]??'').trim());
if(miss){$('.err',m).textContent='Preenche: '+miss.l+'.';return}fields.forEach(f=>{if(f.t==='number')d[f.n]=+d[f.n]||0});const r=save(d);if(r&&r.err){$('.err',m).textContent=r.err;return}close()}})}
/* CRUD genérico: usado por tarefas, disciplinas, planos, objetivos, lembretes, despesas e conteúdos IA */
function crud(c){const R=$('#content');R.innerHTML=`<div class="ph"><h1>${c.title}</h1><button class="btn p" id="new">+ ${c.newLabel||'Novo'}</button></div><div class="stats" id="st"></div>
<div class="row">${(c.filters||[]).map(f=>`<select data-f="${f.n}" aria-label="${f.l}">${f.o.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`).join('')}</div><div class="list" id="ls"></div>`;
const q={},draw=()=>{const all=DB.get(c.key),it=c.filter?all.filter(i=>c.filter(i,q)):all;$('#st').innerHTML=c.stats?c.stats(all):'';
$('#ls').innerHTML=it.length?it.map(i=>`<div class="item" data-id="${i.id}"><div class="ib">${c.row(i)}</div><div class="ia">${c.extra?c.extra(i):''}${c.toggle?`<button class="btn sm" data-a="tog" aria-label="Concluir/reabrir">${i[c.toggle]?'↺':'✓'}</button>`:''}<button class="btn sm" data-a="edit" aria-label="Editar">✎</button><button class="btn sm d" data-a="del" aria-label="Apagar">🗑</button></div></div>`).join(''):'<p class="mute">Ainda não há registos. Cria o primeiro!</p>'};
const form=i=>openForm((i?'Editar ':'Novo: ')+c.title,c.fields,i,d=>{const all=DB.get(c.key),er=c.validate&&c.validate(d);if(er)return{err:er};
if(i)Object.assign(all.find(x=>x.id===i.id),d);else all.push({id:uid(),created:new Date().toISOString(),...d});DB.set(c.key,all);draw();toast('Guardado!')});
$('#new').onclick=()=>form();$$('[data-f]',R).forEach(s=>s.onchange=()=>{q[s.dataset.f]=s.value;draw()});
$('#ls').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('[data-id]').dataset.id,all=DB.get(c.key),i=all.find(x=>x.id===id),a=b.dataset.a;
if(a==='edit')form(i);else if(a==='del'){if(confirm('Apagar este registo?')){DB.set(c.key,all.filter(x=>x.id!==id));draw();toast('Apagado.')}}
else if(a==='tog'){i[c.toggle]=!i[c.toggle];DB.set(c.key,all);draw()}else c.act&&c.act(a,i,all,draw)};draw()}
/* Estrutura das páginas */
const NAV=[['dashboard','Dashboard','▦'],['calendar','Calendário','📅'],['tasks','Tarefas','✅'],['subjects','Disciplinas','📚'],['study-plans','Planos de estudo','🧭'],['timer','Temporizador','⏱️'],['goals','Objetivos','🏆'],['progress','Progresso','📊'],['focus','Modo concentração','🎯'],['reminders','Lembretes','🔔'],['profile','Perfil','👤'],['settings','Definições','⚙️']];
const ANAV=[['admin','Visão geral','▦'],['admin-users','Utilizadores','👥'],['admin-ai','Conteúdos IA','🤖'],['admin-finance','Finanças','💶'],['admin-expenses','Despesas','🧾']];
function shell(area,page){const a=area==='admin',u=me();document.body.innerHTML=`<div class="shell"><aside class="side" id="side"><a class="logo gold" href="${a?'admin':'dashboard'}.html">StudyFlow${a?' <span class="badge">Admin</span>':''}</a><nav aria-label="Menu principal">
${(a?ANAV:NAV).map(n=>`<a href="${n[0]}.html" class="${n[0]===page?'on':''}"><span>${n[2]}</span>${n[1]}</a>`).join('')}${a?'<a href="dashboard.html"><span>↩</span>Área do estudante</a>':u.role==='admin'?'<a href="admin.html"><span>🛡️</span>Administração</a>':''}<button class="lnk" id="out"><span>🚪</span>Sair</button></nav></aside>
<div><header class="top"><button class="burger" id="bg" aria-label="Abrir menu" aria-expanded="false">☰</button><span class="mute">${esc(u.name)}</span></header><main id="content" class="pad"></main></div></div>`;$('#out').onclick=logoutUser}
function pub(){const L=[['index','Início'],['pricing','Preços'],['about','Sobre nós'],['contact','Contactos']];document.body.innerHTML=`<header class="pubh"><div class="wrap nav"><a class="logo gold" href="index.html">StudyFlow</a><button class="burger" id="bg" aria-label="Abrir menu" aria-expanded="false">☰</button>
<nav class="links" id="pl" aria-label="Menu">${L.map(l=>`<a href="${l[0]}.html">${l[1]}</a>`).join('')}${isLoggedIn()?'<a class="btn sm p" href="dashboard.html">Ir para o painel</a>':'<a class="btn sm" href="login.html">Entrar</a><a class="btn sm p" href="register.html">Criar conta</a>'}</nav></div></header><main id="content"></main>
<footer><div class="logo gold">StudyFlow</div><p>Organiza. Estuda. Evolui.</p><p><a href="index.html">Início</a><a href="index.html#funcionalidades">Funcionalidades</a><a href="pricing.html">Preços</a><a href="about.html">Sobre nós</a><a href="contact.html">Contactos</a><a href="terms.html">Termos e condições</a><a href="privacy.html">Política de privacidade</a></p><p>© 2026 StudyFlow. Todos os direitos reservados.</p></footer>`}
document.addEventListener('DOMContentLoaded',()=>{seed();document.documentElement.dataset.theme=localStorage.getItem('sf_theme')||'dark';const d=document.body.dataset,p=d.page;
if(d.area==='public')pub();else{if(!protectPage(d.area==='admin'?'admin':''))return;shell(d.area,p)}
$('#bg').onclick=()=>{const m=$('#side')||$('#pl'),o=m.classList.toggle('open');$('#bg').setAttribute('aria-expanded',o)};
PAGES[p]&&PAGES[p]();const m=sessionStorage.getItem('sf_msg');if(m){sessionStorage.removeItem('sf_msg');toast(m)}
if(d.area==='app'&&DB.get('settings',{}).notify!==false)DB.get('reminders').filter(r=>!r.done&&r.date&&r.date<=today()).slice(0,2).forEach(r=>toast('🔔 Lembrete: '+r.title))});
