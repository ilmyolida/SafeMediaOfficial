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
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// ================= SAHIFALARNI KO'RSATISH =================
function renderHomePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const t = window.translations?.[currentLang] || {};
    container.innerHTML = `
        <div class="hero-section">
            <h1>${t.welcome || 'Safe Media ге кош келиңиз!'}</h1>
            <p>${t.welcomeDesc || 'Жакшы адаттар, рухий өсүү жана заманбап технология'}</p>
        </div>
        <div class="categories-section">
            <h2>${t.categories || 'Категориялар'}</h2>
            <div class="categories-grid">
                <div class="category-card"><i class="fas fa-heart"></i><h3>${t.selfEducation || 'Өзүн-өзү тарбиялоо'}</h3><button class="explore-btn" onclick="alert('${t.selfEducation || 'Өзүн-өзү тарбиялоо'}')">${t.explore || 'Изилдөө'}</button></div>
                <div class="category-card"><i class="fas fa-calendar-check"></i><h3>${t.habits || 'Адаттар'}</h3><button class="explore-btn" onclick="alert('${t.habits || 'Адаттар'}')">${t.explore || 'Изилдөө'}</button></div>
                <div class="category-card"><i class="fas fa-chart-line"></i><h3>${t.business || 'Бизнес жана Өсүш'}</h3><button class="explore-btn" onclick="alert('${t.business || 'Бизнес'}')">${t.explore || 'Изилдөө'}</button></div>
                <div class="category-card"><i class="fas fa-mosque"></i><h3>${t.islamic || 'Ислам жана Руханият'}</h3><button class="explore-btn" onclick="alert('${t.islamic || 'Ислам'}')">${t.explore || 'Изилдөө'}</button></div>
            </div>
        </div>
        <div class="promo-card" onclick="window.open('https://ilmyolida.github.io/Habittracer/','_blank')">
            <i class="fas fa-chart-line"></i><div><h3>Habit Tracker Pro</h3><p>${t.habits || 'Адаттарыңызды көзөмөлдөңүз'}</p></div><i class="fas fa-arrow-right"></i>
        </div>
    `;
}

function renderInfoPage() {
    const t = window.translations?.[currentLang] || {};
    document.getElementById('postsContainer').innerHTML = `
        <div class="solutions-header"><h1>${t.info || 'Маалымат'}</h1></div>
        <div class="solution-card"><div class="problem"><i class="fas fa-exclamation-triangle"></i><div><strong>${t.problem || 'Көйгөй'}:</strong><p>Ғазабни бошқара олмаслик</p></div></div>
        <div class="solution"><i class="fas fa-lightbulb"></i><div><strong>${t.solution || 'Чечим'}:</strong><p>3 сония қоидаси</p></div></div>
        <div class="result"><i class="fas fa-star"></i><div><strong>${t.result || 'Натыйжа'}:</strong><p>Хотиржамлик</p></div></div></div>
    `;
}

function renderCommunityPage() {
    const t = window.translations?.[currentLang] || {};
    document.getElementById('postsContainer').innerHTML = `<div class="coming-soon"><i class="fas fa-users"></i><h3>${t.comingSoon || 'Жакында...'}</h3><p>${t.communityTitle || 'Жамият жаңылыктары'}</p></div>`;
}

