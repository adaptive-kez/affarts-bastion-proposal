const packageButtons=[...document.querySelectorAll('[data-package]')];
function selectPackage(button,scroll=true){
 const id=button.dataset.package;
 packageButtons.forEach(b=>{
  const selected=b===button;
  b.setAttribute('aria-pressed',String(selected));
  b.textContent=selected?'Выбран: '+b.dataset.name.toLowerCase():'Смотреть состав';
  document.querySelector(`[data-card="${b.dataset.package}"]`).classList.toggle('is-selected',selected);
 });
 document.querySelectorAll('.package-panel').forEach(p=>p.hidden=p.id!==`panel-${id}`);
 const status=document.getElementById('package-status');
 status.textContent=`${button.dataset.name} пакет · ${new Intl.NumberFormat('ru-RU').format(Number(button.dataset.price))} ₽`;
 document.getElementById('discussed-package').textContent=button.dataset.name.toLowerCase();
 if(scroll){
  const panel=document.getElementById(`panel-${id}`);
  panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }
}
packageButtons.forEach(b=>b.addEventListener('click',()=>selectPackage(b)));
document.querySelectorAll('[data-discuss-package]').forEach(b=>b.addEventListener('click',()=>document.getElementById('discussed-package').textContent=b.dataset.discussPackage.toLowerCase()));
document.getElementById('print-proposal').addEventListener('click',()=>window.print());
