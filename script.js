// Dynamise la navbar avec un menu burger pour mobile
const burger = document.getElementById('navbar-burger');
const links = document.getElementById('navbar-links');

burger.addEventListener('click', () => {
    links.classList.toggle('active');
    burger.classList.toggle('active');
});

// Carrousel plein écran automatique pour vidéos
const carouselFull = document.getElementById('carousel-full');
const fullMedia = carouselFull ? carouselFull.getElementsByClassName('carousel-full-media') : [];
let currentMedia = 0;
function showFullMedia(idx) {
    for (let i = 0; i < fullMedia.length; i++) {
        fullMedia[i].classList.remove('active');
        if (fullMedia[i].tagName === 'VIDEO') {
            fullMedia[i].pause();
            fullMedia[i].currentTime = 0;
        }
    }
    if (fullMedia[idx]) {
        fullMedia[idx].classList.add('active');
        if (fullMedia[idx].tagName === 'VIDEO') {
            fullMedia[idx].play();
        }
    }
}
let mediaInterval;
function startMediaInterval() {
    if (mediaInterval) clearInterval(mediaInterval);
    mediaInterval = setInterval(() => {
        currentMedia = (currentMedia + 1) % fullMedia.length;
        showFullMedia(currentMedia);
    }, 20000);
}
if (fullMedia.length > 0) {
    showFullMedia(currentMedia);
    startMediaInterval();
    for (let i = 0; i < fullMedia.length; i++) {
        fullMedia[i].addEventListener('click', () => {
            currentMedia = (currentMedia + 1) % fullMedia.length;
            showFullMedia(currentMedia);
            startMediaInterval();
        });
    }
}

// Scroll vers le bas avec la flèche
const scrollDown = document.getElementById('scroll-down');
if (scrollDown) {
    scrollDown.addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
}

// Gestion des news stories
function renderNewsStories() {
    const stories = getNewsStories();
    newsStoriesCarousel.innerHTML = '';
    if (!stories.length) {
        newsStoriesCarousel.innerHTML = '<div class="news-stories-empty">Aucune publication pour le moment.</div>';
        return;
    }
    stories.slice().reverse().forEach((story, idx) => {
        const div = document.createElement('div');
        div.className = 'news-story-item';
        let mediaHtml = '';
        if (story.type === 'image') {
            mediaHtml = `<img src="${story.url}" class="news-story-media" alt="Publication" />`;
        } else if (story.type === 'video') {
            mediaHtml = `<video src="${story.url}" class="news-story-media" controls preload="metadata"></video>`;
        }
        // Ajout du bouton options (3 points)
        div.innerHTML = `
            <div class="news-story-media-wrapper">
                ${mediaHtml}
                <button class="news-story-options-btn" title="Options">&#8942;</button>
                <div class="news-story-options-menu" style="display:none;position:absolute;top:30px;right:10px;background:#222;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.18);z-index:10;">
                    <button class="news-story-delete-btn" style="background:none;color:#fff;border:none;padding:0.7em 1.5em;width:100%;text-align:left;cursor:pointer;">🗑️ Supprimer</button>
                </div>
            </div>
            <div class="news-story-caption">${story.caption || ''}</div>
        `;
        // Plein écran au clic
        div.querySelector('.news-story-media').addEventListener('click', function(e) {
            e.stopPropagation();
            let modalMedia;
            if (story.type === 'image') {
                modalMedia = document.createElement('img');
                modalMedia.src = story.url;
                modalMedia.alt = 'Publication';
                modalMedia.style.maxWidth = '90vw';
                modalMedia.style.maxHeight = '80vh';
            } else if (story.type === 'video') {
                modalMedia = document.createElement('video');
                modalMedia.src = story.url;
                modalMedia.controls = true;
                modalMedia.autoplay = true;
                modalMedia.muted = false;
                modalMedia.volume = 1;
                modalMedia.style.maxWidth = '90vw';
                modalMedia.style.maxHeight = '80vh';
            }
            newsStoryModalContent.innerHTML = '';
            newsStoryModalContent.appendChild(modalMedia);
            newsStoryModal.style.display = 'flex';
            if (modalMedia && modalMedia.tagName === 'VIDEO') {
                function tryUnmute() {
                    modalMedia.muted = false;
                    modalMedia.volume = 1;
                    modalMedia.focus();
                    modalMedia.play().catch(()=>{});
                }
                setTimeout(tryUnmute, 100);
                setTimeout(tryUnmute, 400);
                setTimeout(tryUnmute, 1000);
                modalMedia.addEventListener('canplay', function handler() {
                    modalMedia.muted = false;
                    modalMedia.volume = 1;
                    modalMedia.play().catch(()=>{});
                    modalMedia.removeEventListener('canplay', handler);
                });
            }
        });
        // Gestion du menu options (3 points)
        const optionsBtn = div.querySelector('.news-story-options-btn');
        const optionsMenu = div.querySelector('.news-story-options-menu');
        optionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Ferme tous les autres menus d'options
            document.querySelectorAll('.news-story-options-menu').forEach(menu => {
                if (menu !== optionsMenu) menu.style.display = 'none';
            });
            optionsMenu.style.display = optionsMenu.style.display === 'none' ? 'block' : 'none';
        });
        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', function hideMenu(e) {
            if (!div.contains(e.target)) {
                optionsMenu.style.display = 'none';
            }
        });
        // Suppression individuelle via le menu
        div.querySelector('.news-story-delete-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Supprimer cette story ?')) {
                const realIdx = stories.length - 1 - idx;
                stories.splice(realIdx, 1);
                setNewsStories(stories);
                renderNewsStories();
            }
        });
        newsStoriesCarousel.appendChild(div);
    });
}

// Gestion du mode sombre/clair
const themeToggle = document.getElementById('theme-toggle');
function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTheme(!document.body.classList.contains('dark-theme'));
    });
    // Initialisation au chargement
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'dark');
}
