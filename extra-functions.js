// ================= EXTRA FUNCTIONS - TO'LIQ ISHLAYDI =================

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
    const text = `${title}\n\n${content}\n\n— Safe Media dan ulashildi`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: content,
            url: window.location.href
        }).catch(err => console.log("Ulashish bekor qilindi"));
    } else {
        navigator.clipboard.writeText(text);
        alert("📋 Matn nusxalandi! Endi istalgan joyga ulashing.");
    }
}

// Har bir postga ulashish tugmasi qo'shish
function addShareButtonToPosts() {
    document.querySelectorAll('.post-card').forEach(card => {
        if (!card.querySelector('.share-post-btn')) {
            const title = card.querySelector('h3')?.innerText || '';
            const content = card.querySelector('p')?.innerText || '';
            const shareBtn = document.createElement('button');
            shareBtn.className = 'share-post-btn';
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Ulashish';
            shareBtn.style.cssText = 'background:#4facfe; border:none; padding:5px 12px; border-radius:20px; color:white; cursor:pointer; margin-top:10px; margin-right:10px; font-size:0.8rem';
            shareBtn.onclick = () => sharePost(title, content);
            card.appendChild(shareBtn);
        }
    });
}

// ================= 3. TAKLIF VA FEEDBACK (EMAIL ORQALI) =================
function openFeedbackModal() {
    let modal = document.getElementById('feedbackModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedbackModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" onclick="closeFeedbackModal()">&times;</span>
                <h3><i class="fas fa-comment-dots"></i> Taklif yoki fikr bildirish</h3>
                <p style="color:#aaa; font-size:0.8rem; margin-bottom:15px">Sizning fikringiz biz uchun muhim!</p>
                <label>📧 Email (ixtiyoriy)</label>
                <input type="email" id="feedbackEmail" placeholder="Email manzilingiz" style="width:100%; margin-bottom:15px; padding:10px; border-radius:10px; border:none; background:#0f132e; color:white">
                <label>💬 Xabaringiz</label>
                <textarea id="feedbackMessage" rows="5" placeholder="Taklif, fikr yoki savolingizni yozing..." style="width:100%; margin-bottom:15px; padding:10px; border-radius:10px; border:none; background:#0f132e; color:white"></textarea>
                <button id="sendFeedbackBtn" class="submit-btn" style="background:#4facfe"><i class="fas fa-paper-plane"></i> Yuborish</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('sendFeedbackBtn').addEventListener('click', sendFeedbackEmail);
    }
    modal.style.display = 'flex';
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'none';
}

// Email orqali yuborish (mailto)
function sendFeedbackEmail() {
    const email = document.getElementById('feedbackEmail').value;
    const message = document.getElementById('feedbackMessage').value;
    
    if (!message) {
        alert("❌ Iltimos, xabaringizni yozing!");
        return;
    }
    
    const subject = encodeURIComponent("Safe Media dan taklif/fikr");
    const body = encodeURIComponent(`Email: ${email || 'Anonim'}\n\nXabar:\n${message}\n\n---\nVaqt: ${new Date().toLocaleString()}`);
    window.location.href = `mailto:safemediaofficialsupport@gmail.com?subject=${subject}&body=${body}`;
    
    alert("✅ Email dasturi ochiladi. Yuborish tugmasini bosing!");
    closeFeedbackModal();
    document.getElementById('feedbackMessage').value = '';
    document.getElementById('feedbackEmail').value = '';
}

// ================= 4. QO'LLAB-QUVVATLASH (REAL SUPPORT) =================
function showSupportInfo() {
    // Modal oynada ko'rsatish
    let modal = document.getElementById('supportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supportModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <span class="close-modal" onclick="closeSupportModal()">&times;</span>
                <i class="fas fa-heart" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 15px;"></i>
                <h3>Safe Media ni qo'llab-quvvatlang</h3>
                <p>Sizning yordamingiz bizni rivojlantiradi!</p>
                <div style="margin: 20px 0; text-align: left; background: #0f132e; padding: 15px; border-radius: 15px;">
                    <p><i class="fas fa-mobile-alt"></i> <strong>📞 Paynet / O!Dengi:</strong><br>+996 700 123 456</p>
                    <p><i class="fab fa-usdt"></i> <strong>💸 USDT (TRC20):</strong><br>TXxx...xxx (xabar uchun)</p>
                    <p><i class="fab fa-google"></i> <strong>💰 Google Pay:</strong><br>safemedia@gmail.com</p>
                    <p><i class="fab fa-bitcoin"></i> <strong>₿ Bitcoin:</strong><br>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</p>
                </div>
                <button onclick="copySupportInfo()" class="submit-btn" style="background:#4facfe; margin-bottom:10px"><i class="fas fa-copy"></i> Ma'lumotlarni nusxalash</button>
                <button onclick="closeSupportModal()" class="google-btn" style="background:#555">Yopish</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) modal.style.display = 'none';
}

function copySupportInfo() {
    const text = `Safe Media ni qo'llab-quvvatlash:\n\nPaynet/O!Dengi: +996 700 123 456\nUSDT (TRC20): TXxx...xxx\nGoogle Pay: safemedia@gmail.com\nBitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`;
    navigator.clipboard.writeText(text);
    alert("✅ Ma'lumotlar nusxalandi!");
}

// ================= 5. BILDIRISHNOMALAR (PUSH) =================
function subscribeNotifications() {
    if (!("Notification" in window)) {
        alert("⚠️ Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi.");
        return;
    }
    
    if (Notification.permission === "granted") {
        alert("✅ Siz allaqachon obuna bo'lgansiz!");
        new Notification("Safe Media", { body: "Bildirishnomalar yoqilgan!", icon: "https://safe-media.com/favicon.ico" });
        return;
    }
    
    Notification.requestPermission().then(perm => {
        if (perm === "granted") {
            localStorage.setItem('pushSubscribed', 'true');
            alert("✅ Yangiliklar kelganda sizga xabar beramiz!");
            new Notification("Safe Media", { body: "Bildirishnomalar muvaffaqiyatli yoqildi!" });
        } else {
            alert("❌ Siz bildirishnomalarni rad etdingiz.");
        }
    });
}

