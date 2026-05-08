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

// ================= TILLAR =================
const translations = {
    ky: { home: "Башкы", info: "Маалымат", community: "Жамият", profile: "Профиль", delete: "Өчүрүү", edit: "Таҳрирлаш", like: "Лайк", save: "Сактоо", comment: "Изоҳ", noPosts: "Посттор жок", loginRequired: "Кирүү керек", loginDesc: "Google менен кириңиз", loginWithGoogle: "Google менен кирүү", logout: "Чыгуу", addPost: "Пост кошуу", settings: "Орнотуулар", clearCache: "Кешни тазалоо", exportData: "Маалыматтарды жүктөө" },
    en: { home: "Home", info: "Info", community: "Community", profile: "Profile", delete: "Delete", edit: "Edit", like: "Like", save: "Save", comment: "Comment", noPosts: "No posts", loginRequired: "Login required", loginDesc: "Login with Google", loginWithGoogle: "Login with Google", logout: "Logout", addPost: "Add post", settings: "Settings", clearCache: "Clear cache", exportData: "Export data" },
    ru: { home: "Главная", info: "Инфо", community: "Сообщество", profile: "Профиль", delete: "Удалить", edit: "Редактировать", like: "Нравится", save: "Сохранить", comment: "Комментарий", noPosts: "Нет постов", loginRequired: "Требуется вход", loginDesc: "Войдите через Google", loginWithGoogle: "Войти через Google", logout: "Выйти", addPost: "Добавить пост", settings: "Настройки", clearCache: "Очистить кэш", exportData: "Экспорт данных" },
    tr: { home: "Ana Sayfa", info: "Bilgi", community: "Topluluk", profile: "Profil", delete: "Sil", edit: "Düzenle", like: "Beğen", save: "Kaydet", comment: "Yorum", noPosts: "Gönderi yok", loginRequired: "Giriş gerekli", loginDesc: "Google ile giriş yapın", loginWithGoogle: "Google ile giriş", logout: "Çıkış", addPost: "Gönderi ekle", settings: "Ayarlar", clearCache: "Önbelleği temizle", exportData: "Verileri dışa aktar" },
    ar: { home: "الرئيسية", info: "معلومات", community: "المجتمع", profile: "الملف الشخصي", delete: "حذف", edit: "تعديل", like: "إعجاب", save: "حفظ", comment: "تعليق", noPosts: "لا توجد منشورات", loginRequired: "تسجيل الدخول مطلوب", loginDesc: "تسجيل الدخول مع Google", loginWithGoogle: "تسجيل الدخول مع Google", logout: "تسجيل الخروج", addPost: "إضافة منشور", settings: "الإعدادات", clearCache: "مسح ذاكرة التخزين المؤقت", exportData: "تصدير البيانات" }
};
let currentLang = localStorage.getItem('lang') || 'ky';
function changeLanguage(lang) { currentLang = lang; localStorage.setItem('lang', lang); langSelect.value = lang; updateUITexts(); loadPosts(); }
function updateUITexts() { document.querySelectorAll('[data-lang-key]').forEach(el => { let key = el.getAttribute('data-lang-key'); if(translations[currentLang][key]) el.innerText = translations[currentLang][key]; }); }
langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));

// ================= THEME =================
function setTheme(theme) { localStorage.setItem('theme', theme); document.body.classList.remove('light-mode','reading-mode'); if(theme==='light') document.body.classList.add('light-mode'); if(theme==='reading') document.body.classList.add('reading-mode'); }
const savedTheme = localStorage.getItem('theme') || 'dark'; setTheme(savedTheme);

// ================= SIDE MENU =================
function toggleSideMenu() { document.getElementById('sideDrawer').classList.toggle('open'); }

