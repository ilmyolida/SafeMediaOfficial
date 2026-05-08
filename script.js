// ================= GLOBAL =================
let currentUser = null;
let currentPage = 'home';
let allPosts = [];
let currentEditPostId = null;
let currentCommentPostId = null;

// ================= DOM ELEMENTLAR =================
const postsContainer = document.getElementById('postsContainer');
const langSelect = document.getElementById('langSelect');
const searchInput = document.getElementById('searchInput');

// ================= FIREBASE REFS =================
const usersRef = db.collection('users'); // foydalanuvchi profillari uchun

// ================= TILLAR (to‘liq) =================
const translations = {
    ky: {
        home: "Башкы", info: "Маалымат", community: "Жамият", profile: "Профиль",
        delete: "Өчүрүү", edit: "Таҳрирлаш", like: "Лайк", save: "Сактоо", comment: "Изоҳ",
        noPosts: "Посттор жок", loginRequired: "Кирүү керек", loginDesc: "Google менен кириңиз",
        loginWithGoogle: "Google менен кирүү", logout: "Чыгуу", addPost: "Пост кошуу",
        settings: "Орнотуулар", clearCache: "Кешни тазалоо", exportData: "Маалыматтарды жүктөө",
        editProfile: "Профилди оңдоо", saves: "Сакталган", likes: "Лайк басылган",
        businessTools: "Бизнес куралдары", goals: "Мақсаттар", calculator: "Калькулятор",
        projects: "Долбоорлор"
    },
    en: {
        home: "Home", info: "Info", community: "Community", profile: "Profile",
        delete: "Delete", edit: "Edit", like: "Like", save: "Save", comment: "Comment",
        noPosts: "No posts", loginRequired: "Login required", loginDesc: "Login with Google",
        loginWithGoogle: "Login with Google", logout: "Logout", addPost: "Add post",
        settings: "Settings", clearCache: "Clear cache", exportData: "Export data",
        editProfile: "Edit profile", saves: "Saved", likes: "Liked",
        businessTools: "Business tools", goals: "Goals", calculator: "Calculator",
        projects: "Projects"
    },
    ru: {
        home: "Главная", info: "Инфо", community: "Сообщество", profile: "Профиль",
        delete: "Удалить", edit: "Редактировать", like: "Нравится", save: "Сохранить", comment: "Комментарий",
        noPosts: "Нет постов", loginRequired: "Требуется вход", loginDesc: "Войдите через Google",
        loginWithGoogle: "Войти через Google", logout: "Выйти", addPost: "Добавить пост",
        settings: "Настройки", clearCache: "Очистить кэш", exportData: "Экспорт данных",
        editProfile: "Редактировать профиль", saves: "Сохранённые", likes: "Понравившиеся",
        businessTools: "Бизнес-инструменты", goals: "Цели", calculator: "Калькулятор",
        projects: "Проекты"
    },
    tr: {
        home: "Ana Sayfa", info: "Bilgi", community: "Topluluk", profile: "Profil",
        delete: "Sil", edit: "Düzenle", like: "Beğen", save: "Kaydet", comment: "Yorum",
        noPosts: "Gönderi yok", loginRequired: "Giriş gerekli", loginDesc: "Google ile giriş yapın",
        loginWithGoogle: "Google ile giriş", logout: "Çıkış", addPost: "Gönderi ekle",
        settings: "Ayarlar", clearCache: "Önbelleği temizle", exportData: "Verileri dışa aktar",
        editProfile: "Profili düzenle", saves: "Kaydedilenler", likes: "Beğenilenler",
        businessTools: "İş araçları", goals: "Hedefler", calculator: "Hesap makinesi",
        projects: "Projeler"
    },
    ar: {
        home: "الرئيسية", info: "معلومات", community: "المجتمع", profile: "الملف الشخصي",
        delete: "حذف", edit: "تعديل", like: "إعجاب", save: "حفظ", comment: "تعليق",
        noPosts: "لا توجد منشورات", loginRequired: "تسجيل الدخول مطلوب", loginDesc: "تسجيل الدخول مع Google",
        loginWithGoogle: "تسجيل الدخول مع Google", logout: "تسجيل الخروج", addPost: "إضافة منشور",
        settings: "الإعدادات", clearCache: "مسح ذاكرة التخزين المؤقت", exportData: "تصدير البيانات",
        editProfile: "تعديل الملف الشخصي", saves: "المحفوظات", likes: "الإعجابات",
        businessTools: "أدوات الأعمال", goals: "الأهداف", calculator: "آلة حاسبة",
        projects: "المشاريع"
    }
};
let currentLang = localStorage.getItem('lang') || 'ky';
function changeLanguage(lang) { currentLang = lang; localStorage.setItem('lang', lang); langSelect.value = lang; updateUITexts(); loadPosts(); }
function updateUITexts() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        let key = el.getAttribute('data-lang-key');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
}
langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));

