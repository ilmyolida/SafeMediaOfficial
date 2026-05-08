// ================= GLOBAL =================
let currentUser = null;
let currentPage = 'home';
let allPosts = [];

// ================= SIDE MENU =================
function toggleSideMenu() { const d = document.getElementById('sideDrawer'); if(d) d.classList.toggle('open'); }

// ================= THEME =================
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-mode','reading-mode');
    if(theme==='light') document.body.classList.add('light-mode');
    if(theme==='reading') document.body.classList.add('reading-mode');
}
const savedTheme = localStorage.getItem('theme') || 'dark'; setTheme(savedTheme);

// ================= REAL FUNKSIYALAR =================
function showDailyQuote() {
    const quotes = ["Яхши одат - энг яхши сармоя.", "Сабр - имоннинг ярми.", "Илм - энг катта бойлик.", "Вакт - килич, агар сен кесмасанг, у сени кесади."];
    alert(`✨ ${quotes[Math.floor(Math.random()*quotes.length)]}`);
}
function showTodoList() {
    let tasks = localStorage.getItem('todoTasks');
    if(!tasks) tasks = ["Намоз ўқиш", "Қуръон ўқиш", "Спорт қилиш"];
    else tasks = JSON.parse(tasks);
    let newTasks = prompt("Вазифаларни вергул билан ёзинг (масалан: Намоз, Китоб ўқиш)\nҲозирги: "+tasks.join(", "), tasks.join(", "));
    if(newTasks) {
        let arr = newTasks.split(',').map(t=>t.trim());
        localStorage.setItem('todoTasks', JSON.stringify(arr));
        alert("Вазифалар сақланди!\n✅ " + arr.join("\n✅ "));
    }
}
document.getElementById('dailyQuoteBtn')?.addEventListener('click', showDailyQuote);
document.getElementById('todoBtn')?.addEventListener('click', showTodoList);

