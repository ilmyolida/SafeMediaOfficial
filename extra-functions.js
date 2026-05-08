// ================= EXTRA FUNCTIONS =================
// Bu fayl hech qanday mavjud kodni buzmaydi, faqat qo'shimcha funksiyalar qo'shadi

// ================= 1. POSTLARNI SAQLASH (LOCAL BACKUP) =================
function savePostsToLocal() {
    if (!allPosts || allPosts.length === 0) {
        alert("⚠️ Hozircha saqlanadigan post yo'q!");
        return;
    }
    const data = JSON.stringify(allPosts);
    localStorage.setItem('safeMedia_backup', data);
    alert("✅ Barcha postlar brauzeringizga saqlandi! (Local backup)");
}

function loadPostsFromLocal() {
    const data = localStorage.getItem('safeMedia_backup');
    if (!data) {
        alert("⚠️ Saqlangan backup topilmadi!");
        return;
    }
    const posts = JSON.parse(data);
    if (confirm("Backup'dan postlarni tiklashni xohlaysizmi? Hozirgi postlar o'chib ketadi!")) {
        allPosts = posts;
        renderPosts(allPosts);
        alert("✅ Postlar tiklandi!");
    }
}

// ================= 2. POSTLARNI ULASHISH (SHARE) =================
function sharePost(title, content) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: content,
            url: window.location.href
        }).catch(err => console.log("Ulashish bekor qilindi"));
    } else {
        // Agar telefon ulashish funksiyasi bo'lmasa
        const text = `${title}\n\n${content}\n\n— Safe Media dan ulashildi`;
        navigator.clipboard.writeText(text);
        alert("📋 Matn nusxalandi! Endi istalgan joyga ulashing.");
    }
}

// ================= 3. TAKLIF VA FEEDBACK YUBORISH =================
function openFeedbackModal() {
    // Modal yaratish (agar mavjud bo'lmasa)
    let modal = document.getElementById('feedbackModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedbackModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" onclick="closeFeedbackModal()">&times;</span>
                <h3><i class="fas fa-comment-dots"></i> Taklif yoki fikr bildirish</h3>
                <label>📧 Email (ixtiyoriy)</label>
                <input type="email" id="feedbackEmail" placeholder="Email manzilingiz" style="width:100%; margin-bottom:15px; padding:10px; border-radius:10px; border:none;">
                <label>💬 Xabaringiz</label>
                <textarea id="feedbackMessage" rows="5" placeholder="Taklif, fikr yoki savolingizni yozing..." style="width:100%; margin-bottom:15px; padding:10px; border-radius:10px; border:none;"></textarea>
                <button id="sendFeedbackBtn" class="submit-btn" style="background:#4facfe"><i class="fas fa-paper-plane"></i> Yuborish</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Yuborish tugmasi eventi
        document.getElementById('sendFeedbackBtn').addEventListener('click', sendFeedback);
    }
    modal.style.display = 'flex';
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'none';
}

async function sendFeedback() {
    const email = document.getElementById('feedbackEmail').value;
    const message = document.getElementById('feedbackMessage').value;
    
    if (!message) {
        alert("❌ Iltimos, xabaringizni yozing!");
        return;
    }
    
    // Firebase ga saqlash
    try {
        await db.collection('feedbacks').add({
            email: email || 'Anonim',
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user: currentUser ? currentUser.email : 'Anonim'
        });
        alert("✅ Rahmat! Xabaringiz qabul qilindi.");
        closeFeedbackModal();
        document.getElementById('feedbackMessage').value = '';
        document.getElementById('feedbackEmail').value = '';
    } catch(error) {
        console.error(error);
        alert("❌ Xatolik yuz berdi. Keyinroq urinib ko'ring.");
    }
}

