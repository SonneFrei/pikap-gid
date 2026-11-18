/*
 * Аналитика: Яндекс Метрика + плашка об использовании cookie.
 * Чтобы включить — впишите номер счётчика в METRIKA_ID.
 * Пока METRIKA_ID = null, никакие данные никуда не отправляются.
 */
(function () {
  "use strict";

  var METRIKA_ID = 114351186;

  // --- Цели (вызываются из app.js). Без счётчика — тихо ничего не делают.
  var sentGoals = {};
  window.trackGoal = function (name, once) {
    if (!METRIKA_ID || typeof window.ym !== "function") return;
    if (once && sentGoals[name]) return;
    sentGoals[name] = true;
    window.ym(METRIKA_ID, "reachGoal", name);
  };

  // --- Подключение Метрики
  if (METRIKA_ID) {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(METRIKA_ID, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  }

  // --- Плашка про cookie (показываем, только если Метрика включена)
  if (!METRIKA_ID) return;
  var KEY = "pg_cookie_ok";
  var dismissed = false;
  try { dismissed = window.localStorage.getItem(KEY) === "1"; } catch (e) { /* хранилище недоступно — просто покажем плашку */ }
  if (dismissed) return;

  function showBanner() {
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Уведомление о cookie");
    bar.innerHTML =
      '<p>Мы используем cookie и сервис Яндекс Метрика, чтобы считать посещения и делать сайт удобнее. ' +
      'Персональные данные не продаём и не передаём третьим лицам, кроме Яндекса для статистики.</p>' +
      '<button type="button" class="btn">Понятно</button>';
    bar.querySelector("button").addEventListener("click", function () {
      try { window.localStorage.setItem(KEY, "1"); } catch (e) { /* ничего страшного */ }
      bar.remove();
    });
    document.body.appendChild(bar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner);
  else showBanner();
})();
