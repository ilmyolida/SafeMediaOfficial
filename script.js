// ================= GLOBAL =================
let currentUser = null;
let currentPage = 'home';
let allPosts = [];

// ================= SIDE MENU =================
function toggleSideMenu() {
    const drawer = document.getElementById('sideDrawer');
    if (drawer) drawer.classList.toggle('open');
}

// ================= THEME =================
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-mode', 'reading-mode');
    if (theme === 'light') document.body.classList.add('light-mode');
    if (theme === 'reading') document.body.classList.add('reading-mode');
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme); else setTheme('dark');

// ================= RENDER PAGES =================
function renderHomePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const t = translations[currentLang];
    const categories = [
        { icon: "fa-heart", name: t?.selfEducation || "Өзүн-өзү тарбиялоо", color: "#4facfe", bg: "rgba(79,172,254,0.1)" },
        { icon: "fa-calendar-check", name: t?.habits || "Адаттар", color: "#00f2fe", bg: "rgba(0,242,254,0.1)" },
        { icon: "fa-chart-line", name: t?.business || "Бизнес жана Өсүш", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)" },
        { icon: "fa-mosque", name: t?.islamic || "Ислам жана Руханият", color: "#ffd93d", bg: "rgba(255,217,61,0.1)" }
    ];
    let html = `<div class="hero-section"><h1 data-lang="welcome">${t?.welcome || 'Safe Media ге кош келиңиз!'}</h1>
                <p data-lang="welcomeDesc">${t?.welcomeDesc || 'Жакшы адаттар, рухий өсүү жана заманбап технология'}</p></div>
                <div class="categories-section"><h2 data-lang="categories">${t?.categories || 'Категориялар'}</h2><div class="categories-grid">`;
    categories.forEach(cat => {
        html += `<div class="category-card" style="background: ${cat.bg}; border-left: 3px solid ${cat.color}">
                    <i class="fas ${cat.icon}" style="color: ${cat.color}"></i>
                    <h3>${cat.name}</h3>
                    <button class="explore-btn" onclick="alert('${cat.name}')">${t?.explore || 'Изилдөө'}</button>
                </div>`;
    });
    html += `</div></div><div class="promo-card" onclick="window.location.href='habittracer.html'">
                <i class="fas fa-chart-line"></i><div><h3>${t?.habitTracker || 'Habit Tracker Pro'}</h3>
                <p>${t?.habits || 'Адаттарыңызды көзөмөлдөңүз'}</p></div><i class="fas fa-arrow-right"></i>
            </div>`;
    container.innerHTML = html;
    if (window.updateAllTexts) window.updateAllTexts();
}

function renderInfoPage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const t = translations[currentLang];
    container.innerHTML = `<div class="solutions-header"><h1 data-lang="solutionsTitle">${t?.solutionsTitle || 'Маалымат борбору'}</h1></div>
        <div class="solutions-list">
            <div class="solution-card"><div class="problem"><i class="fas fa-exclamation-triangle"></i><div><strong data-lang="problem">${t?.problem || 'Көйгөй'}:</strong><p>G'azabni boshqara olmaslik</p></div></div>
            <div class="solution"><i class="fas fa-lightbulb"></i><div><strong data-lang="solution">${t?.solution || 'Чечим'}:</strong><p>3 soniya qoidasi - chuqur nafas olish</p></div></div>
            <div class="result"><i class="fas fa-star"></i><div><strong data-lang="result">${t?.result || 'Натыйжа'}:</strong><p>Xotirjamlik va sabrli bo'lish</p></div></div></div>
            <div class="solution-card"><div class="problem"><i class="fas fa-exclamation-triangle"></i><div><strong>${t?.problem || 'Көйгөй'}:</strong><p>Vaqtni bekorga sarflash</p></div></div>
            <div class="solution"><i class="fas fa-lightbulb"></i><div><strong>${t?.solution || 'Чечим'}:</strong><p>Kunlik 3 ta muhim vazifa belgilash</p></div></div>
            <div class="result"><i class="fas fa-star"></i><div><strong>${t?.result || 'Натыйжа'}:</strong><p>Samaradorlik 70% ga oshadi</p></div></div></div>
        </div>`;
}

function renderCommunityPage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const t = translations[currentLang];
    container.innerHTML = `<div class="community-header"><h1 data-lang="communityTitle">${t?.communityTitle || 'Жамият жаңылыктары'}</h1></div>
        <div class="coming-soon"><i class="fas fa-users"></i><h3 data-lang="comingSoon">${t?.comingSoon || 'Жакында...'}</h3><p>Safe Media Community tez kunda!</p></div>`;
}

function showProfilePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const t = translations[currentLang];
    if (!currentUser) {
        container.innerHTML = `<div class="post-card" style="text-align:center">
            <i class="fas fa-user-circle" style="font-size:4rem;color:#4facfe"></i>
            <h3 data-lang="loginRequired">${t?.loginRequired || 'Кирүү керек'}</h3>
            <p data-lang="loginDesc">${t?.loginDesc || 'Постторду көрүү үчүн Google менен кириңиз'}</p>
            <button class="google-btn" onclick="openLoginModal()"><i class="fab fa-google"></i> ${t?.loginWithGoogle || 'Google менен кирүү'}</button>
        </div>`;
        return;
    }
    let adminButton = '';
    if (ADMIN_EMAILS.includes(currentUser.email)) {
        adminButton = `<button class="google-btn" onclick="openAdminModal()" style="background:#4facfe; margin-bottom:10px"><i class="fas fa-plus"></i> ${t?.addPost || 'Жаңы пост кошуу'}</button>`;
    }
    container.innerHTML = `<div class="post-card" style="text-align:center">
        <i class="fas fa-user-circle" style="font-size:4rem;color:#4facfe"></i>
        <h3>${escapeHtml(currentUser.displayName || 'User')}</h3>
        <p>${escapeHtml(currentUser.email)}</p>
        ${adminButton}
        <button class="google-btn" onclick="logout()" style="background:#555"><i class="fas fa-sign-out-alt"></i> ${t?.logout || 'Чыгуу'}</button>
    </div>`;
}