async function loadPosts() {
    if (currentPage === 'home') { renderHomePage(); return; }
    if (currentPage === 'info') { renderInfoPage(); return; }
    if (currentPage === 'community') { renderCommunityPage(); return; }
    if (currentPage === 'profile') { showProfilePage(); return; }
    
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading">⏳ Жүктөлүүдө...</div>';
    try {
        const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
        allPosts = [];
        snapshot.forEach(doc => allPosts.push({ id: doc.id, ...doc.data() }));
        if (allPosts.length === 0) container.innerHTML = '<div class="loading">📝 Посттор жок. Админ кирип кошуңуз!</div>';
        else renderPosts(allPosts);
    } catch(e) { container.innerHTML = '<div class="loading">❌ Ката кетти</div>'; }
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    let html = '';
    posts.forEach(post => {
        html += `
            <div class="post-card" data-id="${post.id}">
                ${post.imageUrl ? `<img src="${post.imageUrl}" onerror="this.style.display='none'">` : ''}
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.content)}</p>
                ${currentUser && ADMIN_EMAILS.includes(currentUser.email) ? `<button class="delete-post-btn" onclick="deletePost('${post.id}')"><i class="fas fa-trash-alt"></i> Өчүрүү</button>` : ''}
                <button class="share-post-btn" onclick="sharePost('${escapeHtml(post.title)}','${escapeHtml(post.content)}')"><i class="fas fa-share-alt"></i> Бөлүшүү</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }

async function deletePost(id) { if(confirm("Өчүрүү?")) { await db.collection('posts').doc(id).delete(); loadPosts(); } }

function sharePost(title, content) { navigator.clipboard.writeText(`${title}\n${content}\n— Safe Media`); alert("📋 Нусхаланды!"); }

// ================= AUTH & ADMIN =================
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

async function addNewPost() {
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) { alert("Администратор эмессиз!"); return; }
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const imageUrl = document.getElementById('postImage').value.trim();
    const category = document.getElementById('postCategory').value;
    if (!title || !content) { alert("Сарлавҳа ва мазмун толтуруңуз!"); return; }
    await db.collection('posts').add({ title, content, imageUrl, category, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    closeAdminModal();
    loadPosts();
}

function showProfilePage() {
    const container = document.getElementById('postsContainer');
    const t = window.translations?.[currentLang] || {};
    if (!currentUser) {
        container.innerHTML = `<div class="post-card" style="text-align:center"><i class="fas fa-user-circle" style="font-size:4rem"></i><h3>${t.loginRequired || 'Кирүү керек'}</h3><p>${t.loginDesc || 'Google менен кириңиз'}</p><button class="google-btn" onclick="openLoginModal()"><i class="fab fa-google"></i> ${t.loginWithGoogle || 'Google менен кирүү'}</button></div>`;
        return;
    }
    let adminBtn = ADMIN_EMAILS.includes(currentUser.email) ? `<button class="google-btn" onclick="openAdminModal()" style="background:#4facfe; margin-bottom:10px"><i class="fas fa-plus-circle"></i> ${t.addPost || 'Жаңы пост кошуу'}</button>` : '';
    container.innerHTML = `
        <div class="post-card" style="text-align:center">
            <i class="fas fa-user-circle" style="font-size:4rem"></i>
            <h3>${escapeHtml(currentUser.displayName)}</h3>
            <p>${escapeHtml(currentUser.email)}</p>
            ${adminBtn}
            <button class="google-btn" onclick="logout()" style="background:#555"><i class="fas fa-sign-out-alt"></i> ${t.logout || 'Чыгуу'}</button>
            <div style="margin-top:20px; padding:15px; background:rgba(79,172,254,0.1); border-radius:15px">
                <h4>⚙️ ${t.settings || 'Орнотуулар'}</h4>
                <button onclick="localStorage.clear(); alert('Кеш тазаланды'); location.reload();" style="background:#ff6b6b; border:none; padding:8px 15px; border-radius:20px; color:white; margin:5px"><i class="fas fa-trash"></i> ${t.clearCache || 'Кешни тазалоо'}</button>
                <button onclick="exportUserData()" style="background:#4facfe; border:none; padding:8px 15px; border-radius:20px; color:white; margin:5px"><i class="fas fa-database"></i> ${t.exportData || 'Маалыматтарды жүктөө'}</button>
            </div>
        </div>
    `;
}

function exportUserData() {
    const data = { user: currentUser, posts: allPosts, settings: { theme: localStorage.getItem('theme'), lang: localStorage.getItem('lang') } };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `safe_media_data_${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

function logout() { auth.signOut().then(() => { currentUser = null; loadPosts(); }); }

// ================= BOTTOM NAV =================
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

// ================= AUTH LISTENER =================
function setupAuthListener() {
    auth.onAuthStateChanged(user => { currentUser = user; if (currentPage === 'profile') showProfilePage(); loadPosts(); });
}

// ================= SEARCH =================
function searchPosts() {
    const keyword = document.getElementById('searchInput')?.value.toLowerCase();
    if (!keyword) { loadPosts(); return; }
    const filtered = allPosts.filter(p => p.title?.toLowerCase().includes(keyword) || p.content?.toLowerCase().includes(keyword));
    renderPosts(filtered);
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    setupBottomNav();
    setupAuthListener();
    document.getElementById('googleLoginBtn')?.addEventListener('click', async () => { await auth.signInWithPopup(provider); closeLoginModal(); });
    document.getElementById('submitPostBtn')?.addEventListener('click', addNewPost);
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
window.deletePost = deletePost;
window.sharePost = sharePost;
window.exportUserData = exportUserData;