// ================= 4. QO'LLAB-QUVVATLASH (SUPPORT) =================
function showSupportInfo() {
    const supportHtml = `
        <div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1f3a; padding:25px; border-radius:20px; z-index:3000; max-width:350px; text-align:center; box-shadow:0 5px 30px rgba(0,0,0,0.5);">
            <i class="fas fa-heart" style="font-size:3rem; color:#ff6b6b"></i>
            <h3>Safe Media ni qo'llab-quvvatlang</h3>
            <p>Sizning yordamingiz bizni rivojlantiradi!</p>
            <div style="margin:20px 0">
                <p><i class="fas fa-mobile-alt"></i> <strong>Paynet / O!Dengi:</strong> +996 700 123 456</p>
                <p><i class="fab fa-usdt"></i> <strong>USDT (TRC20):</strong> Txxx...xxx</p>
                <p><i class="fab fa-google"></i> <strong>Google Pay:</strong> safemedia@gmail.com</p>
            </div>
            <button onclick="this.parentElement.remove()" class="submit-btn" style="background:#4facfe">Yopish</button>
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = supportHtml;
    document.body.appendChild(div.firstChild);
}

// ================= 5. POSTLARNI PDF GA CHIQARISH =================
function exportToPDF() {
    if (!allPosts || allPosts.length === 0) {
        alert("⚠️ Postlar mavjud emas!");
        return;
    }
    
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Safe Media - Postlar</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4facfe; }
            .post { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 10px; }
            .post h3 { color: #2c3e50; }
            .post p { line-height: 1.5; }
            .date { color: #7f8c8d; font-size: 12px; }
        </style>
        </head>
        <body>
        <h1>Safe Media - Barcha postlar</h1>
        <p>Chiqarilgan sana: ${new Date().toLocaleDateString()}</p>
        <hr>
    `;
    
    for (let post of allPosts) {
        htmlContent += `
            <div class="post">
                <h3>${escapeHtml(post.title)}</h3>
                ${post.imageUrl ? `<img src="${post.imageUrl}" style="max-width:100%; margin:10px 0" onerror="this.style.display='none'">` : ''}
                <p>${escapeHtml(post.content)}</p>
                <div class="date">📅 ${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Yangi'}</div>
            </div>
        `;
    }
    
    htmlContent += `</body></html>`;
    
    const blob = new Blob([htmlContent], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safe_media_posts_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Postlar HTML fayl sifatida yuklab olindi. Uni brauzerda ochib, 'Chop etish' -> 'PDF saqlash' tanlang.");
}

// ================= 6. YANGILIKLARGA OBUNA (PUSH NOTIFICATION) =================
function subscribeNotifications() {
    if (!("Notification" in window)) {
        alert("⚠️ Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi.");
        return;
    }
    
    if (Notification.permission === "granted") {
        alert("✅ Siz allaqachon obuna bo'lgansiz!");
        return;
    }
    
    Notification.requestPermission().then(perm => {
        if (perm === "granted") {
            localStorage.setItem('pushSubscribed', 'true');
            alert("✅ Yangiliklar kelganda sizga xabar beramiz!");
        } else {
            alert("❌ Siz bildirishnomalarni rad etdingiz.");
        }
    });
}

// Yangi post qo'shilganda bildirishnoma yuborish (admin uchun)
function notifyNewPost(title) {
    if (localStorage.getItem('pushSubscribed') === 'true' && Notification.permission === "granted") {
        new Notification("📢 Safe Media - Yangi post!", {
            body: `${title}`,
            icon: "https://safe-media.com/favicon.ico"
        });
    }
}

// ================= 7. POSTLARNI SARALASH =================
let sortOrder = 'desc'; // desc yoki asc
function toggleSortOrder() {
    if (sortOrder === 'desc') {
        sortOrder = 'asc';
        allPosts.sort((a,b) => {
            const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
            const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
            return dateA - dateB;
        });
    } else {
        sortOrder = 'desc';
        allPosts.sort((a,b) => {
            const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
            const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
            return dateB - dateA;
        });
    }
    renderPosts(allPosts);
    alert(`📅 Postlar ${sortOrder === 'desc' ? 'eng yangidan eskiğa' : 'eskidan yangiğa'} tartiblandi`);
}

// ================= 8. ADMIN UCHUN TEZ KIRISH TUGMALARI =================
function addAdminQuickButtons() {
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) return;
    
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    // Tepadagi tezkor panel
    const quickPanel = document.createElement('div');
    quickPanel.className = 'admin-quick-panel';
    quickPanel.style.cssText = `
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        padding: 12px;
        border-radius: 20px;
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
    `;
    quickPanel.innerHTML = `
        <button onclick="openAdminModal()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-plus"></i> Post qo'shish</button>
        <button onclick="savePostsToLocal()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-download"></i> Backup</button>
        <button onclick="loadPostsFromLocal()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-upload"></i> Restore</button>
        <button onclick="exportToPDF()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-file-pdf"></i> PDF</button>
        <button onclick="toggleSortOrder()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-sort"></i> Saralash</button>
    `;
    
    // Agar panel hali qo'shilmagan bo'lsa
    if (!document.querySelector('.admin-quick-panel')) {
        container.insertBefore(quickPanel, container.firstChild);
    }
}

