const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
let KB, SOURCES, USER_UPLOADS=[];

const FALLBACK_ICONS = {
  foundation:'🧠', stack:'🧩', global:'🌍', vietnam:'🇻🇳', industries:'🏭', 'niche-map-40':'🗺️', niches:'🎯', careers:'🧭', career15:'🧑‍💼', evaluation:'✅', governance:'🛡️', roadmap:'🚀',
  opportunity:'💎', vietnamTag:'🇻🇳', risk:'⚠️', career:'🧭', build:'🧱', money:'💰'
};
const ARCH_ICONS = {'Lõi suy luận':'🧠','Bộ nhớ':'🗂️','Công cụ':'🔌','Bộ lập kế hoạch':'🧭','Lan can an toàn':'🛡️'};

async function loadJSON(path, fallback){
  try{ const r = await fetch(path, {cache:'no-store'}); if(!r.ok) throw new Error(r.status); return await r.json(); }
  catch(e){ console.warn('Không tải được', path, e); return fallback; }
}

function safe(s){return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function slug(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function includesText(obj, q){return JSON.stringify(obj).toLowerCase().includes(q.toLowerCase());}
function sectionById(id){return (KB.sections||[]).find(s=>s.id===id) || {};}
function iconForSection(id){return sectionById(id).icon || FALLBACK_ICONS[id] || '✨';}
function highlightIcon(type){return ({opportunity:'💎', vietnam:'🇻🇳', risk:'⚠️', career:'🧭', build:'🧱', money:'💰'}[type] || '✨');}
function sectionLabel(id){return ({foundation:'Nền tảng', stack:'Chuỗi giá trị', global:'Thị trường thế giới', vietnam:'Việt Nam', industries:'Tác động theo ngành', 'niche-map-40':'Bản đồ 40 ngách', niches:'Ngách phát triển', careers:'Nghề nghiệp', career15:'15 nghề mới', evaluation:'Khung tự đánh giá', governance:'Quản trị rủi ro', roadmap:'Lộ trình', unclassified:'Chưa phân loại'}[id] || id);}

function buildNav(){
  const nav = $('#nav');
  const links = [
    ['#top','Tổng quan'], ['#reading','Thứ tự đọc'], ['#summary','Tóm tắt'], ['#highlights','Điểm nổi bật'], ['#glossary','Thuật ngữ'],
    ...KB.reading_order.map(x=>['#'+x.id, `${iconForSection(x.id)} ${x.label.replace(/^\d+\.\s*/, '')}`]),
    ['#niches','🎯 12 ngách'], ['#careers','🧭 Nghề mới'], ['#career15','🧑‍💼 15 nghề'], ['#upload','⬆️ Tài liệu mới'], ['#sources','📚 Nguồn']
  ];
  nav.innerHTML = links.map(([href,label])=>`<a href="${href}">${safe(label)}</a>`).join('');
  const sections = links.map(([href])=>$(href)).filter(Boolean);
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ $$('nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id)); } });
  }, {rootMargin:'-30% 0px -65% 0px'});
  sections.forEach(s=>obs.observe(s));
}

function renderMeta(){
  $('#appTitle').textContent = KB.meta.title;
  $('#appSubtitle').textContent = KB.meta.subtitle + ' — ' + KB.meta.scope;
  $('#nicheCount').textContent = KB.niches.length;
}

function renderReadingOrder(){
  $('#readingOrder').innerHTML = KB.reading_order.map((item, i)=>`
    <a class="timeline-item" href="#${item.id}">
      <div class="timeline-num">${i+1}</div>
      <div><strong><span class="inline-icon">${iconForSection(item.id)}</span>${safe(item.label)}</strong><p>${safe(item.why)}</p></div>
    </a>`).join('');
}

function renderSummary(){
  $('#executiveSummary').innerHTML = KB.executive_summary.map((s,i)=>`
    <div class="summary-card important-card"><b>${String(i+1).padStart(2,'0')}</b><p>${safe(s)}</p></div>`).join('');
}

function renderHighlights(){
  const data = KB.highlights || [];
  $('#highlightCards').innerHTML = data.map(h=>`
    <article class="highlight-card ${safe(h.type)}">
      <div class="highlight-icon">${highlightIcon(h.type)}</div>
      <div>
        <span class="highlight-label">${safe(h.label)}</span>
        <h3>${safe(h.title)}</h3>
        <p>${safe(h.text)}</p>
      </div>
    </article>`).join('');
}

function renderGlossary(q=''){
  const items = (KB.glossary || []).filter(g=>!q || includesText(g,q));
  $('#glossaryCards').innerHTML = items.map(g=>`
    <article class="glossary-card" id="term-${slug(g.term)}">
      <div class="term-head"><span class="term-icon">${termIcon(g.term)}</span><div><h3>${safe(g.term)}</h3><small>${safe(g.aka || '')}</small></div></div>
      <p class="definition"><strong>Dễ hiểu:</strong> ${safe(g.simple)}</p>
      <p><strong>Vì sao quan trọng:</strong> ${safe(g.why)}</p>
      <p class="example"><strong>Ví dụ:</strong> ${safe(g.example)}</p>
    </article>`).join('') || '<p class="muted">Không tìm thấy thuật ngữ phù hợp.</p>';
}
function termIcon(term){
  const t = term.toLowerCase();
  if(t.includes('dọc')) return '🏢'; if(t.includes('ngang')) return '↔️'; if(t.includes('ops')) return '📊';
  if(t.includes('an toàn') || t.includes('con người') || t.includes('quản trị')) return '🛡️'; if(t.includes('bộ nhớ')) return '🗂️';
  if(t.includes('kế hoạch') || t.includes('điều phối')) return '🧭'; if(t.includes('truy xuất')) return '📚'; if(t.includes('công cụ')) return '🔌';
  if(t.includes('trình duyệt')) return '🌐'; if(t.includes('thiết bị biên')) return '📱'; if(t.includes('gắn mác')) return '🧼';
  return '✨';
}


function industryIcon(name){
  const s=String(name||'').toLowerCase();
  if(s.includes('giáo')) return '🎓'; if(s.includes('y tế')) return '🏥'; if(s.includes('tài chính')) return '🏦';
  if(s.includes('vừa')) return '🏪'; if(s.includes('logistics')) return '🚚'; if(s.includes('sản xuất')) return '🏭';
  if(s.includes('nông')) return '🌾'; if(s.includes('chính phủ')) return '🏛️'; if(s.includes('marketing')) return '📣'; if(s.includes('an ninh')) return '🛡️';
  return '📌';
}
function renderNiche40(items){
  return items.map(n=>`
    <article class="niche40-card">
      <div class="niche40-top"><span>#${n.no}</span><h4>${safe(n.name)}</h4></div>
      <p><strong>Khách hàng trả tiền:</strong> ${safe(n.customers)}</p>
      <p><strong>Bản thử nghiệm ban đầu:</strong> ${safe(n.mvp)}</p>
      <p><strong>Mục đích / lưu ý:</strong> ${safe(n.purpose)}</p>
    </article>`).join('');
}


function renderRoleList(items){
  return (items||[]).map(x=>`<li>${safe(x)}</li>`).join('');
}
function tierClass(t){
  if(String(t||'').includes('TẦNG 1') || String(t||'').includes('Tầng 1')) return 'tier-one';
  if(String(t||'').includes('TẦNG 2') || String(t||'').includes('Tầng 2')) return 'tier-two';
  if(String(t||'').includes('TẦNG 3') || String(t||'').includes('Tầng 3')) return 'tier-three';
  return '';
}
function renderCareer15(section){
  const roles = section.career15_roles || [];
  const tierIntro = section.tier_intro ? `<div class="tier-strip">${section.tier_intro.map(x=>`<span>${safe(x)}</span>`).join('')}</div>` : '';
  const notes = section.important_notes ? `<div class="note-list">${section.important_notes.map(x=>`<p>💡 ${safe(x)}</p>`).join('')}</div>` : '';
  const cards = roles.map(r=>`
    <article class="career15-card ${tierClass(r.tier)}" data-tier="${safe(r.tier_short||r.tier)}">
      <div class="career15-head">
        <span class="career-no">${safe(r.no)}</span>
        <div><h4>${safe(r.role)}</h4><p class="role-international">Tên quốc tế để tìm việc: ${safe(r.international_title)}</p></div>
      </div>
      <div class="career15-tags"><span>${safe(r.tier)}</span><span>${safe(r.vn_salary)}</span><span>${safe(r.primary_company)}</span></div>
      <p class="role-desc">${safe(r.description)}</p>
      <details open><summary>Phục vụ doanh nghiệp nào?</summary><ul>${renderRoleList(r.companies_served)}</ul><p><strong>Phục vụ nhiều nhất:</strong> ${safe(r.most_served)}</p></details>
      <details><summary>Phục vụ như thế nào?</summary><ul>${renderRoleList(r.service_how)}</ul></details>
      <details><summary>Ví dụ thực tế</summary><p>${safe(r.application_example)}</p></details>
      <details><summary>Kỹ năng, lương và tín hiệu thị trường</summary><p><strong>Kỹ năng cốt lõi:</strong> ${safe(r.skills)}</p><p><strong>Lương tham chiếu:</strong> ${safe(r.salary_reference)}</p><p><strong>Tín hiệu thị trường:</strong> ${safe(r.market_signal)}</p><p><strong>Nguồn:</strong> ${safe(r.role_sources)}</p></details>
    </article>`).join('');
  const salaryNotes = section.salary_notes ? `<div class="salary-notes"><h3><span class="inline-icon">💰</span>Ghi chú lương</h3>${section.salary_notes.map(x=>`<p>${safe(x)}</p>`).join('')}</div>` : '';
  return `${tierIntro}${notes}<div class="section-tools"><input class="search mini-search" id="career15Search" placeholder="Tìm trong 15 nghề: vận hành, dữ liệu, pháp lý, robot..." /></div><div id="career15Cards" class="career15-grid">${cards}</div>${salaryNotes}`;
}

function renderDynamic(section){
  const parts=[];
  if(section.visual) parts.push(`<div class="visual-wrap"><img src="${safe(section.visual)}" alt="Minh họa ${safe(section.title)}" /></div>`);
  if(section.bullets) parts.push(`<div class="pill-list">${section.bullets.map(b=>`<span class="pill"><span class="mini-dot"></span>${safe(b)}</span>`).join('')}</div>`);
  if(section.architecture) parts.push(`<div class="grid icon-grid">${section.architecture.map(a=>`<div class="mini-card"><div class="card-icon">${ARCH_ICONS[a.name] || '✨'}</div><h4>${safe(a.name)}</h4><p><strong>Vai trò:</strong> ${safe(a.role)}</p><p><strong>Ví dụ:</strong> ${safe(a.examples)}</p></div>`).join('')}</div>`);
  if(section.layers) parts.push(`<div class="grid icon-grid">${section.layers.map((l,i)=>`<div class="mini-card layer-card"><div class="card-icon">${['🧱','🔌','↔️','🏢','🛡️'][i] || '✨'}</div><h4>${safe(l.layer)}</h4><p>${safe(l.includes)}</p><p><strong>Giá trị:</strong> ${safe(l.value)}</p></div>`).join('')}</div>`);
  if(section.metrics) parts.push(`<div class="metrics">${section.metrics.map(m=>`<div class="metric"><strong>${safe(m.value)}</strong><label>${safe(m.label)}</label><span>${safe(m.source)}</span></div>`).join('')}</div>`);
  if(section.market_zones) parts.push(`<div class="grid icon-grid">${section.market_zones.map((z,i)=>`<div class="mini-card"><div class="card-icon">${['✅','🌱','🔮'][i] || '📌'}</div><h4>${safe(z.zone)}</h4><p>${safe(z.items)}</p><p><strong>Logic:</strong> ${safe(z.logic)}</p></div>`).join('')}</div>`);
  if(section.risks) parts.push(`<h3><span class="inline-icon">⚠️</span>Rủi ro chính</h3><div class="pill-list risk-list">${section.risks.map(r=>`<span class="pill risk-pill">${safe(r)}</span>`).join('')}</div>`);
  if(section.entry_points) parts.push(`<h3><span class="inline-icon">🇻🇳</span>Mũi nhọn vào Việt Nam</h3><div class="pill-list">${section.entry_points.map(r=>`<span class="pill priority-pill">${safe(r)}</span>`).join('')}</div>`);
  if(section.constraints) parts.push(`<h3><span class="inline-icon">⛔</span>Điểm nghẽn</h3><div class="pill-list">${section.constraints.map(r=>`<span class="pill risk-pill">${safe(r)}</span>`).join('')}</div>`);
  if(section.career_groups) parts.push(`<div class="grid icon-grid">${section.career_groups.map((g,i)=>`<div class="mini-card"><div class="card-icon">${['🔄','🆕','🔮'][i] || '🧭'}</div><h4>${safe(g.group)}</h4><ul class="career-list">${g.items.map(x=> typeof x === 'string' ? `<li>${safe(x)}</li>` : `<li><strong>${safe(x.name)}</strong><span>${safe(x.definition)}</span></li>`).join('')}</ul></div>`).join('')}</div>`);
  if(section.career15_roles) parts.push(renderCareer15(section));

  if(section.selection_criteria) parts.push(`<h3><span class="inline-icon">🎯</span>Tiêu chí chọn ngách</h3><div class="pill-list">${section.selection_criteria.map(c=>`<span class="pill priority-pill">${safe(c)}</span>`).join('')}</div>`);
  if(section.industry_applications) parts.push(`<div class="industry-grid">${section.industry_applications.map(x=>`
    <article class="industry-card">
      <div class="industry-title"><span>${industryIcon(x.industry)}</span><h4>${safe(x.industry)}</h4></div>
      <p><strong>Tác vụ giao cho tác nhân:</strong> ${safe(x.tasks)}</p>
      <p><strong>Ai trả tiền:</strong> ${safe(x.payers)}</p>
      <p><strong>Giá trị:</strong> ${safe(x.value)}</p>
      <p><strong>Rủi ro cần kiểm soát:</strong> ${safe(x.risk)}</p>
      <p><strong>Nghề đi kèm:</strong> ${safe(x.roles)}</p>
    </article>`).join('')}</div>`);
  if(section.niche_map40) parts.push(`<div class="section-tools"><input class="search mini-search" id="niche40Search" placeholder="Tìm trong 40 ngách: kế toán, logistics, giáo dục..." /></div><div id="niche40Cards" class="niche40-grid">${renderNiche40(section.niche_map40)}</div>`);
  if(section.detailed_roles) parts.push(`<div class="deep-role-grid">${section.detailed_roles.map(r=>`
    <article class="deep-role-card">
      <div class="deep-role-head"><span>${careerIcon(r.role)}</span><h4>${safe(r.role)}</h4></div>
      <p><strong>Mục đích:</strong> ${safe(r.purpose)}</p>
      <p><strong>Doanh nghiệp phục vụ:</strong> ${safe(r.companies)}</p>
      <p><strong>Áp dụng thực tế:</strong> ${safe(r.application)}</p>
      <p><strong>Kỹ năng nên có:</strong> ${safe(r.skills)}</p>
    </article>`).join('')}</div>`);
  if(section.scoring_criteria) parts.push(`<div class="criteria-grid">${section.scoring_criteria.map(c=>`
    <article class="criteria-card">
      <h4>${safe(c.criterion)}</h4>
      <p><strong>Câu hỏi:</strong> ${safe(c.question)}</p>
      <p><strong>Dấu hiệu tốt:</strong> ${safe(c.good_signal)}</p>
    </article>`).join('')}</div>`);

  if(section.controls) parts.push(`<div class="grid icon-grid">${section.controls.map((c,i)=>`<div class="mini-card"><div class="card-icon">${['🔐','🧪','👤','📜','📉','🛡️'][i] || '✅'}</div><p>${safe(c)}</p></div>`).join('')}</div>`);
  if(section.steps) parts.push(`<div class="timeline roadmap-timeline">${section.steps.map((s,i)=>`<div class="timeline-item"><div class="timeline-num">${i+1}</div><div><strong>${safe(s.time)} — ${safe(s.task)}</strong><p>${safe(s.output)}</p></div></div>`).join('')}</div>`);
  return parts.join('');
}

function renderSections(){
  const container = $('#sectionsContainer');
  const tpl = $('#sectionTemplate');
  container.innerHTML='';
  KB.sections.forEach(section=>{
    const node = tpl.content.cloneNode(true);
    const card = $('.content-section', node);
    card.id = section.id;
    $('.section-kicker', node).textContent = section.kicker;
    $('.section-title', node).innerHTML = `<span class="section-icon">${safe(section.icon || '✨')}</span>${safe(section.title)}`;
    $('.section-summary', node).textContent = section.summary;
    $('.section-dynamic', node).innerHTML = renderDynamic(section);
    $('.note', node).innerHTML = section.strategic_note ? `<strong>Điểm chiến lược:</strong> ${safe(section.strategic_note)}` : '';
    container.appendChild(node);
  });
}

function populateFieldFilter(){
  const fields = [...new Set(KB.niches.map(n=>n.field.split('/')[0].trim()))].sort();
  $('#fieldFilter').innerHTML += fields.map(f=>`<option value="${safe(f)}">${safe(f)}</option>`).join('');
}
function nicheIcon(n){
  const s = `${n.name} ${n.field}`.toLowerCase();
  if(s.includes('logistics') || s.includes('cảng')) return '🚢'; if(s.includes('marketing')) return '📣'; if(s.includes('legal') || s.includes('pháp')) return '⚖️';
  if(s.includes('kế toán') || s.includes('thuế')) return '🧾'; if(s.includes('tutor') || s.includes('giáo')) return '🎓'; if(s.includes('agentops')) return '📊';
  if(s.includes('quản trị')) return '🛡️'; if(s.includes('nhân sự') || s.includes('tuyển')) return '👥'; if(s.includes('bảo trì') || s.includes('nhà máy')) return '🏭';
  if(s.includes('nông')) return '🌾'; if(s.includes('bệnh')) return '🏥'; return '💬';
}
function priorityBadge(n){
  if(n.score >= 4.75) return '<span class="badge hot">🔥 Ưu tiên cao</span>';
  if((n.risks||'').toLowerCase().includes('pháp') || (n.risks||'').toLowerCase().includes('dữ liệu')) return '<span class="badge risk">🛡️ Cần lan can an toàn</span>';
  return '<span class="badge">📌 Theo dõi</span>';
}
function renderNiches(){
  const field = $('#fieldFilter').value;
  const sort = $('#sortNiches').value;
  let arr = [...KB.niches];
  if(field !== 'all') arr = arr.filter(n=>n.field.includes(field));
  if(sort==='score') arr.sort((a,b)=>b.score-a.score || a.rank-b.rank);
  if(sort==='timeline') arr.sort((a,b)=>(parseInt(a.timeline)||99) - (parseInt(b.timeline)||99));
  if(sort==='rank') arr.sort((a,b)=>a.rank-b.rank);
  $('#nicheCards').innerHTML = arr.map(n=>`
    <article class="niche-card" data-niche="${safe(n.name)}">
      <div class="niche-top"><div class="rank">#${n.rank}</div><div class="niche-icon">${nicheIcon(n)}</div><div class="score">${n.score.toFixed(1)}/5</div></div>
      <h3>${safe(n.name)}</h3>
      <p>${safe(n.field)}</p>
      <div class="bar" title="Điểm ưu tiên"><i style="width:${Math.round(n.score/5*100)}%"></i></div>
      <div class="tags"><span class="tag">${safe(n.timeline)}</span><span class="tag">${safe(n.revenue.split('+')[0])}</span>${priorityBadge(n)}</div>
      <p class="why"><strong>Vì sao đáng chú ý:</strong> ${safe(n.why_now)}</p>
      <details class="details"><summary>Xem chi tiết</summary>
        <dl>
          <dt>Khách hàng trả tiền</dt><dd>${safe(n.customers)}</dd>
          <dt>Mô hình doanh thu</dt><dd>${safe(n.revenue)}</dd>
          <dt>Moat</dt><dd>${safe(n.moat)}</dd>
          <dt>Rủi ro</dt><dd>${safe(n.risks)}</dd>
          <dt>Nghề liên quan</dt><dd>${n.jobs.map(safe).join(' • ')}</dd>
        </dl>
      </details>
    </article>`).join('');
}

function renderCareers(){
  $('#careerCards').innerHTML = KB.career_roles.map(r=>`
    <article class="role-card">
      <span class="horizon">${safe(r.horizon)}</span>
      <h3><span class="inline-icon">${careerIcon(r.role)}</span>${safe(r.role)}</h3>
      <p>${safe(r.mission)}</p>
      <p><strong>Kỹ năng:</strong> ${safe(r.skills)}</p>
    </article>`).join('');
}
function careerIcon(role){ const r=role.toLowerCase(); if(r.includes('vận hành')) return '📊'; if(r.includes('bảo mật') || r.includes('an ninh')) return '🛡️'; if(r.includes('quản trị') || r.includes('đạo đức')) return '⚖️'; if(r.includes('đánh giá') || r.includes('kiểm')) return '🧪'; if(r.includes('trách nhiệm')) return '⚖️'; if(r.includes('mô phỏng') || r.includes('bản sao')) return '🧬'; if(r.includes('đào tạo') || r.includes('kỹ năng')) return '🎓'; if(r.includes('dọc') || r.includes('chuyên ngành')) return '🏢'; if(r.includes('luồng công việc') || r.includes('kiến trúc')) return '🧭'; if(r.includes('người')) return '👥'; return '🧑‍💻'; }

function renderSources(q=''){
  const filter = item => !q || includesText(item,q);
  $('#uploadedSources').innerHTML = SOURCES.uploaded_documents.filter(filter).map(s=>`
    <div class="source"><strong>📄 ${safe(s.title)}</strong><span>${safe(s.used_for)}</span><p><a href="${encodeURI(s.file)}" target="_blank">Mở file gốc</a> · <a href="${encodeURI(s.raw_text)}" target="_blank">Mở text trích xuất</a></p></div>`).join('') || '<p class="muted">Không có kết quả.</p>';
  $('#externalSources').innerHTML = SOURCES.external_sources.filter(filter).map(s=>`
    <div class="source"><strong>🔗 ${safe(s.title)}</strong><span>${safe(s.org)}</span><p>${safe(s.used_for)}</p><p><a href="${safe(s.url)}" target="_blank" rel="noopener">Mở nguồn</a></p></div>`).join('') || '<p class="muted">Không có kết quả.</p>';
}

function applyGlobalSearch(){
  const q = $('#globalSearch').value.trim();
  const blocks = $$('.card, .hero');
  if(!q){ blocks.forEach(b=>b.classList.remove('hidden')); return; }
  blocks.forEach(b=>{
    if(['reading','summary','highlights','glossary','sources','upload'].includes(b.id)) return b.classList.remove('hidden');
    b.classList.toggle('hidden', !b.textContent.toLowerCase().includes(q.toLowerCase()));
  });
}

async function ingestFiles(files){
  const status = $('#uploadStatus');
  const results = $('#uploadResults');
  if(!files.length) return;
  status.textContent = `Đang xử lý ${files.length} file...`;
  for(const file of files){
    const fd = new FormData(); fd.append('file', file);
    let data;
    try{
      const res = await fetch('/api/ingest', {method:'POST', body:fd});
      if(!res.ok) throw new Error(await res.text());
      data = await res.json();
    }catch(err){
      data = await clientOnlyIngest(file, err.message || String(err));
    }
    USER_UPLOADS.unshift(data);
    results.insertAdjacentHTML('afterbegin', uploadResultHTML(data));
  }
  status.textContent = 'Đã xử lý xong. Kết quả mới đã lưu vào data/user_uploads.json nếu bạn chạy qua server.py; nếu dùng chế độ dự phòng trên trình duyệt thì chỉ hiện trong phiên này.';
}
async function clientOnlyIngest(file, backendError){
  const text = await file.text().catch(()=>`Không đọc được file ở chế độ browser-only. Backend error: ${backendError}`);
  const sections = classifyText(text);
  return {filename:file.name, title:file.name, created_at:new Date().toISOString(), detected_sections:sections, summary:summarize(text), extracted_sources:extractUrls(text), text_preview:text.slice(0,3000), mode:'dự phòng trên trình duyệt'};
}
function extractUrls(text){ return [...new Set((text.match(/https?:\/\/[^\s)"']+/g)||[]))].slice(0,30); }
function summarize(text){
  const sentences = text.replace(/\s+/g,' ').split(/(?<=[.!?。])\s+/).filter(s=>s.length>60).slice(0,80);
  const keys = ['tác nhân','AI','thị trường','Việt Nam','ngách','nghề','quản trị','rủi ro','luồng công việc','doanh nghiệp vừa và nhỏ','khởi nghiệp'];
  return sentences.sort((a,b)=>scoreSentence(b,keys)-scoreSentence(a,keys)).slice(0,4).join(' ');
}
function scoreSentence(s, keys){ return keys.reduce((n,k)=>n+(s.toLowerCase().includes(k.toLowerCase())?1:0),0) + Math.min(s.length/220,1); }
function classifyText(text){
  const map = {foundation:['tác nhân','agentic','mô hình ngôn ngữ','bộ nhớ','lập kế hoạch','công cụ','trợ lý','tự động hóa'],global:['toàn cầu','thế giới','mckinsey','wef','gartner','thị trường','tăng trưởng'],vietnam:['việt nam','vietnam','fpt','viettel','nvidia','nic','doanh nghiệp vừa và nhỏ','sme'],niches:['ngách','khởi nghiệp','mvp','bản thử nghiệm','doanh thu','khách hàng'],careers:['nghề','career','job','kiến trúc sư luồng công việc','vận hành tác nhân'],governance:['risk','rủi ro','quản trị','iso','nist','eu ai act','bảo mật','riêng tư','dữ liệu cá nhân']};
  const low = text.toLowerCase();
  return Object.entries(map).filter(([_,ks])=>ks.some(k=>low.includes(k))).map(([k])=>k);
}
function uploadResultHTML(d){
  return `<div class="upload-result">
    <strong>📄 ${safe(d.title || d.filename)}</strong>
    <p><span class="tag">${safe(d.mode || 'nhập bằng máy chủ cục bộ')}</span> <span class="tag">${safe((d.detected_sections||[]).map(sectionLabel).join(', ') || 'chưa phân loại')}</span></p>
    <p>${safe(d.summary || 'Không tạo được tóm tắt.')}</p>
    ${(d.extracted_sources||[]).length ? `<p><strong>URL phát hiện:</strong> ${(d.extracted_sources||[]).slice(0,5).map(u=>`<a href="${safe(u)}" target="_blank">${safe(u)}</a>`).join(' · ')}</p>`:''}
    <details><summary>Xem phần văn bản xem trước</summary><pre>${safe(d.text_preview || '')}</pre></details>
  </div>`;
}

function setupUpload(){
  const dz = $('#dropzone'), input = $('#fileInput');
  dz.addEventListener('click', e=>{ if(e.target!==input) input.click(); });
  input.addEventListener('change', ()=>ingestFiles([...input.files]));
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('dragover');}));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('dragover');}));
  dz.addEventListener('drop', e=> ingestFiles([...e.dataTransfer.files]));
}