// ================= POSTLARNI KATEGORIYA BO‘YICHA YUKLASH =================
async function loadPosts() {
    postsContainer.innerHTML = '<div class="loading-spinner"></div>';
    try {
        let q = db.collection('posts').orderBy('timestamp', 'desc');
        const snapshot = await q.get();
        allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterAndRender();
    } catch(e) { postsContainer.innerHTML = '<div class="post-card">❌ Маалымат жүктөлүүдө ката</div>'; }
}
function filterAndRender() {
    let filtered = allPosts;
    if (currentPage !== 'profile') filtered = allPosts.filter(p => p.category === currentPage);
    renderPosts(filtered);
}
function renderPosts(posts) {
    if (!posts.length) { postsContainer.innerHTML = `<div class="post-card" style="text-align:center">📭 ${translations[currentLang].noPosts}</div>`; return; }
    let html = '';
    posts.forEach(post => {
        const isLiked = currentUser && post.likes && post.likes.includes(currentUser.uid);
        const isSaved = currentUser && post.saves && post.saves.includes(currentUser.uid);
        const canEdit = currentUser && (currentUser.uid === post.userId || ADMIN_EMAILS.includes(currentUser.email));
        html += `
            <div class="post-card" data-id="${post.id}">
                <div class="post-header"><h3>${escapeHtml(post.title)}</h3><span class="category-badge">${post.category}</span></div>
                <div class="post-content"><p>${escapeHtml(post.content)}</p></div>
                <div class="post-meta"><span>👤 ${escapeHtml(post.userName || 'Admin')}</span><span>📅 ${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Янги'}</span></div>
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')"><i class="fas fa-heart"></i> <span id="likeCount-${post.id}">${post.likes?.length || 0}</span> ${translations[currentLang].like}</button>
                    <button class="action-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}')"><i class="fas fa-bookmark"></i> <span id="saveCount-${post.id}">${post.saves?.length || 0}</span> ${translations[currentLang].save}</button>
                    <button class="action-btn" onclick="openCommentModal('${post.id}')"><i class="fas fa-comment"></i> <span id="commentCount-${post.id}">${post.comments?.length || 0}</span> ${translations[currentLang].comment}</button>
                    ${canEdit ? `<button class="action-btn" onclick="openEditModal('${post.id}')"><i class="fas fa-edit"></i> ${translations[currentLang].edit}</button>` : ''}
                </div>
            </div>
        `;
    });
    postsContainer.innerHTML = html;
}
function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }

