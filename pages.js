// Посадочные страницы: свежие цены подачи и «от N ₽/сутки» из data/catalog.json (тот же файл, что у главной).
(() => {
  const rub = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-max')) navigator.clipboard?.writeText('+79291667700').catch(() => {});
  });
  fetch('/data/catalog.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((d) => {
    if (!d) return;
    const month = String(new Date().getMonth() + 1);
    document.querySelectorAll('[data-deliv]').forEach((el) => {
      const p = (d.delivery || []).find((x) => x.place === el.dataset.deliv);
      if (p && p.price > 0) el.textContent = rub(p.price);
    });
    document.querySelectorAll('[data-price]').forEach((el) => {
      const c = (d.cars || []).find((x) => x.model === el.dataset.price);
      if (!c) return;
      const m = (c.months && c.months[month]) || [];
      const list = (m.some((v) => v > 0) ? m : c.base || []).filter((v) => v > 0);
      if (list.length) el.textContent = 'от ' + rub(Math.min(...list));
    });
  }).catch(() => {});
})();