async function init(){
  KB = await loadJSON('data/knowledge_base.json', null);
  SOURCES = await loadJSON('data/sources.json', {uploaded_documents:[],external_sources:[]});
  USER_UPLOADS = await loadJSON('data/user_uploads.json', []);
  if(!KB){ document.body.innerHTML='<main><h1>Không tải được data/knowledge_base.json</h1><p>Hãy chạy bằng <code>python server.py</code> từ thư mục website.</p></main>'; return; }
  renderMeta(); buildNav(); renderReadingOrder(); renderSummary(); renderHighlights(); renderGlossary(); renderSections(); populateFieldFilter(); renderNiches(); renderCareers(); renderSources(); setupUpload();
  USER_UPLOADS.slice(0,20).forEach(d=>$('#uploadResults').insertAdjacentHTML('beforeend', uploadResultHTML(d)));
  $('#fieldFilter').addEventListener('change', renderNiches); $('#sortNiches').addEventListener('change', renderNiches);
  $('#sourceSearch').addEventListener('input', e=>renderSources(e.target.value.trim()));
  $('#glossarySearch').addEventListener('input', e=>renderGlossary(e.target.value.trim()));
  $('#globalSearch').addEventListener('input', applyGlobalSearch);
  const c15 = $('#career15Search');
  if(c15){
    c15.addEventListener('input', e=>{
      const q=e.target.value.trim().toLowerCase();
      $$('#career15Cards .career15-card').forEach(c=>c.classList.toggle('hidden', q && !c.textContent.toLowerCase().includes(q)));
    });
  }
  const n40 = $('#niche40Search');
  if(n40){
    n40.addEventListener('input', e=>{
      const q=e.target.value.trim().toLowerCase();
      const sec=(KB.sections||[]).find(s=>s.id==='niche-map-40') || {niche_map40:[]};
      const filtered=(sec.niche_map40||[]).filter(x=>!q || includesText(x,q));
      $('#niche40Cards').innerHTML = renderNiche40(filtered) || '<p class="muted">Không tìm thấy ngách phù hợp.</p>';
    });
  }
}
init();
