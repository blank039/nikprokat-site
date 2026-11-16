// НикПрокат v4 — светлый макет по примерам. Главный экран: большая сцена с машиной и стеклянная карточка выбора.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
  const shots = (car, n) => Array.from({ length: n }, (_, i) => `img/${car}-${i}.jpg`);
  const iso = (d) => d.toISOString().slice(0, 10);

  // busy: true — заглушка: на сайте всегда «занята на эти даты»
  const CARS = [
    { id: 'camry19', name: 'Toyota Camry', sub: '2019 · седан', price: 3490, hero: 'img/hero-camry19.jpg', pos: '50% 60%',
      gallery: shots('camry19', 7), cover: 2, specs: ['Автомат', '5 мест', 'Большой багажник'] },
    { id: 'bmw', name: 'BMW 1 Series', sub: '2021 · хэтчбек', price: 3190, hero: 'img/hero-bmw.jpg', pos: '45% 60%',
      gallery: shots('bmw', 6), cover: 2, specs: ['Автомат', '5 мест', 'Дизель'] },
    { id: 'camry21', name: 'Toyota Camry', sub: '2021 · седан', price: 3900, hero: 'img/hero-camry21.jpg', pos: '50% 66%',
      gallery: shots('camry21', 7), cover: 4, specs: ['Автомат', '5 мест', 'Камера'], busy: true },
    { id: 'genesis', name: 'Hyundai Genesis', sub: '2015 · бизнес-седан', price: 4750, hero: 'img/hero-genesis.jpg', pos: '50% 68%',
      gallery: shots('genesis', 6), cover: 1, specs: ['Автомат', 'Кожа', 'Полный привод'], busy: true },
  ];
  const PLACES = [['По адресу в Калининграде', '790 ₽'], ['Аэропорт Храброво', '1 390 ₽'], ['Зеленоградск', '1 390 ₽'],
    ['Светлогорск', '1 990 ₽'], ['Янтарный', '2 390 ₽']];

  // ---------- Max: кнопка открывает чат по ID профиля (web.max.ru/557016128); номер на всякий случай кладём в буфер ----------
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-max')) navigator.clipboard?.writeText('+79291667700').catch(() => {});
  });

  // ---------- контакты: пустые поля не показываются ----------
  // yandexOrg — номер организации на Яндекс Картах (из ссылки yandex.ru/maps/org/.../<номер>), gis — ссылка на карточку 2ГИС
  const CONTACT = { email: 'nikprokat39@gmail.com', address: 'ул. Маршала Борзова, 65А', yandexOrg: '40178557680', gis: 'https://2gis.ru/kaliningrad/firm/70000001118461653/tab/reviews' };
  {
    const box = (k) => $(`[data-c="${k}"]`);
    if (CONTACT.email) { const a = box('email').querySelector('a'); a.href = 'mailto:' + CONTACT.email; a.textContent = CONTACT.email; box('email').hidden = false; }
    if (CONTACT.address) { box('address').querySelector('dd').textContent = CONTACT.address; box('address').hidden = false; }
    const q = CONTACT.yandexOrg ? `oid=${CONTACT.yandexOrg}&ol=biz` : CONTACT.address ? 'text=' + encodeURIComponent('Калининград, ' + CONTACT.address) : '';
    if (q) { box('map').innerHTML = `<iframe src="https://yandex.ru/map-widget/v1/?${q}&z=16" loading="lazy" title="НикПрокат на карте" allowfullscreen></iframe>`; box('map').hidden = false; }
    const r = [];
    if (CONTACT.yandexOrg) r.push(`<div class="reviews__ya"><iframe src="https://yandex.ru/maps-reviews-widget/${CONTACT.yandexOrg}?comments" loading="lazy" title="Отзывы на Яндекс Картах"></iframe></div>`);
    const side = [];
    if (CONTACT.yandexOrg) side.push(`<a class="btn" href="https://yandex.ru/maps/org/${CONTACT.yandexOrg}/reviews/" target="_blank" rel="noopener">Отзыв на Яндекс Картах</a>`);
    if (CONTACT.gis) side.push(`<a class="btn btn--dark" href="${CONTACT.gis}" target="_blank" rel="noopener">Отзывы в 2ГИС</a>`);
    if (side.length) r.push(`<div class="reviews__side"><p>Брали у нас машину? Расскажите, как всё прошло, — нам важно ваше мнение.</p>${side.join('')}</div>`);
    if (r.length) { box('reviews').innerHTML = '<h3>Отзывы</h3><div class="reviews__grid">' + r.join('') + '</div>'; box('reviews').hidden = false; }
  }

  // ---------- cookie: плашка, пока посетитель не нажал «Понятно» ----------
  {
    const bar = $('#cookie');
    let seen = false; try { seen = localStorage.getItem('nikCookie') === '1'; } catch (e) {}
    if (bar && !seen) bar.hidden = false;
    $('#cookieOk')?.addEventListener('click', () => { bar.hidden = true; try { localStorage.setItem('nikCookie', '1'); } catch (e) {} });
  }

  // ---------- главный экран ----------
  // Ролики video/<имя>.mp4 (+ первый кадр .jpg) идут по кругу. Следующий начинается за FADE секунд до конца
  // текущего и наплывает поверх, так что стоп-кадра между роликами нет.
  const CLIPS = ['camry19', 'bmw', 'camry19-gorod', 'camry21', 'genesis'];
  const FADE = 1.1;
  const media = $('#heroMedia');
  const vids = CLIPS.map((n) => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.poster = `video/${n}.jpg`; v.src = `video/${n}.mp4`; v.className = 'hero__img';
    v.addEventListener('error', () => { v.dataset.bad = '1'; if (v === vids[cur]) next(); });
    media.appendChild(v); return v;
  });
  let cur = -1, guard = 0;
  function next() {
    for (let k = 1; k <= vids.length; k++) {
      const j = (cur + k) % vids.length;
      if (!vids[j].dataset.bad) return show(j);
    }
  }
  function show(i) {
    const prev = vids[cur], v = vids[i];
    v.currentTime = 0; v.play().catch(() => {});
    v.classList.add('on');
    if (prev && prev !== v) {
      prev.classList.remove('on');
      setTimeout(() => { if (!prev.classList.contains('on')) prev.pause(); }, FADE * 1000 + 400);
    }
    cur = i;
    // запасной таймер: если браузер не дал запустить видео (режим экономии), всё равно листаем кадры
    clearTimeout(guard);
    guard = setTimeout(next, ((v.duration || 12) + 1.5) * 1000);
  }
  vids.forEach((v, i) => {
    v.addEventListener('timeupdate', () => {
      if (i === cur && v.duration && v.currentTime >= v.duration - FADE - 0.1) next();
    });
    v.addEventListener('ended', () => { if (i === cur) next(); });
  });
  if (vids.length > 1) show(0); else if (vids[0]) { vids[0].loop = true; vids[0].classList.add('on'); vids[0].play().catch(() => {}); }

  // ---------- прокрутка меняет интерфейс: главный экран, меню, история «как забронировать» ----------
  {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = $('#hero'), nav = $('#nav'), story = $('.story');
    const steps = story ? [...story.querySelectorAll('.story__step')] : [], imgs = story ? [...story.querySelectorAll('.story__img')] : [],
      cards = [];
    const clamp = (v) => Math.min(1, Math.max(0, v));
    let ticking = false, last = -1;
    function frame() {
      ticking = false;
      const y = scrollY;
      nav?.classList.toggle('small', y > 40);
      if (calm) return;
      if (hero && y < hero.offsetHeight * 1.2) hero.style.setProperty('--p', clamp(y / hero.offsetHeight).toFixed(3));
      if (story) {
        const r = story.getBoundingClientRect();
        const sp = clamp(-r.top / (r.height - innerHeight));
        story.style.setProperty('--sp', sp.toFixed(3));
        const i = Math.min(steps.length - 1, Math.floor(sp * steps.length * 0.999));
        if (i !== last) {
          last = i;
          [steps, imgs, cards].forEach((list) => list.forEach((el, j) => el.classList.toggle('on', j === i)));
        }
      }
    }
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame);
    frame();
  }

  // ---------- автопарк и тарифы ----------
  // Каталог моделей. Свободные на даты — только те, что свободны по CRM (сейчас макет: FREE).
  // Цены моделей, которых ещё нет в парке, — черновик для владельца.
  const TIERS = ['1 сутки', '2–6 суток', '7–14 суток', 'от 15 суток'];
  const LADDER = [1, 0.96, 0.936, 0.862];   // как у Camry 2019 на Авито: 4050 / 3890 / 3790 / 3490
  const ladder = (base) => (Array.isArray(base) ? base : LADDER.map((k) => Math.round(base * k / 10) * 10));
  const tierOf = (days) => (days <= 1 ? 0 : days <= 6 ? 1 : days <= 14 ? 2 : 3);
  const CLASSES = [['econom', 'Эконом'], ['comfort', 'Комфорт'], ['business', 'Бизнес'], ['suv', 'Кроссоверы']];
  const MODELS = [
    ['solaris', 'econom', 'Hyundai Solaris', 'седан · автомат', 2900],
    ['rio', 'econom', 'Kia Rio', 'седан · автомат', 3000],
    ['polo', 'econom', 'Volkswagen Polo', 'лифтбек · автомат', 3000],
    ['rapid', 'econom', 'Skoda Rapid', 'лифтбек · автомат', 3100],
    ['elantra', 'comfort', 'Hyundai Elantra', 'седан · автомат', 3600],
    ['corolla', 'comfort', 'Toyota Corolla', 'седан · автомат', 3700],
    ['octavia', 'comfort', 'Skoda Octavia', 'лифтбек · автомат', 3700],
    ['bmw', 'comfort', 'BMW 1 Series', '116d 2021 · хэтчбек · автомат · дизель 1.5 л', [3990, 3790, 3590, 3190]],
    ['camry19', 'business', 'Toyota Camry 70', '2019 · 2.5 л, 181 л.с. · автомат · Luxe Safety', [4050, 3890, 3790, 3490]],
    ['k5', 'business', 'Kia K5', 'седан · автомат', 4300],
    ['camry21', 'business', 'Toyota Camry 70', '2021 · седан · автомат', 4500],
    ['genesis', 'business', 'Hyundai Genesis', '2015 · седан · автомат · полный привод', 5500],
    ['creta', 'suv', 'Hyundai Creta', 'кроссовер · автомат', 3900],
    ['sportage', 'suv', 'Kia Sportage', 'кроссовер · автомат', 4900],
    ['rav4', 'suv', 'Toyota RAV4', 'кроссовер · автомат · полный привод', 5400],
  ].map(([id, cls, name, sub, base]) => ({ id, cls, name, sub, prices: ladder(base), img: `img/cat/${id}.jpg?v=2` }));
  // Данные из CRM Джарвиса. Сайт статический: ноутбук раз в несколько минут выкладывает data/catalog.json —
  // машины с галочкой «Синхронизация с сайтом», их цены (основная строка и по месяцам) и занятые даты (без клиентов).
  // Свободна ли машина и сколько стоит аренда, сайт считает сам, по тем же правилам, что и CRM.
  const BASE = new Map(MODELS.map((m) => [m.id, m.prices]));
  let SYNCED = new Set();    // модели, за которыми стоит настоящая машина из CRM
  let FREE = new Set();      // свободные на выбранные даты
  let TOTAL = {};            // сумма на выбранные даты (с сезоном)
  const stamp = (d, t) => `${d}T${t || '10:00'}`;
  let DATA = null;
  async function load() {
    if (DATA) return DATA;
    try {
      const r = await fetch('data/catalog.json?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' });
      if (r.ok) DATA = await r.json();
    } catch { /* нет файла — покажем каталог без CRM */ }
    return DATA;
  }
  const num = (v) => (Number.isFinite(+v) && +v > 0 ? +v : 0);
  async function crm(start, end) {   // тот же ответ, что давал /v1/site/catalog
    const x = await load();
    if (!x) return null;
    const s = start ? new Date(start) : null, e = end ? new Date(end) : null;
    if (s && !(e > s)) return null;
    const month = String((s || new Date()).getMonth() + 1);
    const cars = (x.cars || []).map((c) => {
      const mrow = c.months?.[month] || [], base = c.base || [];
      const row = (x.site_tiers || [0, 1, 2, 3]).map((i) => num(mrow[i]) || num(base[i]) || num(base[0]));
      const car = { model: c.model, title: c.title, sub: c.sub, prices: row };
      if (s) {
        const a = start.slice(0, 16), b = end.slice(0, 16);
        car.free = !(c.busy || []).some(([bs, be]) => bs < b && a < be);
        const days = Math.max(1, Math.ceil((e - s) / 864e5 - 1 / 24));
        const tier = (x.tiers || []).findIndex(([lo, hi]) => hi === null || days <= hi);
        const per = num(mrow[tier]) || num(base[tier]);
        car.days = days; car.total = per ? per * days : null;
      }
      return car;
    });
    return { cars, delivery: x.delivery || [] };
  }
  function apply(x) {   // цены/названия машин из CRM поверх карточек каталога
    MODELS.forEach((m) => { m.prices = BASE.get(m.id); });
    SYNCED = new Set(); FREE = new Set(); TOTAL = {};
    for (const c of x?.cars || []) {
      const m = MODELS.find((k) => k.id === c.model);
      if (!m) continue;
      SYNCED.add(m.id); m.prices = c.prices;
      if (c.title) m.name = c.title;
      if (c.sub) m.sub = c.sub;
      if (c.free) { FREE.add(m.id); TOTAL[m.id] = c.total; }
    }
  }
  const fleet = $('#fleetList'), note = $('#whenNote');
  const fFrom = $('#fFrom'), fTo = $('#fTo'), fFromT = $('#fFromT'), fToT = $('#fToT');
  let range = null;   // { from, to, days }
  const rentDays = (a, at, b, bt) => {
    const ms = new Date(`${b}T${bt || '10:00'}`) - new Date(`${a}T${at || '10:00'}`);
    return ms > 0 ? Math.max(1, Math.ceil(ms / 864e5 - 1 / 24)) : 0;   // час запаса не считается новыми сутками
  };
  function renderFleet() {
    const list = range ? MODELS.filter((m) => FREE.has(m.id)) : MODELS;
    const t = range ? tierOf(range.days) : -1;
    fleet.innerHTML = CLASSES.map(([cls, title]) => {
      const rows = list.filter((m) => m.cls === cls);
      if (!rows.length) return '';
      return `<div class="tariffs__class">${title}</div>` + rows.map((m) => `
        <article class="trow reveal in" data-book="${m.id}">
          <div class="trow__pic"><img src="${m.img}" alt="${m.name}" loading="lazy"></div>
          <div class="trow__name"><b>${m.name}</b><span>${m.sub}</span></div>
          <div class="trow__tiers">${m.prices.map((p, i) => `<div class="${i === t ? 'on' : ''}"><small>${TIERS[i]}</small><b>${p.toLocaleString('ru-RU')}</b></div>`).join('')}</div>
          <div class="trow__go">${range ? `<div class="trow__sum">${rub(TOTAL[m.id] || m.prices[t] * range.days)}<small>за ${range.days} сут</small></div>` : ''}<span class="btn btn--sm">Забронировать</span></div>
        </article>`).join('');
    }).join('');
    note.innerHTML = range && range.failed
      ? 'Не получилось проверить свободные машины. Напишите нам в Telegram или Max, или позвоните: +7 (929) 166‑77‑00.'
      : range && !list.length
      ? `На эти даты свободных машин нет. Попробуйте другие даты или напишите нам. <a href="#fleet" id="whenReset">Показать все модели</a>`
      : range
      ? `На ${range.days} сут свободно ${list.length} ${list.length === 1 ? 'машина' : list.length < 5 ? 'машины' : 'машин'}. <a href="#fleet" id="whenReset">Показать все модели</a>`
      : 'Выберите даты аренды — покажем машины, свободные на ваши даты, и посчитаем стоимость.';
    $('#whenReset')?.addEventListener('click', (e) => { e.preventDefault(); range = null; renderFleet(); });
  }
  {
    const d = new Date(); d.setDate(d.getDate() + 1); fFrom.min = fTo.min = iso(new Date());
    fFrom.value = iso(d); d.setDate(d.getDate() + 3); fTo.value = iso(d);
  }
  $('#when').addEventListener('submit', async (e) => {
    e.preventDefault();
    const days = rentDays(fFrom.value, fFromT.value, fTo.value, fToT.value);
    if (!days) { note.textContent = 'Конец аренды должен быть позже начала.'; return; }
    note.textContent = 'Проверяем свободные машины…';
    const x = await crm(stamp(fFrom.value, fFromT.value), stamp(fTo.value, fToT.value));
    apply(x);
    range = { from: fFrom.value, to: fTo.value, fromT: fFromT.value, toT: fToT.value, days, failed: !x };
    renderFleet();
  });
  renderFleet();
  const places = (rows) => { $('#places').innerHTML = rows.map(([a, b]) => `<li><b>${a}</b><span class="muted">${b}</span></li>`).join(''); };
  places(PLACES);
  // места получения/возврата для окна брони: офис бесплатно + подача из CRM (цена за одну сторону)
  let DELIV = PLACES.map(([a, b]) => [a, +b.replace(/\D/g, '')]);
  crm().then((x) => {
    if (!x) return;
    apply(x);
    if (!range) renderFleet();
    CARS.forEach((c) => { const m = MODELS.find((k) => k.id === c.id); if (SYNCED.has(c.id)) c.price = Math.min(...m.prices); });
    if (x.delivery?.length) { DELIV = x.delivery.map((r) => [r.place, Math.round(+r.price) || 0]); places(DELIV.map(([a, b]) => [a, rub(b)])); }
  });

  // плавное появление блоков при прокрутке
  document.querySelectorAll('.fact, .step, .term, .places, .delivery > div, .head, .cta').forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

  // ---------- бронь: свободна ли машина на даты — спрашиваем CRM ----------
  const dlg = $('#book'), from = $('#dFrom'), to = $('#dTo'), status = $('#bookStatus'), lead = $('#bookLead');
  let picked = null;
  function photo(i) {
    $('#bookImg').src = picked.gallery[i];
    [...$('#bookThumbs').children].forEach((t, j) => t.classList.toggle('on', j === i));
  }
  let asked = 0, Q = null, WHERE = [];
  const pick = $('#dPick'), drop = $('#dDrop'), go = $('#bookGo');
  const OFFICE = 'Офис проката (ул. Маршала Борзова, 65А)';
  const dm = (v) => v.split('-').reverse().slice(0, 2).join('.');
  function wherePlaces() {
    const opts = [[OFFICE, 0], ...DELIV];
    const html = opts.map(([a, b], i) => `<option value="${i}">${a} — ${b ? rub(b) : 'бесплатно'}</option>`).join('');
    const pv = pick.value, dv = drop.value;
    pick.innerHTML = html; drop.innerHTML = html;
    pick.value = pv || '0'; drop.value = dv || '0';
    if (pick.selectedIndex < 0) pick.value = '0';
    if (drop.selectedIndex < 0) drop.value = '0';
    return opts;
  }
  function calc() {
    if (!Q) return;
    const [pa, pb] = WHERE[+pick.value] || [OFFICE, 0], [da, db] = WHERE[+drop.value] || [OFFICE, 0];
    const total = Q.rent + pb + db;
    $('#bookCalc').innerHTML = `
      <div><span>Аренда, ${Q.days} сут</span><b>${rub(Q.rent)}</b></div>
      <div><span>Получение: ${pa}</span><b>${pb ? rub(pb) : 'бесплатно'}</b></div>
      <div><span>Возврат: ${da}</span><b>${db ? rub(db) : 'бесплатно'}</b></div>
      <div class="book__total"><span>Итого</span><b>${rub(total)}</b></div>
      <small>Залог возвращается при сдаче автомобиля и в итог не входит.</small>`;
    Q.text = `Здравствуйте! Хочу забронировать ${picked.name} с ${dm(from.value)} ${Q.tA} по ${dm(to.value)} ${Q.tB} (${Q.days} сут).\n`
      + `Получение: ${pa}. Возврат: ${da}.\n`
      + `Аренда ${rub(Q.rent)}${pb ? ` + подача ${rub(pb)}` : ''}${db ? ` + возврат ${rub(db)}` : ''} = ${rub(total)}.`;
  }
  pick.addEventListener('change', calc); drop.addEventListener('change', calc);
  async function check() {
    const days = rentDays(from.value, '10:00', to.value, '10:00');
    Q = null; go.hidden = true;
    if (!from.value || !to.value || days < 1) { status.className = 'book__status'; status.textContent = 'Выберите даты — покажем, свободна ли машина.'; lead.hidden = true; return; }
    const n = ++asked, tA = range?.from === from.value ? range.fromT : '10:00', tB = range?.to === to.value ? range.toT : '10:00';
    status.className = 'book__status'; status.textContent = 'Проверяем даты…'; lead.hidden = true;
    const x = await crm(stamp(from.value, tA), stamp(to.value, tB));
    if (n !== asked) return;
    if (!x) { status.className = 'book__status busy'; status.innerHTML = '<b>Не получилось проверить даты</b>Напишите нам в Telegram или Max, или позвоните: +7 (929) 166‑77‑00.'; return; }
    const c = (x.cars || []).find((k) => k.model === picked.id);
    const freeAlt = (x.cars || []).filter((k) => k.free && k.model !== picked.id).map((k) => MODELS.find((m) => m.id === k.model)?.name).filter(Boolean);
    if (!c || !c.free) {
      status.className = 'book__status busy';
      status.innerHTML = `<b>На эти даты машина занята</b>${freeAlt.length ? `Свободны: ${[...new Set(freeAlt)].join(' или ')}. <a href="#fleet" id="seeFree">Показать свободные</a>` : 'Попробуйте другие даты или напишите нам.'}`;
      if (!freeAlt.length) { lead.hidden = true; return; }
      $('#seeFree').addEventListener('click', () => { dlg.close(); fFrom.value = from.value; fTo.value = to.value; $('#when').requestSubmit(); });
      lead.hidden = true; return;
    }
    const price = c.prices[tierOf(c.days)];
    status.className = 'book__status ok';
    Q = { days: c.days, price, rent: c.total || c.days * price, tA, tB };
    status.innerHTML = `<b>Свободна ✓</b>${c.days} сут × ${rub(price)} = <span class="sum">${rub(Q.rent)}</span>`;
    calc(); lead.hidden = false;
  }
  function openBook(id) {
    picked = MODELS.find((m) => m.id === id);
    const real = CARS.find((c) => c.id === id);
    picked.gallery = real ? real.gallery : [picked.img];
    $('#bookName').textContent = picked.name;
    $('#bookSub').textContent = `${picked.sub} · от ${rub(picked.prices[3])} в сутки`;
    $('#bookThumbs').innerHTML = picked.gallery.length > 1 ? picked.gallery.map((g) => `<img src="${g}" alt="">`).join('') : '';
    [...$('#bookThumbs').children].forEach((t, j) => t.addEventListener('click', () => photo(j)));
    $('#bookImg').style.objectPosition = real ? real.pos : '50% 50%';
    photo(real ? real.cover : 0);
    from.value = range ? range.from : fFrom.value; to.value = range ? range.to : fTo.value;
    from.min = to.min = iso(new Date());
    WHERE = wherePlaces();
    check(); dlg.showModal();
  }
  document.addEventListener('click', (e) => { const id = e.target.closest('[data-book]')?.dataset.book; if (id) openBook(id); });
  $('#bookClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  from.addEventListener('change', check); to.addEventListener('change', check);
  // Бронь — через мессенджер или звонок: сайт не собирает имён и телефонов.
  // Перед переходом — предупреждение о предоплате; текст заявки готов заранее (Telegram подставит его сам, для Max копируем).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.js-send');
    if (!a || !picked || !Q?.text) return;
    e.preventDefault();
    const tg = a.dataset.app === 'Telegram';
    $('#goOn').href = tg ? `https://t.me/nikprokat?text=${encodeURIComponent(Q.text)}` : a.href;
    $('#goOn').textContent = `Продолжить в ${a.dataset.app}`;
    $('#goNote').textContent = tg ? 'Текст заявки с машиной, датами и расчётом подставится в чат — останется отправить.'
      : 'Текст заявки с машиной, датами и расчётом скопируется — вставьте его в чат и отправьте.';
    lead.hidden = true; go.hidden = false;
  });
  $('#goOn').addEventListener('click', () => { navigator.clipboard?.writeText(Q?.text || '').catch(() => {}); setTimeout(() => { go.hidden = true; lead.hidden = false; }, 400); });
  $('#goBack').addEventListener('click', () => { go.hidden = true; lead.hidden = false; });
})();
