'use strict';
const copy = {
fr:{reservations:'Réservations',private:'Espace privé du cabinet',website:'Voir le site ↗',workspace:'ESPACE PROPRIÉTAIRE',logout:'Déconnexion',title:'Votre carnet de rendez-vous.',intro:'Consultez et organisez les visites de vos patients. Horaires à l’heure d’Algérie (UTC+1).',secure:'ACCÈS SÉCURISÉ',loginTitle:'Connexion propriétaire',inviteNote:'Accès sur invitation, réservé aux comptes ayant le rôle admin.',email:'Adresse e-mail',password:'Mot de passe',login:'Se connecter',forgot:'Mot de passe oublié',date:'Date du rendez-vous',search:'Rechercher sur cette page',today:'Aujourd’hui',all:'Toutes les dates',refresh:'Actualiser',prev:'Page précédente',next:'Page suivante',move:'Déplacer le rendez-vous',time:'Heure d’Algérie',back:'Retour',save:'Enregistrer',cancelTitle:'Annuler ce rendez-vous ?',cancelNote:'Cette action supprime la réservation et libère le créneau. Prévenez le patient directement : aucune notification automatique n’est envoyée.',keep:'Conserver',cancel:'Confirmer l’annulation',cancelAction:'Annuler',loading:'Chargement…',empty:'Aucune réservation à afficher.',error:'Opération impossible. Vérifiez les informations et réessayez.',authError:'Connexion impossible. Vérifiez vos identifiants ou votre lien d’invitation.',forbidden:'Ce compte n’a pas accès aux réservations. Le propriétaire doit lui attribuer le rôle admin dans Netlify Identity.',expired:'Connectez-vous pour accéder aux réservations.',recoverySent:'Si cette adresse correspond à un compte, un lien de récupération vous est envoyé. Consultez votre messagerie.',setPassword:'Choisissez votre mot de passe (10 caractères minimum)',saved:'Rendez-vous déplacé.',cancelled:'Réservation annulée.',conflict:'Ce créneau est déjà réservé. Choisissez une autre heure.',missing:'Cette réservation n’existe plus. Actualisez la liste.',count:'réservation(s) sur cette page',page:'Page',consultation:'Consultation',cleaning:'Détartrage',care:'Soins dentaires',prosthetics:'Prothèses',whitening:'Blanchiment',emergency:'Urgence',notes:'Notes'},
ar:{reservations:'الحجوزات',private:'مساحة خاصة بالعيادة',website:'عرض الموقع ↖',workspace:'مساحة المالك',logout:'تسجيل الخروج',title:'سجل مواعيد عيادتكم.',intro:'اطّلعوا على زيارات المرضى ونظّموها. الأوقات بتوقيت الجزائر (UTC+1).',secure:'دخول آمن',loginTitle:'دخول المالك',inviteNote:'الدخول بالدعوة فقط للحسابات التي تحمل دور admin.',email:'البريد الإلكتروني',password:'كلمة المرور',login:'تسجيل الدخول',forgot:'نسيت كلمة المرور',date:'تاريخ الموعد',search:'البحث في هذه الصفحة',today:'اليوم',all:'كل التواريخ',refresh:'تحديث',prev:'الصفحة السابقة',next:'الصفحة التالية',move:'تغيير موعد الزيارة',time:'توقيت الجزائر',back:'رجوع',save:'حفظ',cancelTitle:'إلغاء هذا الموعد؟',cancelNote:'يؤدي هذا الإجراء إلى حذف الحجز وإتاحة الوقت. يرجى إبلاغ المريض مباشرة، فلا تُرسل إشعارات تلقائية.',keep:'الاحتفاظ',cancel:'تأكيد الإلغاء',cancelAction:'إلغاء',loading:'جارٍ التحميل…',empty:'لا توجد حجوزات للعرض.',error:'تعذّر تنفيذ العملية. تحقّقوا من المعلومات وحاولوا مجدداً.',authError:'تعذّر تسجيل الدخول. تحقّقوا من بيانات الدخول أو رابط الدعوة.',forbidden:'هذا الحساب غير مخوّل للاطلاع على الحجوزات. يجب على المالك منحه دور admin في Netlify Identity.',expired:'سجّلوا الدخول للاطلاع على الحجوزات.',recoverySent:'إذا كان البريد مرتبطاً بحساب، فسيُرسل رابط لاستعادة كلمة المرور. راجعوا بريدكم.',setPassword:'اختاروا كلمة مرور من 10 أحرف على الأقل',saved:'تم تغيير الموعد.',cancelled:'تم إلغاء الحجز.',conflict:'هذا الوقت محجوز. اختاروا وقتاً آخر.',missing:'لم يعد هذا الحجز موجوداً. حدّثوا القائمة.',count:'حجز في هذه الصفحة',page:'الصفحة',consultation:'استشارة',cleaning:'تنظيف الأسنان',care:'علاج الأسنان',prosthetics:'تركيبات الأسنان',whitening:'تبييض الأسنان',emergency:'حالة مستعجلة',notes:'ملاحظات'}
};
const $ = id => document.getElementById(id);
let lang = 'fr', rows = [], page = 0, more = false, selected = null, callback = null, requestVersion = 0;
const t = key => copy[lang][key] || key;
function message(key = '', error = false) { $('message').textContent = key ? t(key) : ''; $('message').className = error ? 'error' : ''; }
function translate() {
 document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
 document.querySelectorAll('[data-t]').forEach(el => el.textContent = t(el.dataset.t));
 $('lang').textContent = lang === 'fr' ? 'العربية' : 'Français';
 $('lang').lang = lang === 'fr' ? 'ar' : 'fr';
 if (callback) { $('authTitle').textContent = t('setPassword'); $('loginButton').textContent = t('save'); }
 render();
}
function locked(key) { if (!callback) { $('emailField').hidden=false; $('email').required=true; $('forgot').hidden=false; $('password').minLength=1; $('password').autocomplete='current-password'; $('authTitle').textContent=t('loginTitle'); $('loginButton').textContent=t('login'); } requestVersion++; rows = []; render(); $('dashboard').hidden = true; $('auth').hidden = false; $('logout').hidden = key !== 'forbidden'; message(key, true); }
async function api(path, method = 'GET', body) {
 const response = await fetch(path, { method, cache:'no-store', headers: body ? {'Content-Type':'application/json'} : {}, body: body ? JSON.stringify(body) : undefined });
 if (!response.ok) { const err = new Error('request'); err.status = response.status; throw err; }
 return response.json();
}
async function session() {
 try {
  const state = await api('/api/owner-auth');
  if (!state.authenticated) return locked('expired');
  if (!state.admin) return locked('forbidden');
  $('auth').hidden = true; $('dashboard').hidden = false; $('logout').hidden = false; message(); await load();
 } catch { locked('authError'); }
}
async function load() {
 const version = ++requestVersion;
 rows = []; render(); message('loading'); $('refresh').disabled = true;
 try {
  const query = new URLSearchParams({page: String(page)}); if ($('date').value) query.set('date', $('date').value);
  const result = await api('/api/owner-appointments?' + query);
  if (version !== requestVersion) return;
  rows = result.rows; more = result.more; render(); message(); return true;
 } catch (error) {
  if (version !== requestVersion) return;
  if (error.status === 401 || error.status === 403) locked(error.status === 403 ? 'forbidden' : 'expired');
  else message('error', true);
 } finally { if (version === requestVersion) $('refresh').disabled = false; }
}
function node(tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function render() {
 const list = $('list'); list.replaceChildren();
 const query = $('search').value.trim().toLocaleLowerCase();
 const filtered = rows.filter(row => [row.name,row.phone,row.notes,t(row.service)].join(' ').toLocaleLowerCase().includes(query));
 $('count').textContent = filtered.length + ' ' + t('count'); $('page').textContent = t('page') + ' ' + (page + 1);
 $('prev').disabled = page === 0; $('next').disabled = !more;
 if (!filtered.length) list.append(node('p',t('empty'),'owner-empty'));
 for (const row of filtered) {
  const card = node('article','','owner-card');
  const date = new Date(row.startsAt);
  const when = node('div', date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {timeZone:'Africa/Algiers',day:'numeric',month:'short',year:'numeric'}),'owner-when');
  when.append(node('strong',date.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ',{timeZone:'Africa/Algiers',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})));
  const details = node('div',''); details.append(node('h3',row.name),node('p',t(row.service)));
  const phone = node('a',row.phone,'owner-phone'); phone.dir = 'ltr'; if (/^(0[567]\d{8}|\+213[567]\d{8})$/.test(row.phone)) phone.href = 'tel:' + row.phone; details.append(phone);
  if (row.notes) details.append(node('p',t('notes') + ' : ' + row.notes,'owner-notes'));
  const actions = node('div','','owner-actions');
  const move = node('button',t('move'),'button outline'); move.onclick = () => openEdit(row);
  const cancel = node('button',t('cancelAction'),'button outline'); cancel.onclick = () => { selected = row; $('cancelPatient').textContent = row.name; $('cancelDialog').showModal(); };
  actions.append(move,cancel); card.append(when,details,actions); list.append(card);
 }
}
function algeriaDate(date = new Date()) { return new Date(date.getTime() + 3600000).toISOString().slice(0,10); }
function openEdit(row) {
 selected = row; $('editPatient').textContent = row.name; $('editError').textContent = '';
 $('editDate').min = algeriaDate(); $('editDate').max = algeriaDate(new Date(Date.now() + 179*86400000));
 $('editDate').value = algeriaDate(new Date(row.startsAt));
 $('editTime').value = new Date(new Date(row.startsAt).getTime() + 3600000).toISOString().slice(11,16);
 $('edit').showModal();
}
for (let i=0;i<24;i++) { const time = String(i).padStart(2,'0') + ':00'; const option = node('option',time); option.value = time; $('editTime').append(option); }
$('lang').onclick = () => { lang = lang === 'fr' ? 'ar' : 'fr'; message(); translate(); };
$('search').oninput = render;
$('date').onchange = () => { page=0; load(); };
$('today').onclick = () => { $('date').value = algeriaDate(); page=0; load(); };
$('all').onclick = () => { $('date').value=''; page=0; load(); };
$('refresh').onclick = load;
$('prev').onclick = () => { if(page>0) {page--;load();} };
$('next').onclick = () => { if(more) {page++;load();} };
$('logout').onclick = async () => { try { await api('/api/owner-auth','POST',{action:'logout'}); locked('expired'); $('logout').hidden=true; } catch { message('error',true); } };
$('loginForm').onsubmit = async event => {
 event.preventDefault(); const button = $('loginButton'); button.disabled=true; message('loading');
 try {
  await api('/api/owner-auth','POST', callback ? {action:callback.action,token:callback.token,password:$('password').value} : {action:'login',email:$('email').value,password:$('password').value});
  $('password').value=''; callback=null; await session();
 } catch { message('authError',true); } finally {button.disabled=false;}
};
$('forgot').onclick = async () => {
 if (!$('email').reportValidity()) return;
 $('forgot').disabled=true;
 try { await api('/api/owner-auth','POST',{action:'recovery',email:$('email').value}); message('recoverySent'); }
 catch { message('recoverySent'); } finally {$('forgot').disabled=false;}
};
$('closeEdit').onclick = () => $('edit').close(); $('keep').onclick = () => $('cancelDialog').close();
$('editForm').onsubmit = async event => {
 event.preventDefault(); const button = event.submitter; button.disabled=true; $('editError').textContent='';
 try { await api('/api/owner-appointments','PATCH',{id:selected.id,date:$('editDate').value,time:$('editTime').value}); $('edit').close(); if (await load()) message('saved'); }
 catch (error) { if (error.status===401 || error.status===403) { $('edit').close(); locked(error.status===403?'forbidden':'expired'); } else $('editError').textContent=t(error.status===409?'conflict':error.status===404?'missing':'error'); }
 finally {button.disabled=false;}
};
$('confirmCancel').onclick = async () => {
 $('confirmCancel').disabled=true;
 try { await api('/api/owner-appointments','DELETE',{id:selected.id}); $('cancelDialog').close(); if (await load()) message('cancelled'); }
 catch(error) { $('cancelDialog').close(); if (error.status===401 || error.status===403) locked(error.status===403?'forbidden':'expired'); else message(error.status===404?'missing':'error',true); }
 finally { $('confirmCancel').disabled=false; }
};
async function init() {
 const hash = new URLSearchParams(location.hash.slice(1));
 if (hash.has('invite_token') || hash.has('recovery_token')) {
  callback = {action:hash.has('invite_token')?'invite':'reset',token:hash.get('invite_token') || hash.get('recovery_token')};
  history.replaceState(null,'',location.pathname); $('auth').hidden=false; $('emailField').hidden=true; $('email').required=false; $('forgot').hidden=true; $('password').minLength=10; $('password').autocomplete='new-password'; translate(); return;
 }
 if(hash.has('confirmation_token')) { const token=hash.get('confirmation_token'); history.replaceState(null,'',location.pathname); try { await api('/api/owner-auth','POST',{action:'confirm',token}); } catch { locked('authError'); return; } }
 translate(); await session();
}
init();
