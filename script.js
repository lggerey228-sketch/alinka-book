// ---------- ОПРЕДЕЛЯЕМ, КАК РАБОТАТЬ С URL ----------
const isFileProtocol = window.location.protocol === 'file:';

// Функция получения текущего маршрута
function getCurrentRouteFromUrl() {
  if (isFileProtocol) {
    // Для file:// используем hash, например #chapter/1
    const hash = window.location.hash.slice(1); // убираем #
    if (hash === '' || hash === '/') return '/';
    if (hash === 'chapter/1') return '/chapter/1';
    if (hash === 'chapter/2') return '/chapter/2';
    if (hash === 'final') return '/final';
    return '/';
  } else {
    // Для http:// или https:// используем pathname
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return '/';
    if (path === '/chapter/1') return '/chapter/1';
    if (path === '/chapter/2') return '/chapter/2';
    if (path === '/final') return '/final';
    return '/';
  }
}

// Функция изменения URL без перезагрузки
function setRouteToUrl(route, addToHistory = true) {
  if (isFileProtocol) {
    let hash = '';
    if (route === '/') hash = '';
    else if (route === '/chapter/1') hash = '#chapter/1';
    else if (route === '/chapter/2') hash = '#chapter/2';
    else if (route === '/final') hash = '#final';
    
    if (addToHistory) {
      // Меняем hash – это само добавляет запись в историю
      window.location.hash = hash;
    } else {
      // Заменяем текущую запись (не создавая новую)
      const newUrl = window.location.href.split('#')[0] + hash;
      history.replaceState(null, '', newUrl);
    }
  } else {
    if (addToHistory) {
      history.pushState({ route }, '', route);
    } else {
      history.replaceState({ route }, '', route);
    }
  }
}

// ---------- ОСТАЛЬНОЙ КОД (роуты, рендер, кнопки) ----------
const routes = {
  '/': { type: 'hero', index: null },
  '/chapter/1': { type: 'chapter', index: 1 },
  '/chapter/2': { type: 'chapter', index: 2 },
  '/final': { type: 'final', index: 3 }
};

let currentRoute = '/';

const heroSection = document.getElementById('heroSection');
const mainContent = document.getElementById('content');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const dots = document.querySelectorAll('.chapter-dot');

function renderRoute(route) {
  const routeData = routes[route];
  if (!routeData) return;

  currentRoute = route;

  if (routeData.type === 'hero') {
    heroSection.style.display = 'flex';
    mainContent.style.display = 'none';
    dots.forEach(dot => dot.classList.remove('active'));
    return;
  }

  heroSection.style.display = 'none';
  mainContent.style.display = 'block';

  let html = '';
  if (routeData.type === 'chapter') {
    const idx = routeData.index;
    const title = idx === 1 ? SITE_TEXT.chapter1Title : SITE_TEXT.chapter2Title;
    const text = idx === 1 ? SITE_TEXT.chapter1Text : SITE_TEXT.chapter2Text;
    // ... весь код остаётся таким же, как у вас, но меняется только часть с photos:

const photos = idx === 1 ? `
  <div class="photo-grid">
    <img src="photos/photo1.jpg" alt="Алинка" loading="lazy" onerror="this.style.opacity='0.3'">
    <img src="photos/photo2.jpg" alt="Алинка" loading="lazy" onerror="this.style.opacity='0.3'">
    <img src="photos/photo3.jpg" alt="Алинка" loading="lazy" onerror="this.style.opacity='0.3'">
  </div>
` : '';
    html = `
      <section class="chapter fade-up show active">
        <h2>${title}</h2>
        ${photos}
        <p>${text.replace(/\n/g, '<br>')}</p>
      </section>
    `;
  } else if (routeData.type === 'final') {
    html = `
      <section class="final-screen fade-up show active">
        <div class="final-box">
          <h2>${SITE_TEXT.finalTitle}</h2>
          <p>${SITE_TEXT.finalText.replace(/\n/g, '<br>')}</p>
          <div class="heart">♥</div>
        </div>
      </section>
    `;
  }

  mainContent.innerHTML = html;

  // Активный индикатор
  const activeIndex = routeData.index === 1 ? 0 : (routeData.index === 2 ? 1 : 2);
  dots.forEach((dot, i) => {
    if (i === activeIndex) dot.classList.add('active');
    else dot.classList.remove('active');
  });

  // Кнопка "Вперёд" на финале
  if (route === '/final') {
    nextBtn.style.opacity = '0.5';
    nextBtn.style.pointerEvents = 'none';
  } else {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
  }
}

function navigateTo(route, addToHistory = true) {
  if (route === currentRoute) return;
  setRouteToUrl(route, addToHistory);
  renderRoute(route);
}

function getNextRoute(current) {
  switch (current) {
    case '/': return '/chapter/1';
    case '/chapter/1': return '/chapter/2';
    case '/chapter/2': return '/final';
    default: return current;
  }
}

function getPrevRoute(current) {
  switch (current) {
    case '/chapter/1': return '/';
    case '/chapter/2': return '/chapter/1';
    case '/final': return '/chapter/2';
    default: return current;
  }
}

// Обработка кнопок браузера
if (!isFileProtocol) {
  window.addEventListener('popstate', (event) => {
    const route = event.state?.route || getCurrentRouteFromUrl();
    renderRoute(route);
  });
} else {
  window.addEventListener('hashchange', () => {
    const route = getCurrentRouteFromUrl();
    renderRoute(route);
  });
}

// Кнопки "Назад" / "Вперёд" внутри сайта
prevBtn.addEventListener('click', () => {
  const newRoute = getPrevRoute(currentRoute);
  if (newRoute !== currentRoute) navigateTo(newRoute);
});

nextBtn.addEventListener('click', () => {
  const newRoute = getNextRoute(currentRoute);
  if (newRoute !== currentRoute) navigateTo(newRoute);
});

// Открытие книги
const openBookBtn = document.querySelector('#openBook .book');
if (openBookBtn) {
  openBookBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBookBtn.classList.add('open');
    setTimeout(() => {
      navigateTo('/chapter/1');
      openBookBtn.classList.remove('open');
    }, 1500);
  });
}

// Инициализация
document.getElementById('heroTitle').innerText = SITE_TEXT.heroTitle;
document.getElementById('heroText').innerText = SITE_TEXT.heroText;

const startRoute = getCurrentRouteFromUrl();
if (routes[startRoute]) {
  renderRoute(startRoute);
  // Если это file://, то убеждаемся, что hash соответствует
  if (isFileProtocol && startRoute !== '/') {
    const hashForRoute = startRoute === '/chapter/1' ? '#chapter/1' : (startRoute === '/chapter/2' ? '#chapter/2' : '#final');
    if (window.location.hash !== hashForRoute) {
      history.replaceState(null, '', window.location.href.split('#')[0] + hashForRoute);
    }
  } else if (isFileProtocol && startRoute === '/' && window.location.hash) {
    // Если hash есть, но роут '/', чистим hash
    history.replaceState(null, '', window.location.href.split('#')[0]);
  }
} else {
  navigateTo('/', false);
}