// ================= THEME =================
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-mode', 'reading-mode');
    if (theme === 'light') document.body.classList.add('light-mode');
    if (theme === 'reading') document.body.classList.add('reading-mode');
}
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// ================= SIDE MENU =================
function toggleSideMenu() {
    document.getElementById('sideDrawer').classList.toggle('open');
}

// ================= POSTLARNI YUKLASH =================
async function loadPosts() {
    postsContainer.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
        allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterAndRender();
    } catch (e) {
        postsContainer.innerHTML = '<div class="post-card">❌ Маалымат жүктөлүүдө ката</div>';
    }
}

function filterAndRender() {
    let filtered = allPosts;
    if (currentPage !== 'profile') filtered = allPosts.filter(p => p.category === currentPage);
    renderPosts(filtered);
}

function renderPosts(posts) {
    if (!posts.length) {
        postsContainer.innerHTML = `<div class="post-card" style="text-align:center">📭 ${translations[currentLang].noPosts}</div>`;
        return;
    }
    let html = '';
    posts.forEach(post => {
        const isLiked = currentUser && post.likes && post.likes.includes(currentUser.uid);
        const isSaved = currentUser && post.saves && post.saves.includes(currentUser.uid);
        const canEdit = currentUser && (currentUser.uid === post.userId || (ADMIN_EMAILS && ADMIN_EMAILS.includes(currentUser.email)));
        html += `
            <div class="post-card" data-id="${post.id}">
                <div class="post-header">
                    <h3>${escapeHtml(post.title)}</h3>
                    <span class="category-badge">${post.category}</span>
                </div>
                <div class="post-content"><p>${escapeHtml(post.content)}</p></div>
                <div class="post-meta">
                    <span>👤 ${escapeHtml(post.userName || 'Admin')}</span>
                    <span>📅 ${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Янги'}</span>
                </div>
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                        <i class="fas fa-heart"></i> <span id="likeCount-${post.id}">${post.likes?.length || 0}</span> ${translations[currentLang].like}
                    </button>
                    <button class="action-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')">
                        <i class="fas fa-bookmark"></i> <span id="saveCount-${post.id}">${post.saves?.length || 0}</span> ${translations[currentLang].save}
                    </button>
                    <button class="action-btn" onclick="openCommentModal('${post.id}')">
                        <i class="fas fa-comment"></i> <span id="commentCount-${post.id}">${post.comments?.length || 0}</span> ${translations[currentLang].comment}
                    </button>
                    ${canEdit ? `<button class="action-btn" onclick="openEditModal('${post.id}')"><i class="fas fa-edit"></i> ${translations[currentLang].edit}</button>` : ''}
                </div>
            </div>
        `;
    });
    postsContainer.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// ================= LIKE, SAVE, COMMENT (HAMMA FOYDALANUVCHILAR UCHUN) =================
async function toggleLike(postId) {
    if (!currentUser) { openLoginModal(); return; }
    const postRef = db.collection('posts').doc(postId);
    const post = allPosts.find(p => p.id === postId);
    const liked = post.likes?.includes(currentUser.uid);
    if (liked) {
        await postRef.update({ likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        await postRef.update({ likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
    await loadPosts();
}

async function toggleSave(postId) {
    if (!currentUser) { openLoginModal(); return; }
    const postRef = db.collection('posts').doc(postId);
    const post = allPosts.find(p => p.id === postId);
    const saved = post.saves?.includes(currentUser.uid);
    if (saved) {
        await postRef.update({ saves: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        await postRef.update({ saves: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
    await loadPosts();
}

async function addComment() {
    if (!currentUser) { openLoginModal(); return; }
    const text = document.getElementById('newComment').value.trim();
    if (!text || !currentCommentPostId) return;
    const comment = {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        text: text,
        timestamp: new Date().toISOString()
    };
    const postRef = db.collection('posts').doc(currentCommentPostId);
    await postRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
    document.getElementById('newComment').value = '';
    closeCommentModal();
    loadPosts();
}

// ================= PROFIL SURATI VA ISM-FAMILYA =================
async function updateProfileName() {
    if (!currentUser) return;
    const newName = document.getElementById('editDisplayName').value.trim();
    if (newName && newName !== currentUser.displayName) {
        // Firebase Authentication da ismni o‘zgartirish (foydalanuvchi profili)
        await currentUser.updateProfile({ displayName: newName });
        // Firestore da saqlash
        await usersRef.doc(currentUser.uid).set({ displayName: newName }, { merge: true });
        currentUser.displayName = newName;
        alert('Исмиңиз оңдолду!');
        showProfilePage(); // yangilash
    }
}

async function updateProfilePhoto() {
    if (!currentUser) return;
    const file = document.getElementById('profilePhotoInput').files[0];
    if (!file) return;
    // Firebase Storage ga yuklash (agar storage yoqilgan bo‘lsa)
    // Oddiy holda URL ni o‘zgartirish uchun avatar URL si saqlanadi.
    // Hozircha faqat localStorage da saqlaymiz (yoki Firestore da)
    const reader = new FileReader();
    reader.onload = async function(e) {
        const photoURL = e.target.result;
        await currentUser.updateProfile({ photoURL });
        await usersRef.doc(currentUser.uid).set({ photoURL }, { merge: true });
        alert('Сүрөт оңдолду!');
        showProfilePage();
    };
    reader.readAsDataURL(file);
}

// ================= PROFIL SAHIFASI (like, save, sozlamalar) =================
async function showProfilePage() {
    if (!currentUser) {
        postsContainer.innerHTML = `
            <div class="post-card" style="text-align:center">
                <i class="fas fa-user-circle" style="font-size:4rem"></i>
                <h3>${translations[currentLang].loginRequired}</h3>
                <p>${translations[currentLang].loginDesc}</p>
                <button class="btn-gradient" onclick="openLoginModal()"><i class="fab fa-google"></i> ${translations[currentLang].loginWithGoogle}</button>
            </div>
        `;
        return;
    }

    // Foydalanuvchi ma'lumotlarini yangilash (Firestore'dan)
    const userDoc = await usersRef.doc(currentUser.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const displayName = userData.displayName || currentUser.displayName;
    const photoURL = userData.photoURL || currentUser.photoURL || 'https://via.placeholder.com/80';

    // Like va save postlar
    const likedPosts = allPosts.filter(p => p.likes?.includes(currentUser.uid));
    const savedPosts = allPosts.filter(p => p.saves?.includes(currentUser.uid));

    let html = `
        <div class="post-card" style="text-align:center">
            <img src="${photoURL}" alt="avatar" class="profile-avatar" id="profileAvatar">
            <h3 id="profileName">${escapeHtml(displayName)}</h3>
            <p>${escapeHtml(currentUser.email)}</p>
            <div class="profile-name-edit">
                <input type="text" id="editDisplayName" value="${escapeHtml(displayName)}" placeholder="Толук аты-жөнүңүз">
                <button onclick="updateProfileName()"><i class="fas fa-save"></i> ${translations[currentLang].editProfile}</button>
            </div>
            <div style="margin-top: 10px;">
                <input type="file" id="profilePhotoInput" accept="image/*" style="display:none">
                <button class="btn-gradient" onclick="document.getElementById('profilePhotoInput').click()" style="background:#555; width:auto; display:inline-block; padding:8px 16px">
                    <i class="fas fa-camera"></i> Сүрөт жүктөө
                </button>
                <button class="btn-gradient" onclick="openAdminModal()" style="margin:10px 0; width:100%">➕ ${translations[currentLang].addPost}</button>
                <button class="btn-gradient" onclick="logout()" style="background:#555; width:100%">🚪 ${translations[currentLang].logout}</button>
            </div>
            <div style="margin-top:20px">
                <button class="btn-gradient" onclick="showBusinessTools()" style="background: linear-gradient(135deg, #f39c12, #e67e22); margin-bottom:10px">
                    <i class="fas fa-chart-line"></i> ${translations[currentLang].businessTools}
                </button>
            </div>
            <div class="profile-liked-section">
                <h4><i class="fas fa-heart"></i> ${translations[currentLang].likes} (${likedPosts.length})</h4>
                ${renderMiniPosts(likedPosts)}
            </div>
            <div class="profile-saved-section">
                <h4><i class="fas fa-bookmark"></i> ${translations[currentLang].saves} (${savedPosts.length})</h4>
                ${renderMiniPosts(savedPosts)}
            </div>
            <div style="margin-top:20px; padding:15px; background:rgba(79,172,254,0.1); border-radius:20px">
                <h4>⚙️ ${translations[currentLang].settings}</h4>
                <button onclick="localStorage.clear(); alert('Кеш тазаланди'); location.reload();" style="background:#ff6b6b; border:none; padding:8px 15px; border-radius:20px; margin:5px"><i class="fas fa-trash"></i> ${translations[currentLang].clearCache}</button>
                <button onclick="exportUserData()" style="background:#4facfe; border:none; padding:8px 15px; border-radius:20px; margin:5px"><i class="fas fa-database"></i> ${translations[currentLang].exportData}</button>
            </div>
        </div>
    `;
    postsContainer.innerHTML = html;
    document.getElementById('profilePhotoInput').addEventListener('change', updateProfilePhoto);
}

function renderMiniPosts(posts) {
    if (!posts.length) return '<p>📭 Көрсөтүү жок</p>';
    let html = '<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px">';
    posts.forEach(p => {
        html += `
            <div class="post-mini" style="background:rgba(0,0,0,0.2); padding:12px; border-radius:18px">
                <strong>${escapeHtml(p.title)}</strong>
                <p style="font-size:0.8rem; margin-top:5px">${escapeHtml(p.content.substring(0,80))}...</p>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function exportUserData() {
    const data = {
        user: { email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL },
        likedPosts: allPosts.filter(p => p.likes?.includes(currentUser.uid)),
        savedPosts: allPosts.filter(p => p.saves?.includes(currentUser.uid))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `safe_media_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ================= BIZNES VA RIVOJLANISH FUNKSIYALARI =================
function showBusinessTools() {
    const t = translations[currentLang];
    let html = `
        <h3><i class="fas fa-chart-line"></i> ${t.businessTools}</h3>
        <button class="btn-gradient" onclick="showGoals()" style="margin-bottom:10px"><i class="fas fa-bullseye"></i> ${t.goals}</button>
        <button class="btn-gradient" onclick="showCalculator()" style="margin-bottom:10px"><i class="fas fa-calculator"></i> ${t.calculator}</button>
        <button class="btn-gradient" onclick="showProjects()"><i class="fas fa-project-diagram"></i> ${t.projects}</button>
    `;
    showModal(html, t.businessTools);
}

function showGoals() {
    let goals = JSON.parse(localStorage.getItem('businessGoals') || '[]');
    let html = `<div><input id="newGoal" class="input-glass" placeholder="Янги мақсад"><button class="btn-gradient" onclick="addGoal()">Қўшиш</button><ul id="goalsList">`;
    goals.forEach((g, i) => {
        html += `<li style="margin:8px 0">✅ ${g} <button onclick="removeGoal(${i})">Өчүрүү</button></li>`;
    });
    html += `</ul></div>`;
    showModal(html, "Мақсадлар");
}
window.addGoal = function() {
    let input = document.getElementById('newGoal');
    if (input.value) {
        let goals = JSON.parse(localStorage.getItem('businessGoals') || '[]');
        goals.push(input.value);
        localStorage.setItem('businessGoals', JSON.stringify(goals));
        showGoals();
    }
};
window.removeGoal = function(i) {
    let goals = JSON.parse(localStorage.getItem('businessGoals') || '[]');
    goals.splice(i, 1);
    localStorage.setItem('businessGoals', JSON.stringify(goals));
    showGoals();
};

function showCalculator() {
    let html = `
        <div>
            <input id="income" class="input-glass" placeholder="Кирим (сом)">
            <input id="expense" class="input-glass" placeholder="Чыгым (сом)">
            <button class="btn-gradient" onclick="calculateProfit()">Ҳисоблаш</button>
            <p id="calcResult" style="margin-top:15px"></p>
        </div>
    `;
    showModal(html, "Калькулятор");
}
window.calculateProfit = function() {
    let income = parseFloat(document.getElementById('income').value) || 0;
    let expense = parseFloat(document.getElementById('expense').value) || 0;
    let profit = income - expense;
    document.getElementById('calcResult').innerHTML = `💰 Соф фойда: ${profit} сом`;
};

function showProjects() {
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    let html = `<div><input id="newProject" class="input-glass" placeholder="Лойиҳа номи"><button class="btn-gradient" onclick="addProject()">Қўшиш</button><ul id="projectsList">`;
    projects.forEach((p, i) => {
        html += `<li style="margin:8px 0">📌 ${p} <button onclick="removeProject(${i})">Өчүрүү</button></li>`;
    });
    html += `</ul></div>`;
    showModal(html, "Лойиҳалар");
}
window.addProject = function() {
    let input = document.getElementById('newProject');
    if (input.value) {
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects.push(input.value);
        localStorage.setItem('projects', JSON.stringify(projects));
        showProjects();
    }
};
window.removeProject = function(i) {
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects.splice(i, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    showProjects();
};

// ================= MODAL FUNKSIYALAR =================
function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function openAdminModal() {
    if (!currentUser) { openLoginModal(); return; }
    if (!ADMIN_EMAILS || !ADMIN_EMAILS.includes(currentUser.email)) { alert("Администратор эмессиз!"); return; }
    document.getElementById('adminModal').style.display = 'flex';
}
function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}
async function addNewPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value;
    if (!title || !content) { alert("Сарлавҳа ва мазмунни тўлдиринг!"); return; }
    await db.collection('posts').add({
        title, content, category,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likes: [], saves: [], comments: []
    });
    closeAdminModal();
    loadPosts();
}
function openEditModal(postId) {
    currentEditPostId = postId;
    const post = allPosts.find(p => p.id === postId);
    document.getElementById('editTitle').value = post.title;
    document.getElementById('editContent').value = post.content;
    document.getElementById('editCategory').value = post.category;
    document.getElementById('editModal').style.display = 'flex';
}
function closeEditModal() { document.getElementById('editModal').style.display = 'none'; currentEditPostId = null; }
async function saveEdit() {
    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    const category = document.getElementById('editCategory').value;
    if (!title || !content) return;
    await db.collection('posts').doc(currentEditPostId).update({ title, content, category });
    closeEditModal();
    loadPosts();
}
function openCommentModal(postId) {
    currentCommentPostId = postId;
    const post = allPosts.find(p => p.id === postId);
    let commentsHtml = '';
    if (post.comments?.length) {
        post.comments.forEach(c => {
            commentsHtml += `<div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1)"><strong>${escapeHtml(c.userName)}</strong><p style="margin-top:4px">${escapeHtml(c.text)}</p><small>${new Date(c.timestamp).toLocaleString()}</small></div>`;
        });
    } else {
        commentsHtml = '<p>Изоҳ жок</p>';
    }
    document.getElementById('commentsList').innerHTML = commentsHtml;
    document.getElementById('commentModal').style.display = 'flex';
}
function closeCommentModal() { document.getElementById('commentModal').style.display = 'none'; currentCommentPostId = null; }

// ================= SEARCH =================
function searchPosts() {
    const term = searchInput.value.toLowerCase();
    if (!term) { filterAndRender(); return; }
    const filtered = allPosts.filter(p => p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term));
    renderPosts(filtered);
}

// ================= BOTTOM NAVIGATION =================
function setupBottomNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            currentPage = item.getAttribute('data-page');
            if (currentPage === 'profile') showProfilePage();
            else filterAndRender();
        });
    });
}

// ================= AUTH =================
function setupAuth() {
    document.getElementById('googleLoginBtn').onclick = async () => {
        try {
            const result = await auth.signInWithPopup(provider);
            currentUser = result.user;
            // Foydalanuvchi ma'lumotlarini Firestore'ga saqlash
            await usersRef.doc(currentUser.uid).set({
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL
            }, { merge: true });
            closeLoginModal();
            loadPosts();
        } catch (e) {
            alert("Кирүү мүмкүн болбой калды");
        }
    };
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (currentPage === 'profile') showProfilePage();
        else loadPosts();
    });
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        location.reload();
    });
}

// ================= QO‘SHIMCHA FUNKSIYALAR (Tasbeh, Goal, Todo, Motivatsiya, Statistika) =================
function showTasbeeh() {
    let c = 0;
    let html = `<div style="text-align:center"><div id="tasbCount" style="font-size:3rem">0</div><button class="btn-gradient" onclick="document.getElementById('tasbCount').innerText = ++window.tc || 1">+1</button><button onclick="document.getElementById('tasbCount').innerText = 0">Reset</button></div>`;
    showModal(html, "Тасбеҳ");
}
function showDailyGoal() {
    let goal = localStorage.getItem('dailyGoal') || '';
    let html = `<textarea id="goalInput" class="input-glass">${goal}</textarea><button class="btn-gradient" onclick="localStorage.setItem('dailyGoal', document.getElementById('goalInput').value); alert('Сақланди'); closeModal()">Сақлаш</button>`;
    showModal(html, "Кунлик мақсад");
}
function showTodoList() {
    let tasks = JSON.parse(localStorage.getItem('todoTasks') || '["Намоз","Қуръон","Спорт"]');
    let html = `<ul id="todoList">` + tasks.map((t, i) => `<li>✅ ${t} <button onclick="removeTodo(${i})">Өчүрүү</button></li>`).join('') + `</ul><input id="newTodo" class="input-glass" placeholder="Янги"><button class="btn-gradient" onclick="addTodo()">Қўшиш</button>`;
    showModal(html, "Вазифалар");
}
function removeTodo(i) {
    let tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');
    tasks.splice(i, 1);
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    showTodoList();
}
function addTodo() {
    let inp = document.getElementById('newTodo');
    if (inp.value) {
        let tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');
        tasks.push(inp.value);
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        showTodoList();
    }
}
function showMotivation() {
    const q = ["Яхши одат - энг яхши сармоя", "Сабр - имоннинг ярми", "Илм - энг катта бойлик"];
    showModal(`<div style="text-align:center"><i class="fas fa-quote-right"></i><p>"${q[Math.floor(Math.random() * q.length)]}"</p></div>`, "Мотивация");
}
function showStatistics() {
    const totalLikes = allPosts.reduce((a, b) => a + (b.likes?.length || 0), 0);
    const totalSaves = allPosts.reduce((a, b) => a + (b.saves?.length || 0), 0);
    const totalComments = allPosts.reduce((a, b) => a + (b.comments?.length || 0), 0);
    showModal(`<div>Постлар: ${allPosts.length}<br>Жами лайк: ${totalLikes}<br>Жами сақланган: ${totalSaves}<br>Жами изоҳлар: ${totalComments}</div>`, "Статистика");
}
function showModal(html, title) {
    let m = document.getElementById('customModal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'customModal';
        m.className = 'modal';
        m.innerHTML = `<div class="modal-content glass"><span class="close-modal" onclick="this.parentElement.parentElement.style.display='none'">&times;</span><div id="modalBody"></div></div>`;
        document.body.appendChild(m);
    }
    document.getElementById('modalBody').innerHTML = `<h3>${title}</h3>${html}`;
    m.style.display = 'flex';
}
window.closeModal = function() {
    let m = document.getElementById('customModal');
    if (m) m.style.display = 'none';
};

// ================= INIT =================
document.getElementById('submitPostBtn').onclick = addNewPost;
document.getElementById('saveEditBtn').onclick = saveEdit;
document.getElementById('addCommentBtn').onclick = addComment;
setupBottomNav();
setupAuth();
updateUITexts();