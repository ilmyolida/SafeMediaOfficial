// ================= GLOBAL O'ZGARUVCHILAR =================
let currentUser = null;
let currentPage = 'home';
let allPosts = [];

// ================= SIDE MENU =================
function toggleSideMenu() {
    const drawer = document.getElementById('sideDrawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

// ================= THEME =================
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-mode', 'reading-mode');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else if (theme === 'reading') {
        document.body.classList.add('reading-mode');
    }
}

// Sahifa yuklanganda saqlangan temani yuklash
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme('dark');
}

// ================= LANGUAGE =================
const translations = {
    ky: {
        about: 'Safe Media - дин, тарбия жана технология'
    },
    en: {
        about: 'Safe Media - Faith, Education & Technology'
    },
    ru: {
        about: 'Safe Media - Религия, воспитание и технологии'
    },
    tr: {
        about: 'Safe Media - Din, Terbiye ve Teknoloji'
    },
    ar: {
        about: 'سيف ميديا - الدين والتربية والتكنولوجيا'
    }
};

function changeLanguage() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect) return;
    
    const lang = langSelect.value;
    localStorage.setItem('lang', lang);
    
    const aboutText = document.getElementById('aboutText');
    if (aboutText && translations[lang]) {
        aboutText.innerText = translations[lang].about;
    }
}

// Sahifa yuklanganda saqlangan tilni yuklash
const savedLang = localStorage.getItem('lang');
if (savedLang) {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = savedLang;
        changeLanguage();
    }
}

// ================= LOAD POSTS FROM FIREBASE =================
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Жүктөлүүдө...</div>';
    
    try {
        const snapshot = await db.collection('posts')
            .orderBy('timestamp', 'desc')
            .get();
        
        allPosts = [];
        snapshot.forEach(doc => {
            allPosts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filterPostsByPage();
    } catch (error) {
        console.error("Xatolik:", error);
        container.innerHTML = '<div class="loading">Қате кетти. Firebase тексеріңіз.</div>';
    }
}

function filterPostsByPage() {
    const filtered = allPosts.filter(post => post.category === currentPage);
    renderPosts(filtered);
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="loading">Посттор жок / Нет постов</div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        html += `
            <div class="post-card">
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="post image" onerror="this.style.display='none'">` : ''}
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.content)}</p>
            </div>
        `;
    }
    container.innerHTML = html;
}

// HTML special characters dan himoya qilish
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================= SEARCH =================
function searchPosts() {
    const keyword = document.getElementById('searchInput');
    if (!keyword) return;
    
    const searchTerm = keyword.value.toLowerCase();
    const filtered = allPosts.filter(post => 
        (post.title && post.title.toLowerCase().includes(searchTerm)) || 
        (post.content && post.content.toLowerCase().includes(searchTerm))
    );
    renderPosts(filtered);
}

// ================= BOTTOM NAVIGATION =================
function setupBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            currentPage = this.getAttribute('data-page');
            filterPostsByPage();
        });
    });
}

// ================= AUTHENTICATION =================
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function openAdminModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    
    // Admin tekshiruvi
    if (!ADMIN_EMAILS.includes(currentUser.email)) {
        alert("Сиз администратор эмессиз!");
        return;
    }
    
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'flex';
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
    
    // Formani tozalash
    const title = document.getElementById('postTitle');
    const content = document.getElementById('postContent');
    const image = document.getElementById('postImage');
    if (title) title.value = '';
    if (content) content.value = '';
    if (image) image.value = '';
}

// Google login
function setupAuth() {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithPopup(provider);
                currentUser = result.user;
                closeLoginModal();
                
                // Admin profilga plus icon qo'shish
                if (ADMIN_EMAILS.includes(currentUser.email)) {
                    const profileNav = document.querySelector('.nav-item[data-page="profile"]');
                    if (profileNav && !profileNav.querySelector('.fa-plus-circle')) {
                        const plusIcon = document.createElement('i');
                        plusIcon.className = 'fas fa-plus-circle';
                        plusIcon.style.marginLeft = '10px';
                        plusIcon.style.cursor = 'pointer';
                        plusIcon.onclick = (e) => {
                            e.stopPropagation();
                            openAdminModal();
                        };
                        profileNav.appendChild(plusIcon);
                    }
                }
                
                // Profil sahifasini yangilash
                if (currentPage === 'profile') {
                    showProfilePage();
                }
            } catch (error) {
                console.error("Login xatosi:", error);
                alert("Кирүү мүмкүн болбой калды!");
            }
        });
    }
}

// Profil sahifasini ko'rsatish
function showProfilePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="post-card" style="text-align: center">
                <h3>Кирүү керек</h3>
                <p>Постторду көрүү үчүн Google менен кириңиз</p>
                <button class="google-btn" onclick="openLoginModal()">Google менен кирүү</button>
            </div>
        `;
        return;
    }
    
    let adminButton = '';
    if (ADMIN_EMAILS.includes(currentUser.email)) {
        adminButton = '<button class="google-btn" onclick="openAdminModal()" style="background:#4facfe; margin-bottom:10px">➕ Жаңы пост кошуу</button>';
    }
    
    container.innerHTML = `
        <div class="post-card" style="text-align: center">
            <i class="fas fa-user-circle" style="font-size: 4rem; color: #4facfe"></i>
            <h3>${escapeHtml(currentUser.displayName || 'User')}</h3>
            <p>${escapeHtml(currentUser.email)}</p>
            ${adminButton}
            <button class="google-btn" onclick="logout()" style="background:#555">Чыгуу / Logout</button>
        </div>
    `;
}

