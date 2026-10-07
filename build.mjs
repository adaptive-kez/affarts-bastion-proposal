import {readFileSync,writeFileSync,cpSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(readFileSync(resolve(root,'proposal-data.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
for(const p of data.packages){
 if(p.groups.reduce((sum,g)=>sum+g.price,0)!==p.total)throw new Error('Стоимость этапов не совпадает с итогом: '+p.name);
 if(p.groups.flatMap(g=>g.items).length!==15)throw new Error('Неполный состав пакета: '+p.name);
}
const cards=data.packages.map((p,i)=>`<article class="package-card${i===1?' is-selected':''}" data-card="${p.id}">
 <p class="package-index">0${i+1} / Пакет</p><h3>${esc(p.name)}</h3><p class="package-caption">${esc(p.caption)}</p>
 <strong class="package-price">${money(p.total)}</strong><ul class="package-features">${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
 <dl class="package-costs">${p.groups.map((g,j)=>`<div><dt><span>0${j+1}</span> ${esc(g.title)}</dt><dd>${g.price?money(g.price):'Не входит'}</dd></div>`).join('')}</dl>
 <button class="package-button" type="button" data-package="${p.id}" data-price="${p.total}" data-name="${esc(p.name)}" aria-pressed="${i===1}" aria-controls="panel-${p.id}">${i===1?'Выбран: средний':'Смотреть состав'}</button>
</article>`).join('');
const panels=data.packages.map((p,i)=>`<section class="package-panel" id="panel-${p.id}" aria-labelledby="heading-${p.id}" ${i===1?'':'hidden'}>
 <div class="package-detail-heading"><div><p class="eyebrow">Подробный состав пакета</p><h3 id="heading-${p.id}">${esc(p.name)}</h3><p>${esc(p.intro)}</p></div><div class="detail-total"><span>Итого за пакет</span><strong>${money(p.total)}</strong></div></div>
 <div class="scope-groups">${p.groups.map((g,j)=>`<details class="scope-group" ${j===0?'open':''}><summary><span class="scope-number">0${j+1}</span><span class="scope-title">${esc(g.title)}</span><span class="scope-price">${g.price?money(g.price):'Не входит'}</span><span class="scope-toggle" aria-hidden="true">+</span></summary><div class="scope-items">${g.items.map(item=>`<div class="scope-item${item.description==='Не входит.'?' excluded':''}"><h4>${esc(item.title)}</h4><p>${esc(item.description).replace(/СП/g,'спецпредложение')}</p></div>`).join('')}</div></details>`).join('')}</div>
 <div class="selected-package-footer"><p>Два консолидированных раунда правок на этап в рамках утверждённого направления.</p><a class="button" href="#contacts" data-discuss-package="${esc(p.name)}">Обсудить ${p.name.toLowerCase()} пакет ↗</a></div>
</section>`).join('');
let html=readFileSync(resolve(root,'index.template.html'),'utf8').replace('{{PACKAGE_CARDS}}',cards).replace('{{PACKAGE_PANELS}}',panels);
const styleVersion=createHash('sha256').update(readFileSync(resolve(root,'bastion.css'))).digest('hex').slice(0,12);
html=html.replace('href="bastion.css"',`href="bastion.css?v=${styleVersion}"`);
if(/\{\{[A-Z_]+\}\}/.test(html))throw new Error('Остались незаполненные поля');
writeFileSync(resolve(root,'index.html'),html);
const dist=resolve(root,'dist');rmSync(dist,{recursive:true,force:true});mkdirSync(dist,{recursive:true});
for(const f of ['index.html','styles.css','v3.css','bastion.css','app.js','packages.js','assets'])cpSync(resolve(root,f),resolve(dist,f),{recursive:true});
console.log('Сайт собран: '+data.packages.map(p=>p.name+' '+money(p.total)).join(' / '));