// ================= LIKE, SAVE, COMMENT =================
async function toggleLike(postId) {
    if (!currentUser) { openLoginModal(); return; }
    const postRef = db.collection('posts').doc(postId);
    const post = allPosts.find(p => p.id === postId);
    const liked = post.likes?.includes(currentUser.uid);
    if (liked) await postRef.update({ likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    else await postRef.update({ likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    await loadPosts();
}
async function toggleSave(postId) {
    if (!currentUser) { openLoginModal(); return; }
    const postRef = db.collection('posts').doc(postId);
    const post = allPosts.find(p => p.id === postId);
    const saved = post.saves?.includes(currentUser.uid);
    if (saved) await postRef.update({ saves: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    else await postRef.update({ saves: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    await loadPosts();
}
async function addComment() {
    const text = document.getElementById('newComment').value.trim();
    if (!text || !currentCommentPostId) return;
    const comment = { userId: currentUser.uid, userName: currentUser.displayName, text: text, timestamp: new Date().toISOString() };
    const postRef = db.collection('posts').doc(currentCommentPostId);
    await postRef.update({ comments: firebase.firestore.FieldValue.arrayUnion(comment) });
    document.getElementById('newComment').value = '';
    closeCommentModal();
    loadPosts();
}

// ================= MODAL FUNKSIYALAR =================
function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function openAdminModal() { if(!currentUser) { openLoginModal(); return; } if(!ADMIN_EMAILS.includes(currentUser.email)) { alert("Администратор эмессиз!"); return; } document.getElementById('adminModal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('adminModal').style.display = 'none'; document.getElementById('postTitle').value = ''; document.getElementById('postContent').value = ''; }
async function addNewPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value;
    if(!title || !content) { alert("Сарлавҳа ва мазмунни тўлдиринг!"); return; }
    await db.collection('posts').add({ title, content, category, userId: currentUser.uid, userName: currentUser.displayName, timestamp: firebase.firestore.FieldValue.serverTimestamp(), likes: [], saves: [], comments: [] });
    closeAdminModal();
    loadPosts();
}
function openEditModal(postId) { currentEditPostId = postId; const post = allPosts.find(p => p.id === postId); document.getElementById('editTitle').value = post.title; document.getElementById('editContent').value = post.content; document.getElementById('editCategory').value = post.category; document.getElementById('editModal').style.display = 'flex'; }
function closeEditModal() { document.getElementById('editModal').style.display = 'none'; currentEditPostId = null; }
async function saveEdit() {
    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    const category = document.getElementById('editCategory').value;
    if(!title || !content) return;
    await db.collection('posts').doc(currentEditPostId).update({ title, content, category });
    closeEditModal();
    loadPosts();
}
function openCommentModal(postId) { currentCommentPostId = postId; const post = allPosts.find(p => p.id === postId); let commentsHtml = ''; if(post.comments?.length) post.comments.forEach(c => { commentsHtml += `<div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.1)"><strong>${escapeHtml(c.userName)}</strong><p style="margin-top:4px">${escapeHtml(c.text)}</p><small>${new Date(c.timestamp).toLocaleString()}</small></div>`; }); else commentsHtml = '<p>Изоҳ жок</p>'; document.getElementById('commentsList').innerHTML = commentsHtml; document.getElementById('commentModal').style.display = 'flex'; }
function closeCommentModal() { document.getElementById('commentModal').style.display = 'none'; currentCommentPostId = null; }

// ================= PROFIL SAHIFASI (liked & saved posts) =================
async function showProfilePage() {
    if(!currentUser) { postsContainer.innerHTML = `<div class="post-card" style="text-align:center"><i class="fas fa-user-circle" style="font-size:4rem"></i><h3>${translations[currentLang].loginRequired}</h3><p>${translations[currentLang].loginDesc}</p><button class="btn-gradient" onclick="openLoginModal()"><i class="fab fa-google"></i> ${translations[currentLang].loginWithGoogle}</button></div>`; return; }
    const likedPosts = allPosts.filter(p => p.likes?.includes(currentUser.uid));
    const savedPosts = allPosts.filter(p => p.saves?.includes(currentUser.uid));
    let html = `<div class="post-card" style="text-align:center"><i class="fas fa-user-circle" style="font-size:4rem"></i><h3>${escapeHtml(currentUser.displayName)}</h3><p>${escapeHtml(currentUser.email)}</p><button class="btn-gradient" onclick="openAdminModal()" style="margin-bottom:10px">➕ ${translations[currentLang].addPost}</button><button class="btn-gradient" onclick="logout()" style="background:#555">🚪 ${translations[currentLang].logout}</button><div style="margin-top:20px"><h4>❤️ Like қилинган постлар (${likedPosts.length})</h4>` + renderPostList(likedPosts) + `<h4>📌 Сақланган постлар (${savedPosts.length})</h4>` + renderPostList(savedPosts) + `</div><div style="margin-top:20px; padding:15px; background:rgba(79,172,254,0.1); border-radius:20px"><h4>⚙️ ${translations[currentLang].settings}</h4><button onclick="localStorage.clear(); alert('Кеш тазаланди'); location.reload();" style="background:#ff6b6b; border:none; padding:8px 15px; border-radius:20px; margin:5px"><i class="fas fa-trash"></i> ${translations[currentLang].clearCache}</button><button onclick="exportUserData()" style="background:#4facfe; border:none; padding:8px 15px; border-radius:20px; margin:5px"><i class="fas fa-database"></i> ${translations[currentLang].exportData}</button></div></div>`;
    postsContainer.innerHTML = html;
}
function renderPostList(posts) { if(!posts.length) return '<p>📭 Көрсөтүү жок</p>'; let html = '<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px">'; posts.forEach(p => { html += `<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:16px"><strong>${escapeHtml(p.title)}</strong><p style="font-size:0.8rem">${escapeHtml(p.content.substring(0,100))}...</p></div>`; }); html += '</div>'; return html; }
function exportUserData() { const data = { user: currentUser, likedPosts: allPosts.filter(p => p.likes?.includes(currentUser.uid)), savedPosts: allPosts.filter(p => p.saves?.includes(currentUser.uid)) }; const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `safe_media_data_${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href); }
function logout() { auth.signOut().then(() => { currentUser = null; location.reload(); }); }

// ================= SEARCH =================
function searchPosts() {
    const term = searchInput.value.toLowerCase();
    if(!term) { filterAndRender(); return; }
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
            if(currentPage === 'profile') showProfilePage();
            else filterAndRender();
        });
    });
}

// ================= AUTH =================
function setupAuth() {
    document.getElementById('googleLoginBtn').onclick = async () => { try { await auth.signInWithPopup(provider); closeLoginModal(); loadPosts(); } catch(e) { alert("Кирүү мүмкүн болбой калды"); } };
    auth.onAuthStateChanged(user => { currentUser = user; if(currentPage === 'profile') showProfilePage(); else loadPosts(); });
}

// ================= TASBEH, GOAL, TODO (oddiy qo‘shimcha) =================
function showTasbeeh() { let c=0; let html=`<div style="text-align:center"><div id="tasbCount" style="font-size:3rem">0</div><button class="btn-gradient" onclick="document.getElementById('tasbCount').innerText=++window.tc||1">+1</button><button onclick="document.getElementById('tasbCount').innerText=0">Reset</button></div>`; showModal(html, "Тасбеҳ"); }
function showDailyGoal() { let goal=localStorage.getItem('dailyGoal')||''; let html=`<textarea id="goalInput" class="input-glass">${goal}</textarea><button class="btn-gradient" onclick="localStorage.setItem('dailyGoal',document.getElementById('goalInput').value);alert('Сақланди');closeModal()">Сақлаш</button>`; showModal(html, "Кунлик мақсад"); }
function showTodoList() { let tasks=JSON.parse(localStorage.getItem('todoTasks')||'["Намоз","Қуръон","Спорт"]'); let html=`<ul id="todoList">`+tasks.map((t,i)=>`<li>✅ ${t} <button onclick="removeTodo(${i})">Өчүрүү</button></li>`).join('')+`</ul><input id="newTodo" class="input-glass" placeholder="Янги"><button class="btn-gradient" onclick="addTodo()">Қўшиш</button>`; showModal(html, "Вазифалар"); }
function showMotivation() { const q=["Яхши одат - энг яхши сармоя","Сабр - имоннинг ярми","Илм - энг катта бойлик"]; showModal(`<div style="text-align:center"><i class="fas fa-quote-right"></i><p>"${q[Math.floor(Math.random()*q.length)]}"</p></div>`, "Мотивация"); }
function showStatistics() { showModal(`<div>Постлар: ${allPosts.length}<br>Лайк: ${allPosts.reduce((a,b)=>a+(b.likes?.length||0),0)}<br>Сакланган: ${allPosts.reduce((a,b)=>a+(b.saves?.length||0),0)}<br>Изоҳлар: ${allPosts.reduce((a,b)=>a+(b.comments?.length||0),0)}</div>`, "Статистика"); }
function showModal(html, title) { let m=document.getElementById('customModal'); if(!m){ m=document.createElement('div'); m.id='customModal'; m.className='modal'; m.innerHTML=`<div class="modal-content glass"><span class="close-modal" onclick="this.parentElement.parentElement.style.display='none'">&times;</span><div id="modalBody"></div></div>`; document.body.appendChild(m); } document.getElementById('modalBody').innerHTML=`<h3>${title}</h3>${html}`; m.style.display='flex'; }
window.removeTodo = function(i) { let tasks=JSON.parse(localStorage.getItem('todoTasks')||'[]'); tasks.splice(i,1); localStorage.setItem('todoTasks',JSON.stringify(tasks)); showTodoList(); };
window.addTodo = function() { let inp=document.getElementById('newTodo'); if(inp.value){ let tasks=JSON.parse(localStorage.getItem('todoTasks')||'[]'); tasks.push(inp.value); localStorage.setItem('todoTasks',JSON.stringify(tasks)); showTodoList(); } };
window.closeModal = function() { let m=document.getElementById('customModal'); if(m) m.style.display='none'; };

// ================= INIT =================
document.getElementById('submitPostBtn').onclick = addNewPost;
document.getElementById('saveEditBtn').onclick = saveEdit;
document.getElementById('addCommentBtn').onclick = addComment;
setupBottomNav();
setupAuth();
updateUITexts();