// ================= 9. YON MENYUGA YANGI TUGMALAR QO'SHISH =================
function addExtraMenuButtons() {
    const drawer = document.getElementById('sideDrawer');
    if (!drawer) return;
    
    // Taklif tugmasi
    const feedbackSection = document.createElement('div');
    feedbackSection.className = 'drawer-section';
    feedbackSection.innerHTML = `
        <h4><i class="fas fa-comment-dots"></i> Taklif va Fikrlar</h4>
        <ul>
            <li><a href="#" onclick="openFeedbackModal()"><i class="fas fa-paper-plane"></i> Taklif yuborish</a></li>
            <li><a href="#" onclick="showSupportInfo()"><i class="fas fa-heart"></i> Qo'llab-quvvatlash</a></li>
        </ul>
    `;
    
    // Yangiliklar obunasi
    const subscribeSection = document.createElement('div');
    subscribeSection.className = 'drawer-section';
    subscribeSection.innerHTML = `
        <h4><i class="fas fa-bell"></i> Bildirishnomalar</h4>
        <ul>
            <li><a href="#" onclick="subscribeNotifications()"><i class="fas fa-bell"></i> Yangiliklarga obuna bo'lish</a></li>
        </ul>
    `;
    
    // Mavjud bo'limlardan keyin qo'shish
    drawer.appendChild(feedbackSection);
    drawer.appendChild(subscribeSection);
}

// ================= 10. PROFILGA SOZLAMALAR QO'SHISH =================
function addProfileSettings() {
    if (!currentUser) return;
    
    const container = document.getElementById('postsContainer');
    if (!container || !container.innerHTML.includes(currentUser.email)) return;
    
    const settingsHtml = `
        <div style="margin-top: 20px; padding: 20px; background: rgba(79,172,254,0.1); border-radius: 20px;">
            <h4><i class="fas fa-cog"></i> Sozlamalar</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                <button onclick="localStorage.clear(); alert('Barcha mahalliy ma\'lumotlar tozalandi!'); location.reload();" style="background:#ff6b6b; border:none; padding:8px 15px; border-radius:20px; color:white; cursor:pointer">
                    <i class="fas fa-trash"></i> Keshni tozalash
                </button>
                <button onclick="exportUserData()" style="background:#4facfe; border:none; padding:8px 15px; border-radius:20px; color:white; cursor:pointer">
                    <i class="fas fa-database"></i> Ma'lumotlarni yuklab olish
                </button>
            </div>
        </div>
    `;
    container.innerHTML += settingsHtml;
}

function exportUserData() {
    const userData = {
        user: currentUser,
        savedPosts: allPosts,
        settings: {
            theme: localStorage.getItem('theme'),
            lang: localStorage.getItem('lang'),
            todoTasks: localStorage.getItem('todoTasks')
        }
    };
    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safe_media_my_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Ma'lumotlaringiz yuklab olindi!");
}

// ================= FUNKSIYALARNI ISHGA TUSHIRISH =================
function initExtraFunctions() {
    addExtraMenuButtons();
    
    // Har safar render qilinganda admin panelini tekshirish
    const originalRenderPosts = window.renderPosts;
    if (originalRenderPosts) {
        window.renderPosts = function(posts) {
            originalRenderPosts(posts);
            addAdminQuickButtons();
        };
    }
    
    // Profil sahifasiga sozlamalar qo'shish
    const originalShowProfilePage = window.showProfilePage;
    if (originalShowProfilePage) {
        window.showProfilePage = function() {
            originalShowProfilePage();
            setTimeout(addProfileSettings, 100);
        };
    }
    
    // Yangi post yozilganda bildirishnoma
    const originalSubmitPost = document.getElementById('submitPostBtn');
    if (originalSubmitPost) {
        const oldListener = originalSubmitPost.onclick;
        originalSubmitPost.addEventListener('click', () => {
            setTimeout(() => {
                const newPost = allPosts[0];
                if (newPost) notifyNewPost(newPost.title);
            }, 1000);
        });
    }
    
    console.log("✅ Extra functions loaded!");
}

// Ishlatish
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initExtraFunctions, 500);
});

// Global funksiyalar
window.savePostsToLocal = savePostsToLocal;
window.loadPostsFromLocal = loadPostsFromLocal;
window.sharePost = sharePost;
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.sendFeedback = sendFeedback;
window.showSupportInfo = showSupportInfo;
window.exportToPDF = exportToPDF;
window.subscribeNotifications = subscribeNotifications;
window.toggleSortOrder = toggleSortOrder;
window.exportUserData = exportUserData;