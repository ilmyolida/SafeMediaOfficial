// 1. Firebase Sozlamalari
const firebaseConfig = {
    apiKey: "AIzaSyA-YmqflIAZgiouEScOrZQsTdZT4teek6c",
    authDomain: "safemediaofficial-d25fa.firebaseapp.com",
    projectId: "safemediaofficial-d25fa",
    storageBucket: "safemediaofficial-d25fa.firebasestorage.app",
    messagingSenderId: "769260134268",
    appId: "1:769260134268:web:ebd92285f374fd489e8ef9",
    measurementId: "G-XRNBG7X68B"
};

// Firebaseni ishga tushirish
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 2. Tillar Obyekti
const translations = {
    ky: { home_welcome: "Кош келиңиз", nav_home: "Башкы", nav_community: "Коом", nav_solutions: "Чечим", nav_profile: "Профиль", apps_title: "Safe Media Колдонмолору", lang_title: "Тилдер" },
    uz: { home_welcome: "Xush kelibsiz", nav_home: "Bosh sahifa", nav_community: "Jamiyat", nav_solutions: "Yechim", nav_profile: "Profil", apps_title: "Safe Media Ilovalari", lang_title: "Tillar" },
    en: { home_welcome: "Welcome", nav_home: "Home", nav_community: "Community", nav_solutions: "Solutions", nav_profile: "Profile", apps_title: "Safe Media Apps", lang_title: "Languages" },
    ru: { home_welcome: "Добро пожаловать", nav_home: "Главная", nav_community: "Сообщество", nav_solutions: "Решения", nav_profile: "Профиль", apps_title: "Приложения Safe Media", lang_title: "Языки" },
    tr: { home_welcome: "Hoş geldiniz", nav_home: "Ana Sayfa", nav_community: "Topluluk", nav_solutions: "Çözümler", nav_profile: "Profil", apps_title: "Safe Media Uygulamaları", lang_title: "Diller" },
    ar: { home_welcome: "مرحباً بكم", nav_home: "الرئيسية", nav_community: "المجتمع", nav_solutions: "الحلول", nav_profile: "الملف الشخصي", apps_title: "تطبيقات ميديا الآمنة", lang_title: "اللغات" }
};

// 3. Side Navigatsiya
function toggleNav() {
    const side = document.getElementById("sideDrawer");
    side.style.width = side.style.width === "280px" ? "0" : "280px";
}

// 4. Tilni o'zgartirish
function changeLang(lang) {
    document.querySelectorAll('[data-key]').forEach(elem => {
        const key = elem.getAttribute('data-key');
        if(translations[lang][key]) {
            elem.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('selectedLang', lang);
    if(document.getElementById("sideDrawer").style.width === "280px") toggleNav();
}

// 5. Rejimlar (Dark/Light/Reading)
document.getElementById('readModeBtn').onclick = () => document.body.classList.toggle('reading-mode');
document.getElementById('themeBtn').onclick = () => {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeBtn');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
};

// 6. Firestore'dan Maqolalarni o'qish (Real-time)
function loadPosts() {
    const container = document.getElementById('postsContainer');
    db.collection("posts").orderBy("date", "desc").onSnapshot((querySnapshot) => {
        container.innerHTML = ""; 
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            container.innerHTML += `
                <div class="post-card">
                    <img src="${post.image}" class="post-img" onerror="this.src='https://via.placeholder.com/400x200?text=Safe+Media'">
                    <div class="post-body">
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                    </div>
                    <div class="post-actions">
                        <i class="fa-regular fa-heart" title="Like"></i>
                        <i class="fa-regular fa-bookmark" title="Save"></i>
                        <i class="fa-solid fa-share-nodes" title="Share"></i>
                    </div>
                </div>
            `;
        });
    });
}

// Sahifa yuklanganda ishlidigan funksiyalar
window.onload = () => {
    const savedLang = localStorage.getItem('selectedLang') || 'ky';
    changeLang(savedLang);
    loadPosts();
};