// 1. Tillar Obyekti
const translations = {
    ky: { home_welcome: "Кош келиңиз", nav_home: "Башкы", nav_community: "Коом", nav_solutions: "Чечим", nav_profile: "Профиль", apps_title: "Safe Media Колдонмолору", lang_title: "Тилдер" },
    uz: { home_welcome: "Xush kelibsiz", nav_home: "Bosh sahifa", nav_community: "Jamiyat", nav_solutions: "Yechim", nav_profile: "Profil", apps_title: "Safe Media Ilovalari", lang_title: "Tillar" },
    en: { home_welcome: "Welcome", nav_home: "Home", nav_community: "Community", nav_solutions: "Solutions", nav_profile: "Profile", apps_title: "Safe Media Apps", lang_title: "Languages" },
    ru: { home_welcome: "Добро пожаловать", nav_home: "Главная", nav_community: "Сообщество", nav_solutions: "Решения", nav_profile: "Профиль", apps_title: "Приложения Safe Media", lang_title: "Языки" },
    tr: { home_welcome: "Hoş geldiniz", nav_home: "Ana Sayfa", nav_community: "Topluluk", nav_solutions: "Çözümler", nav_profile: "Profil", apps_title: "Safe Media Uygulamaları", lang_title: "Diller" },
    ar: { home_welcome: "مرحباً بكم", nav_home: "الرئيسية", nav_community: "المجتمع", nav_solutions: "الحلول", nav_profile: "الملف الشخصي", apps_title: "تطبيقات ميديا الآمنة", lang_title: "اللغات" }
};

// 2. Navigatsiya Funksiyalari
function toggleNav() {
    const side = document.getElementById("sideDrawer");
    side.style.width = side.style.width === "280px" ? "0" : "280px";
}

function changeLang(lang) {
    document.querySelectorAll('[data-key]').forEach(elem => {
        const key = elem.getAttribute('data-key');
        elem.innerText = translations[lang][key];
    });
    localStorage.setItem('selectedLang', lang);
    toggleNav();
}

// 3. Rejimlar (Dark/Light/Reading)
const readModeBtn = document.getElementById('readModeBtn');
const themeBtn = document.getElementById('themeBtn');

readModeBtn.onclick = () => document.body.classList.toggle('reading-mode');
themeBtn.onclick = () => {
    document.body.classList.toggle('light-mode');
    themeBtn.classList.toggle('fa-moon');
    themeBtn.classList.toggle('fa-sun');
};

// 4. Tablarni almashtirish
function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    // Kelajakda bu yerda Firebase'dan kerakli tab ma'lumotlarini yuklaymiz
    console.log(tab + " yuklanmoqda...");
}

// Sahifa yuklanganda tilni tekshirish
window.onload = () => {
    const savedLang = localStorage.getItem('selectedLang') || 'ky';
    changeLang(savedLang);
};