// ================= LOAD POSTS (for admin posts, but we also use static pages) =================
async function loadPosts() {
    if (currentPage === 'home') { renderHomePage(); return; }
    if (currentPage === 'info') { renderInfoPage(); return; }
    if (currentPage === 'community') { renderCommunityPage(); return; }
    if (currentPage === 'profile') { showProfilePage(); return; }
    // Normally posts would be loaded from Firebase for dynamic content, but we keep static for now
}

// ================= SEARCH =================
function searchPosts() {
    const keyword = document.getElementById('searchInput')?.value.toLowerCase();
    if (!keyword) return;
    // Simple search: filter static cards (just alert for demo)
    alert("Издөө функционалы келечекте ишке кирет / Search function coming soon");
}

// ================= AUTH =================
function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function openAdminModal() {
    if (!currentUser) { openLoginModal(); return; }
    if (!ADMIN_EMAILS.includes(currentUser.email)) { alert("Сиз администратор эмессиз!"); return; }
    document.getElementById('adminModal').style.display = 'flex';
}
function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
}

function setupAuth() {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithPopup(provider);
                currentUser = result.user;
                closeLoginModal();
                if (ADMIN_EMAILS.includes(currentUser.email)) {
                    const profileNav = document.querySelector('.nav-item[data-page="profile"]');
                    if (profileNav && !profileNav.querySelector('.fa-plus-circle')) {
                        const plusIcon = document.createElement('i');
                        plusIcon.className = 'fas fa-plus-circle';
                        plusIcon.style.marginLeft = '10px';
                        plusIcon.style.cursor = 'pointer';
                        plusIcon.onclick = (e) => { e.stopPropagation(); openAdminModal(); };
                        profileNav.appendChild(plusIcon);
                    }
                }
                if (currentPage === 'profile') showProfilePage();
            } catch (error) { console.error(error); alert("Кирүү мүмкүн болбой калды!"); }
        });
    }
}

function logout() { auth.signOut().then(() => { currentUser = null; if (currentPage === 'profile') showProfilePage(); location.reload(); }); }

// ================= ADD POST (ADMIN) =================
function setupAddPost() {
    const submitBtn = document.getElementById('submitPostBtn');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', async () => {
        if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) { alert("Сиз администратор эмессиз!"); return; }
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const imageUrl = document.getElementById('postImage').value;
        const category = document.getElementById('postCategory').value;
        if (!title || !content) { alert("Сарлавҳа жана мазмун толтуруңуз!"); return; }
        try {
            await db.collection('posts').add({ title, content, imageUrl, category, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            closeAdminModal();
            alert("Пост кошулду!");
        } catch (error) { console.error(error); alert("Постту кошуу мүмкүн болбой калды!"); }
    });
}

// ================= BOTTOM NAVIGATION =================
function setupBottomNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            currentPage = this.getAttribute('data-page');
            loadPosts();
        });
    });
}

// ================= HELPERS =================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================= AUTH STATE LISTENER =================
function setupAuthListener() {
    auth.onAuthStateChanged((user) => { currentUser = user; if (currentPage === 'profile') showProfilePage(); });
}

// ================= ADD CUSTOM STYLES =================
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .hero-section { text-align: center; padding: 40px 20px; background: linear-gradient(135deg,rgba(79,172,254,0.1),rgba(0,242,254,0.1)); border-radius: 30px; margin-bottom: 30px; }
        .hero-section h1 { font-size: 1.8rem; margin-bottom: 10px; background: linear-gradient(90deg,#4facfe,#00f2fe); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .categories-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 15px; margin-bottom: 30px; }
        .category-card { padding: 20px; border-radius: 20px; text-align: center; }
        .category-card i { font-size: 2rem; margin-bottom: 10px; }
        .explore-btn { background: none; border: none; color: #4facfe; cursor: pointer; font-size: 0.8rem; }
        .promo-card { background: linear-gradient(135deg,#4facfe,#00f2fe); border-radius: 20px; padding: 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 20px; }
        .solution-card { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; margin-bottom: 20px; }
        .problem, .solution, .result { display: flex; gap: 15px; margin-bottom: 15px; padding: 10px; border-radius: 15px; }
        .problem i { color: #ff6b6b; } .solution i { color: #4facfe; } .result i { color: #00c853; }
        .coming-soon { text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.05); border-radius: 30px; }
        @media (max-width: 600px) { .categories-grid { grid-template-columns: 1fr; } .hero-section h1 { font-size: 1.3rem; } }
    `;
    document.head.appendChild(style);
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    addCustomStyles();
    setupBottomNav();
    setupAuth();
    setupAddPost();
    setupAuthListener();
    loadPosts();
});

window.toggleSideMenu = toggleSideMenu;
window.setTheme = setTheme;
window.searchPosts = searchPosts;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.logout = logout;