// Logout
function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        if (currentPage === 'profile') {
            showProfilePage();
        }
        location.reload();
    });
}

// ================= ADD POST (ADMIN) =================
function setupAddPost() {
    const submitBtn = document.getElementById('submitPostBtn');
    if (!submitBtn) return;
    
    submitBtn.addEventListener('click', async () => {
        if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
            alert("Сиз администратор эмессиз!");
            return;
        }
        
        const title = document.getElementById('postTitle');
        const content = document.getElementById('postContent');
        const imageUrl = document.getElementById('postImage');
        const category = document.getElementById('postCategory');
        
        if (!title.value || !content.value) {
            alert("Сарлавҳа жана мазмун толтуруңуз!");
            return;
        }
        
        try {
            await db.collection('posts').add({
                title: title.value,
                content: content.value,
                imageUrl: imageUrl.value || '',
                category: category.value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeAdminModal();
            loadPosts();
        } catch (error) {
            console.error("Post qo'shish xatosi:", error);
            alert("Постту кошуу мүмкүн болбой калды!");
        }
    });
}

// ================= AUTH STATE LISTENER =================
function setupAuthListener() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (currentPage === 'profile') {
            showProfilePage();
        }
    });
}

// ================= PAGE CHANGE HANDLER =================
function handlePageChange() {
    if (currentPage === 'profile') {
        showProfilePage();
    } else {
        filterPostsByPage();
    }
}

// Override qilish
const originalFilterPosts = filterPostsByPage;
window.filterPostsByPage = function() {
    if (currentPage === 'profile') {
        showProfilePage();
    } else {
        originalFilterPosts();
    }
};
filterPostsByPage = function() {
    if (currentPage === 'profile') {
        showProfilePage();
    } else {
        originalFilterPosts();
    }
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    setupBottomNav();
    setupAuth();
    setupAddPost();
    setupAuthListener();
    loadPosts();
});

// Global funksiyalarni window ga qo'shish
window.toggleSideMenu = toggleSideMenu;
window.setTheme = setTheme;
window.changeLanguage = changeLanguage;
window.searchPosts = searchPosts;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.logout = logout;
window.filterPostsByPage = filterPostsByPage;