// ================= FIREBASE POSTLARNI YUKLASH =================
async function loadPostsFromFirebase() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    // Agar maxsus sahifalar bo'lsa
    if (currentPage === 'info') { renderInfoPage(); return; }
    if (currentPage === 'community') { renderCommunityPage(); return; }
    if (currentPage === 'profile') { showProfilePage(); return; }
    
    // Home sahifasi - postlarni ko'rsatish
    container.innerHTML = '<div class="loading">⏳ Жүктөлүүдө...</div>';
    
    try {
        const snapshot = await db.collection('posts')
            .orderBy('timestamp', 'desc')
            .get();
        
        allPosts = [];
        snapshot.forEach(doc => {
            allPosts.push({ id: doc.id, ...doc.data() });
        });
        
        if (allPosts.length === 0) {
            container.innerHTML = `<div class="loading">📝 Ҳали пост жок. Админ кириб қўшинг!</div>`;
            return;
        }
        
        renderPosts(allPosts);
    } catch (error) {
        console.error("Xatolik:", error);
        container.innerHTML = '<div class="loading">❌ Хато кетти. Қайта юкланг!</div>';
    }
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    let html = '';
    
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const date = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Янги';
        
        html += `
            <div class="post-card" data-id="${post.id}">
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="post image" onerror="this.style.display='none'">` : ''}
                <div class="post-header">
                    <h3>${escapeHtml(post.title)}</h3>
                    <span class="post-date"><i class="far fa-calendar-alt"></i> ${date}</span>
                </div>
                <p>${escapeHtml(post.content)}</p>
                ${currentUser && ADMIN_EMAILS.includes(currentUser.email) ? 
                    `<button class="delete-post-btn" onclick="deletePost('${post.id}')"><i class="fas fa-trash-alt"></i> Ўчириш</button>` : ''}
            </div>
        `;
    }
    container.innerHTML = html;
}

async function deletePost(postId) {
    if (confirm("Ростидан ҳам бу постни ўчирмоқчимисиз?")) {
        try {
            await db.collection('posts').doc(postId).delete();
            alert("✅ Пост ўчирилди!");
            loadPostsFromFirebase();
        } catch (error) {
            alert("❌ Хато: " + error.message);
        }
    }
}

function searchPosts() {
    const keyword = document.getElementById('searchInput')?.value.toLowerCase();
    if (!keyword) { renderPosts(allPosts); return; }
    const filtered = allPosts.filter(post => 
        (post.title && post.title.toLowerCase().includes(keyword)) || 
        (post.content && post.content.toLowerCase().includes(keyword))
    );
    renderPosts(filtered);
}

// ================= SAHIFALAR =================
function renderInfoPage() {
    const t = translations[currentLang];
    document.getElementById('postsContainer').innerHTML = `
        <div class="solutions-header"><h1><i class="fas fa-info-circle"></i> ${t.info || 'Маалымат'}</h1></div>
        <div class="solution-card">
            <div class="problem"><i class="fas fa-exclamation-triangle"></i><div><strong>${t.problem || 'Көйгөй'}:</strong><p>Ғазабни бошқара олмаслик</p></div></div>
            <div class="solution"><i class="fas fa-lightbulb"></i><div><strong>${t.solution || 'Чечим'}:</strong><p>3 сония қоидаси - чуқур нафас олиш</p></div></div>
            <div class="result"><i class="fas fa-star"></i><div><strong>${t.result || 'Натыйжа'}:</strong><p>Хотиржамлик ва сабрли бўлиш</p></div></div>
        </div>
        <div class="solution-card">
            <div class="problem"><i class="fas fa-clock"></i><div><strong>${t.problem || 'Көйгөй'}:</strong><p>Вақтни бекорга сарфлаш</p></div></div>
            <div class="solution"><i class="fas fa-lightbulb"></i><div><strong>${t.solution || 'Чечим'}:</strong><p>Кунлик 3 та муҳим вазифа белгилаш</p></div></div>
            <div class="result"><i class="fas fa-star"></i><div><strong>${t.result || 'Натыйжа'}:</strong><p>Самарадорлик 70% га ошади</p></div></div>
        </div>`;
}

function renderCommunityPage() {
    const t = translations[currentLang];
    document.getElementById('postsContainer').innerHTML = `
        <div class="coming-soon"><i class="fas fa-users"></i><h3>${t.comingSoon || 'Жакында...'}</h3><p>${t.communityTitle || 'Жамият жаңылыктары'}</p></div>`;
}

function showProfilePage() {
    const t = translations[currentLang];
    const container = document.getElementById('postsContainer');
    if(!currentUser) {
        container.innerHTML = `<div class="post-card" style="text-align:center"><i class="fas fa-user-circle" style="font-size:4rem;color:#4facfe"></i><h3>${t.loginRequired || 'Кирүү керек'}</h3><p>${t.loginDesc || 'Google билан киринг'}</p><button class="google-btn" onclick="openLoginModal()"><i class="fab fa-google"></i> ${t.loginWithGoogle || 'Google билан кириш'}</button></div>`;
        return;
    }
    let adminBtn = ADMIN_EMAILS.includes(currentUser.email) ? `<button class="google-btn" onclick="openAdminModal()" style="background:#4facfe;margin-bottom:10px"><i class="fas fa-plus-circle"></i> ${t.addPost || 'Янги пост қўшиш'}</button>` : '';
    container.innerHTML = `<div class="post-card" style="text-align:center"><i class="fas fa-user-circle" style="font-size:4rem;color:#4facfe"></i><h3>${escapeHtml(currentUser.displayName)}</h3><p>${escapeHtml(currentUser.email)}</p>${adminBtn}<button class="google-btn" onclick="logout()" style="background:#555"><i class="fas fa-sign-out-alt"></i> ${t.logout || 'Чиқиш'}</button></div>`;
}

function loadPosts() { loadPostsFromFirebase(); }

// ================= AUTH =================
function openLoginModal() { document.getElementById('loginModal').style.display='flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display='none'; }
function openAdminModal() { 
    if(!currentUser) { openLoginModal(); return; } 
    if(!ADMIN_EMAILS.includes(currentUser.email)) { alert("❌ Сиз администратор эмессиз!"); return; } 
    document.getElementById('adminModal').style.display='flex'; 
}
function closeAdminModal() { 
    document.getElementById('adminModal').style.display='none'; 
    document.getElementById('postTitle').value=''; 
    document.getElementById('postContent').value=''; 
    document.getElementById('postImage').value=''; 
}

function setupAuth() {
    const btn = document.getElementById('googleLoginBtn');
    if(btn) btn.addEventListener('click', async () => {
        try {
            const res = await auth.signInWithPopup(provider);
            currentUser = res.user;
            closeLoginModal();
            if(ADMIN_EMAILS.includes(currentUser.email)) {
                let pNav = document.querySelector('.nav-item[data-page="profile"]');
                if(pNav && !pNav.querySelector('.fa-plus-circle')) {
                    let icon = document.createElement('i');
                    icon.className = 'fas fa-plus-circle';
                    icon.style.marginLeft = '10px';
                    icon.style.cursor = 'pointer';
                    icon.onclick = (e) => { e.stopPropagation(); openAdminModal(); };
                    pNav.appendChild(icon);
                }
            }
            if(currentPage === 'profile') showProfilePage();
        } catch(e) { alert("❌ Кириш мумкин бўлмади!"); }
    });
}

function logout() { auth.signOut().then(()=>{ currentUser=null; if(currentPage==='profile') showProfilePage(); location.reload(); }); }

// ================= ADMIN POST QO'SHISH =================
function setupAddPost() {
    const btn = document.getElementById('submitPostBtn');
    if(btn) btn.addEventListener('click', async () => {
        if(!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) { alert("❌ Администратор эмассиз!"); return; }
        
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const imageUrl = document.getElementById('postImage').value.trim();
        const category = document.getElementById('postCategory').value;
        
        if(!title || !content) { alert("❌ Сарлавҳа ва мазмунни тўлдиринг!"); return; }
        
        try {
            await db.collection('posts').add({
                title: title,
                content: content,
                imageUrl: imageUrl,
                category: category,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            closeAdminModal();
            alert("✅ Пост муваффақиятли қўшилди!");
            loadPostsFromFirebase();
        } catch(error) {
            alert("❌ Хато: " + error.message);
        }
    });
}

// ================= BOTTOM NAV =================
function setupBottomNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(nav=>nav.classList.remove('active'));
            this.classList.add('active');
            currentPage = this.getAttribute('data-page');
            loadPosts();
        });
    });
}

function setupAuthListener() { auth.onAuthStateChanged(user => { currentUser = user; if(currentPage === 'profile') showProfilePage(); }); }

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, function(m){ if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

function addCustomStyles() {
    let style = document.createElement('style');
    style.textContent = `
        .hero-section{text-align:center;padding:40px 20px;background:linear-gradient(135deg,rgba(79,172,254,0.1),rgba(0,242,254,0.1));border-radius:30px;margin-bottom:30px}
        .post-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap}
        .post-date{font-size:0.7rem;color:#aaa;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:20px}
        .delete-post-btn{background:#ff6b6b;border:none;padding:8px 16px;border-radius:20px;color:white;cursor:pointer;margin-top:15px;font-size:0.8rem}
        .delete-post-btn:hover{background:#ff4757}
        .categories-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px}
        .category-card{padding:20px;border-radius:20px;text-align:center;background:rgba(255,255,255,0.05)}
        .category-card i{font-size:2rem;margin-bottom:10px;color:#4facfe}
        .promo-card{background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:20px;padding:20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-top:20px}
        .solution-card{background:rgba(255,255,255,0.05);border-radius:20px;padding:20px;margin-bottom:20px}
        .problem,.solution,.result{display:flex;gap:15px;margin-bottom:15px;padding:10px;border-radius:15px}
        .problem i{color:#ff6b6b}.solution i{color:#4facfe}.result i{color:#00c853}
        .coming-soon{text-align:center;padding:60px 20px;background:rgba(255,255,255,0.05);border-radius:30px}
        @media(max-width:600px){.categories-grid{grid-template-columns:1fr}}
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
window.deletePost = deletePost;