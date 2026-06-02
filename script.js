const isFileProtocol = window.location.protocol === 'file:';

function getCurrentRouteFromUrl() {
  if (isFileProtocol) {
    const hash = window.location.hash.slice(1);
    if (hash === '' || hash === '/') return '/';
    if (hash === 'chapter/1') return '/chapter/1';
    if (hash === 'chapter/2') return '/chapter/2';
    if (hash === 'final') return '/final';
    return '/';
  } else {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return '/';
    if (path === '/chapter/1') return '/chapter/1';
    if (path === '/chapter/2') return '/chapter/2';
    if (path === '/final') return '/final';
    return '/';
  }
}

function setRouteToUrl(route, addToHistory = true) {
  if (isFileProtocol) {
    let hash = '';
    if (route === '/') hash = '';
    else if (route === '/chapter/1') hash = '#chapter/1';
    else if (route === '/chapter/2') hash = '#chapter/2';
    else if (route === '/final') hash = '#final';
    if (addToHistory) {
      window.location.hash = hash;
    } else {
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
    
    // ФОТО РАБОТАЮТ - ПРОВЕРЕНО
    const photos = idx === 1 ? `
      <div class="photo-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px; margin:40px 0;">
        <img src="photos/photo1.jpg" alt="Фото" style="width:280px; height:280px; object-fit:cover; border-radius:25px; box-shadow:0 8px 25px rgba(0,0,0,0.3); border:2px solid #ffcf8a;">
        <img src="photos/photo2.jpg" alt="Фото" style="width:280px; height:280px; object-fit:cover; border-radius:25px; box-shadow:0 8px 25px rgba(0,0,0,0.3); border:2px solid #ffcf8a;">
        <img src="photos/photo3.jpg" alt="Фото" style="width:280px; height:280px; object-fit:cover; border-radius:25px; box-shadow:0 8px 25px rgba(0,0,0,0.3); border:2px solid #ffcf8a;">
      </div>
    ` : '';

    html = `
      <section class="chapter fade-up show active">
        <h2>${title}</h2>
        ${photos}
        <p style="white-space:pre-wrap; font-size:24px; line-height:1.6;">${text}</p>
      </section>
    `;
  } else if (routeData.type === 'final') {
    html = `
      <section class="final-screen fade-up show active">
        <div class="final-box">
          <h2>${SITE_TEXT.finalTitle}</h2>
          <p style="white-space:pre-wrap;">${SITE_TEXT.finalText}</p>
          <div class="heart">♥</div>
        </div>
      </section>
    `;
  }

  mainContent.innerHTML = html;

  const activeIndex = routeData.index === 1 ? 0 : (routeData.index === 2 ? 1 : 2);
  dots.forEach((dot, i) => {
    if (i === activeIndex) dot.classList.add('active');
    else dot.classList.remove('active');
  });

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

prevBtn.addEventListener('click', () => {
  const newRoute = getPrevRoute(currentRoute);
  if (newRoute !== currentRoute) navigateTo(newRoute);
});

nextBtn.addEventListener('click', () => {
  const newRoute = getNextRoute(currentRoute);
  if (newRoute !== currentRoute) navigateTo(newRoute);
});

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

document.getElementById('heroTitle').innerText = SITE_TEXT.heroTitle;
document.getElementById('heroText').innerText = SITE_TEXT.heroText;

const startRoute = getCurrentRouteFromUrl();
if (routes[startRoute]) {
  renderRoute(startRoute);
  if (isFileProtocol && startRoute !== '/') {
    const hashForRoute = startRoute === '/chapter/1' ? '#chapter/1' : (startRoute === '/chapter/2' ? '#chapter/2' : '#final');
    if (window.location.hash !== hashForRoute) {
      history.replaceState(null, '', window.location.href.split('#')[0] + hashForRoute);
    }
  } else if (isFileProtocol && startRoute === '/' && window.location.hash) {
    history.replaceState(null, '', window.location.href.split('#')[0]);
  }
} else {
  navigateTo('/', false);
}
