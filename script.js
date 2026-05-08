// ================= GLOBAL O'ZGARUVCHILAR =================
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
const ADMIN_EMAILS = ["ilmyolida@gmail.com"];
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();
const auth = firebase.auth();
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

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme('dark');
}

// ================= RENDER HOME PAGE =================
function renderHomePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    const t = window.translations ? window.translations[currentLang] : null;
    
    const categories = [
        { icon: "fa-heart", name: t ? t.selfEducation : "Өзүн-өзү тарбиялоо", color: "#4facfe", bg: "rgba(79,172,254,0.1)" },
        { icon: "fa-calendar-check", name: t ? t.habits : "Адаттар", color: "#00f2fe", bg: "rgba(0,242,254,0.1)" },
        { icon: "fa-chart-line", name: t ? t.business : "Бизнес жана Өсүш", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)" },
        { icon: "fa-mosque", name: t ? t.islamic : "Ислам жана Руханият", color: "#ffd93d", bg: "rgba(255,217,61,0.1)" }
    ];
    
    let html = `
        <div class="hero-section">
            <h1 data-lang="welcome">${t ? t.welcome : 'Safe Media ге кош келиңиз!'}</h1>
            <p data-lang="welcomeDesc">${t ? t.welcomeDesc : 'Жакшы адаттар, рухий өсүү жана заманбап технология'}</p>
        </div>
        <div class="categories-section">
            <h2 data-lang="categories">${t ? t.categories : 'Категориялар'}</h2>
            <div class="categories-grid">
    `;
    
    categories.forEach(cat => {
        html += `
            <div class="category-card" style="background: ${cat.bg}; border-left: 3px solid ${cat.color}">
                <i class="fas ${cat.icon}" style="color: ${cat.color}"></i>
                <h3>${cat.name}</h3>
                <button class="explore-btn" data-lang="explore" onclick="alert('${cat.name}')">${t ? t.explore : 'Изилдөө'}</button>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    // Habit Tracker Pro promo
    html += `
        <div class="promo-card" onclick="window.open('habittracer.html', '_blank')">
            <i class="fas fa-chart-line"></i>
            <div>
                <h3>${t ? t.habitTracker : 'Habit Tracker Pro'}</h3>
                <p>${t ? 'Адаттарыңызды көзөмөлдөңүз' : 'Track your daily habits'}</p>
            </div>
            <i class="fas fa-arrow-right"></i>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Update language on elements
    if (window.updateAllTexts) {
        window.updateAllTexts();
    }
}

// ================= RENDER SOLUTIONS PAGE =================
function renderSolutionsPage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    const t = window.translations ? window.translations[currentLang] : null;
    
    const solutions = [
        { problem: "G'azabni boshqara olmaslik", solution: "3 soniya qoidasi - chuqur nafas olish", result: "Xotirjamlik va sabrli bo'lish" },
        { problem: "Vaqtni bekorga sarflash", solution: "Kunlik 3 ta muhim vazifa belgilash", result: "Samaradorlik 70% ga oshadi" },
        { problem: "Namozni vaqtida o'qimaslik", solution: "Namoz vaqtlarida telefon signali qo'yish", result: "Vaqtida namoz o'qish odati" },
        { problem: "Internetga qaramlik", solution: "Kuniga 2 soat limit qo'yish", result: "Ko'proq vaqt va energiya" }
    ];
    
    let html = `
        <div class="solutions-header">
            <h1 data-lang="solutionsTitle">${t ? t.solutionsTitle : 'Чечимдер жана Натыйжалар'}</h1>
        </div>
        <div class="solutions-list">
    `;
    
    solutions.forEach(sol => {
        html += `
            <div class="solution-card">
                <div class="problem">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong data-lang="problem">${t ? t.problem : 'Көйгөй'}:</strong>
                        <p>${sol.problem}</p>
                    </div>
                </div>
                <div class="solution">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong data-lang="solution">${t ? t.solution : 'Чечим'}:</strong>
                        <p>${sol.solution}</p>
                    </div>
                </div>
                <div class="result">
                    <i class="fas fa-star"></i>
                    <div>
                        <strong data-lang="result">${t ? t.result : 'Натыйжа'}:</strong>
                        <p>${sol.result}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// ================= RENDER COMMUNITY PAGE =================
function renderCommunityPage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    const t = window.translations ? window.translations[currentLang] : null;
    
    container.innerHTML = `
        <div class="community-header">
            <h1 data-lang="communityTitle">${t ? t.communityTitle : 'Жамият жаңылыктары'}</h1>
        </div>
        <div class="community-posts">
            <div class="coming-soon">
                <i class="fas fa-users"></i>
                <h3 data-lang="comingSoon">${t ? t.comingSoon : 'Жакында...'}</h3>
                <p>Safe Media Community tez kunda!</p>
            </div>
        </div>
    `;
}

// ================= LOAD POSTS FROM FIREBASE =================
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    // Check if we need to show special pages
    if (currentPage === 'home') {
        renderHomePage();
        return;
    } else if (currentPage === 'solutions') {
        renderSolutionsPage();
        return;
    } else if (currentPage === 'community') {
        renderCommunityPage();
        return;
    } else if (currentPage === 'profile') {
        showProfilePage();
        return;
    }
    
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
    if (currentPage === 'home' || currentPage === 'solutions' || currentPage === 'community' || currentPage === 'profile') {
        loadPosts();
        return;
    }
    
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
            loadPosts();
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
    
    const title = document.getElementById('postTitle');
    const content = document.getElementById('postContent');
    const image = document.getElementById('postImage');
    if (title) title.value = '';
    if (content) content.value = '';
    if (image) image.value = '';
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
                        plusIcon.onclick = (e) => {
                            e.stopPropagation();
                            openAdminModal();
                        };
                        profileNav.appendChild(plusIcon);
                    }
                }
                
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

function showProfilePage() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    const t = window.translations ? window.translations[currentLang] : null;
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="post-card" style="text-align: center">
                <i class="fas fa-user-circle" style="font-size: 4rem; color: #4facfe"></i>
                <h3 data-lang="loginRequired">${t ? t.loginRequired : 'Кирүү керек'}</h3>
                <p data-lang="loginDesc">${t ? t.loginDesc : 'Постторду көрүү үчүн Google менен кириңиз'}</p>
                <button class="google-btn" onclick="openLoginModal()"><i class="fab fa-google"></i> ${t ? t.loginWithGoogle : 'Google менен кирүү'}</button>
            </div>
        `;
        return;
    }
    
    let adminButton = '';
    if (ADMIN_EMAILS.includes(currentUser.email)) {
        adminButton = `<button class="google-btn" onclick="openAdminModal()" style="background:#4facfe; margin-bottom:10px"><i class="fas fa-plus"></i> ${t ? t.addPost : 'Жаңы пост кошуу'}</button>`;
    }
    
    container.innerHTML = `
        <div class="post-card" style="text-align: center">
            <i class="fas fa-user-circle" style="font-size: 4rem; color: #4facfe"></i>
            <h3>${escapeHtml(currentUser.displayName || 'User')}</h3>
            <p>${escapeHtml(currentUser.email)}</p>
            ${adminButton}
            <button class="google-btn" onclick="logout()" style="background:#555"><i class="fas fa-sign-out-alt"></i> ${t ? t.logout : 'Чыгуу'}</button>
        </div>
    `;
}

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

// ================= ADD CUSTOM CSS =================
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .hero-section {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, rgba(79,172,254,0.1), rgba(0,242,254,0.1));
            border-radius: 30px;
            margin-bottom: 30px;
        }
        .hero-section h1 {
            font-size: 1.8rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #4facfe, #00f2fe);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .categories-section h2 {
            margin-bottom: 20px;
            font-size: 1.3rem;
        }
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .category-card {
            padding: 20px;
            border-radius: 20px;
            text-align: center;
        }
        .category-card i {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .category-card h3 {
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        .explore-btn {
            background: none;
            border: none;
            color: #4facfe;
            cursor: pointer;
            font-size: 0.8rem;
        }
        .promo-card {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            border-radius: 20px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: 0.3s;
        }
        .promo-card:hover {
            transform: scale(1.02);
        }
        .promo-card i:first-child {
            font-size: 2rem;
        }
        .promo-card div {
            flex: 1;
            margin-left: 15px;
        }
        .promo-card h3 {
            margin-bottom: 5px;
        }
        .promo-card p {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        .solutions-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .solution-card {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .problem, .solution, .result {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 15px;
        }
        .problem i { color: #ff6b6b; }
        .solution i { color: #4facfe; }
        .result i { color: #00c853; }
        .problem strong, .solution strong, .result strong {
            display: block;
            font-size: 0.8rem;
            margin-bottom: 5px;
        }
        .community-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .coming-soon {
            text-align: center;
            padding: 60px 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 30px;
        }
        .coming-soon i {
            font-size: 4rem;
            color: #4facfe;
            margin-bottom: 20px;
        }
        @media (max-width: 500px) {
            .categories-grid {
                grid-template-columns: 1fr;
            }
            .hero-section h1 {
                font-size: 1.3rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// ================= INITIALIZATION =================
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