// Yangi post qo'shilganda bildirishnoma
function notifyNewPost(title) {
    if (localStorage.getItem('pushSubscribed') === 'true' && Notification.permission === "granted") {
        new Notification("📢 Safe Media - Yangi post!", {
            body: `${title}`,
            icon: "https://safe-media.com/favicon.ico"
        });
    }
}

// ================= 6. POSTLARNI SARALASH =================
let sortOrder = 'desc';

function toggleSortOrder() {
    if (sortOrder === 'desc') {
        sortOrder = 'asc';
        allPosts.sort((a, b) => {
            const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
            const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
            return dateA - dateB;
        });
        alert("📅 Postlar eskidan yangiğa tartiblandi");
    } else {
        sortOrder = 'desc';
        allPosts.sort((a, b) => {
            const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
            const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
            return dateB - dateA;
        });
        alert("📅 Postlar eng yangidan eskiğa tartiblandi");
    }
    renderPosts(allPosts);
    setTimeout(addShareButtonToPosts, 100);
}

// ================= 7. ADMIN UCHUN TEZKOR PANEL =================
function addAdminQuickButtons() {
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) return;
    
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    // Agar panel allaqachon mavjud bo'lsa qayta qo'shma
    if (document.querySelector('.admin-quick-panel')) return;
    
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
        <button onclick="toggleSortOrder()" style="background:white; border:none; padding:8px 16px; border-radius:25px; color:#0a0e27; cursor:pointer"><i class="fas fa-sort"></i> Saralash</button>
    `;
    
    container.insertBefore(quickPanel, container.firstChild);
}

// ================= 8. YON MENYUGA YANGI TUGMALAR QO'SHISH =================
function addExtraMenuButtons() {
    const drawer = document.getElementById('sideDrawer');
    if (!drawer) return;
    
    // Agar allaqachon qo'shilgan bo'lsa qayta qo'shma
    if (document.querySelector('.extra-menu-added')) return;
    
    // Taklif tugmasi
    const feedbackSection = document.createElement('div');
    feedbackSection.className = 'drawer-section extra-menu-added';
    feedbackSection.innerHTML = `
        <h4><i class="fas fa-comment-dots"></i> Taklif va Fikrlar</h4>
        <ul>
            <li><a href="#" onclick="openFeedbackModal()"><i class="fas fa-paper-plane"></i> Taklif yuborish</a></li>
            <li><a href="#" onclick="showSupportInfo()"><i class="fas fa-heart"></i> Qo'llab-quvvatlash</a></li>
        </ul>
    `;
    
    // Yangiliklar obunasi
    const subscribeSection = document.createElement('div');
    subscribeSection.className = 'drawer-section extra-menu-added';
    subscribeSection.innerHTML = `
        <h4><i class="fas fa-bell"></i> Bildirishnomalar</h4>
        <ul>
            <li><a href="#" onclick="subscribeNotifications()"><i class="fas fa-bell"></i> Yangiliklarga obuna bo'lish</a></li>
        </ul>
    `;
    
    drawer.appendChild(feedbackSection);
    drawer.appendChild(subscribeSection);
}

// ================= 9. PROFILGA SOZLAMALAR =================
function addProfileSettings() {
    if (!currentUser) return;
    
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    // Agar allaqachon qo'shilgan bo'lsa qayta qo'shma
    if (document.querySelector('.profile-settings')) return;
    
    const settingsHtml = `
        <div class="profile-settings" style="margin-top: 20px; padding: 20px; background: rgba(79,172,254,0.1); border-radius: 20px;">
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
        user: { email: currentUser?.email, name: currentUser?.displayName },
        savedPosts: allPosts,
        settings: {
            theme: localStorage.getItem('theme'),
            lang: localStorage.getItem('lang'),
            todoTasks: localStorage.getItem('todoTasks')
        },
        exportDate: new Date().toISOString()
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
    
    // Post renderlanganda ulashish tugmasini qo'shish
    const originalRenderPosts = window.renderPosts;
    if (originalRenderPosts) {
        window.renderPosts = function(posts) {
            originalRenderPosts(posts);
            setTimeout(() => {
                addShareButtonToPosts();
                addAdminQuickButtons();
            }, 100);
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
    
    // Bildirishnoma uchun original post yozish funksiyasini o'rab olish
    const originalSubmitBtn = document.getElementById('submitPostBtn');
    if (originalSubmitBtn) {
        const originalClick = originalSubmitBtn.onclick;
        originalSubmitBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (allPosts && allPosts.length > 0) {
                    notifyNewPost(allPosts[0].title);
                }
            }, 1500);
        });
    }
    
    console.log("✅ Extra functions loaded!");
}

// DOM tayyor bo'lganda ishga tushirish
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initExtraFunctions, 500));
} else {
    setTimeout(initExtraFunctions, 500);
}

// Global funksiyalar
window.savePostsToLocal = savePostsToLocal;
window.loadPostsFromLocal = loadPostsFromLocal;
window.sharePost = sharePost;
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.sendFeedbackEmail = sendFeedbackEmail;
window.showSupportInfo = showSupportInfo;
window.closeSupportModal = closeSupportModal;
window.copySupportInfo = copySupportInfo;
window.subscribeNotifications = subscribeNotifications;
window.toggleSortOrder = toggleSortOrder;
window.exportUserData = exportUserData;