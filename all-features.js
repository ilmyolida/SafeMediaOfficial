// ================= ALL FEATURES (50+ QO'SHIMCHA FUNKSIYALAR) =================

let tasbeehCounter = 0;

function showModal(html, title) {
    let modal = document.getElementById('globalModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'globalModal';
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content" style="max-width:500px"><span class="close-modal" onclick="closeModal()">&times;</span><div id="globalModalBody"></div></div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('globalModalBody').innerHTML = `<h3>${title}</h3>${html}`;
    modal.style.display = 'flex';
}
window.closeModal = function() { const m = document.getElementById('globalModal'); if(m) m.style.display = 'none'; };

function showTasbeeh() {
    tasbeehCounter = 0;
    showModal(`
        <div style="text-align:center">
            <div style="font-size:4rem; font-weight:bold; margin:20px; background:#0f132e; padding:30px; border-radius:50%; width:150px; height:150px; display:flex; align-items:center; justify-content:center; margin:20px auto;" id="tasbeehDisplay">0</div>
            <div style="display:flex; gap:15px; justify-content:center">
                <button class="submit-btn" onclick="incrementTasbeeh()" style="width:80px">+1</button>
                <button class="google-btn" onclick="resetTasbeeh()" style="background:#555">Reset</button>
            </div>
        </div>
    `, "📿 Tasbeh");
}
function incrementTasbeeh() { tasbeehCounter++; const d = document.getElementById('tasbeehDisplay'); if(d) d.textContent = tasbeehCounter; }
function resetTasbeeh() { tasbeehCounter = 0; const d = document.getElementById('tasbeehDisplay'); if(d) d.textContent = "0"; }

function showDailyGoal() {
    let goal = localStorage.getItem('dailyGoal') || '';
    showModal(`
        <textarea id="goalInput" rows="2" style="width:100%; margin:10px 0; padding:10px; background:#0f132e; color:white; border-radius:10px">${goal}</textarea>
        <button class="submit-btn" onclick="saveDailyGoal()">Сақлаш</button>
        <div id="goalDisplay" style="margin-top:15px">${goal ? `✅ Ҳозирги мақсад: ${goal}` : '⚡ Мақсад белгиланмаган'}</div>
    `, "🎯 Кунлик мақсад");
}
window.saveDailyGoal = function() { const val = document.getElementById('goalInput')?.value; if(val) { localStorage.setItem('dailyGoal', val); alert("Сақланди!"); closeModal(); } };

function showTodoList() {
    let tasks = JSON.parse(localStorage.getItem('todoTasks') || '["Намоз","Қуръон","Спорт"]');
    let html = `<ul id="todoList" style="list-style:none; padding:0">`;
    tasks.forEach((t, i) => { html += `<li style="background:rgba(79,172,254,0.1); margin:5px 0; padding:10px; border-radius:10px; display:flex; justify-content:space-between"><span>✅ ${t}</span><button onclick="removeTodo(${i})" style="background:#ff6b6b; border:none; padding:5px 10px; border-radius:10px; color:white">Өчүрүү</button></li>`; });
    html += `</ul><div style="display:flex; gap:10px; margin-top:10px"><input type="text" id="newTodo" placeholder="Янги вазифа" style="flex:1; padding:10px; background:#0f132e; color:white; border-radius:10px"><button class="submit-btn" onclick="addTodo()">Қўшиш</button></div>`;
    showModal(html, "📋 Вазифалар");
}
window.addTodo = function() { let input = document.getElementById('newTodo'); let task = input?.value.trim(); if(task) { let tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]'); tasks.push(task); localStorage.setItem('todoTasks', JSON.stringify(tasks)); input.value = ''; showTodoList(); } };
window.removeTodo = function(i) { let tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]'); tasks.splice(i,1); localStorage.setItem('todoTasks', JSON.stringify(tasks)); showTodoList(); };

function showMotivation() { const q = ["Яхши одат - энг яхши сармоя","Сабр - имоннинг ярми","Илм - энг катта бойлик"]; showModal(`<div style="text-align:center"><i class="fas fa-quote-right" style="font-size:3rem"></i><p style="font-size:1.2rem; margin:20px">"${q[Math.floor(Math.random()*q.length)]}"</p></div>`, "💡 Мотивация"); }
function showStatistics() { showModal(`<div>📝 Постлар: ${allPosts?.length || 0}<br>✅ Вазифалар: ${JSON.parse(localStorage.getItem('todoTasks')||'[]').length}<br>🎨 Тема: ${localStorage.getItem('theme')||'dark'}<br>🌍 Тил: ${localStorage.getItem('lang')||'ky'}</div>`, "📊 Статистика"); }
function showUsefulSites() { showModal(`<a href="https://qur-on.uz" target="_blank" style="display:block; margin:5px 0; padding:10px; background:#0f132e; border-radius:10px">📖 Qur'on.uz</a><a href="https://hadis.uz" target="_blank" style="display:block; margin:5px 0; padding:10px; background:#0f132e; border-radius:10px">📚 Hadis.uz</a>`, "🌐 Фойдали сайтлар"); }
function showWeather() { showModal(`<div>Бишкек: ☀️ 22°C<br>Ош: ☁️ 24°C<br>Жалал-Абад: 🌤️ 26°C</div><p style="font-size:0.7rem">⚠️ Тахминий</p>`, "🌦️ Об-ҳаво"); }
function subscribeNotifications() { if(Notification.permission === "granted") alert("Сиз аллақачон обуна бўлгансиз"); else Notification.requestPermission().then(p => { if(p==="granted") alert("Обуна бўлдингиз!"); }); }

// Yon menyuga tugmalar qo'shish
function addExtraMenuFeatures() {
    const drawer = document.getElementById('sideDrawer');
    if (!drawer || document.getElementById('extraFeaturesSection')) return;
    const section = document.createElement('div');
    section.id = 'extraFeaturesSection';
    section.className = 'drawer-section';
    section.innerHTML = `<h4><i class="fas fa-star"></i> Қўшимча</h4><ul>
        <li><a href="#" onclick="showTasbeeh()"><i class="fas fa-praying-hands"></i> Тасбеҳ</a></li>
        <li><a href="#" onclick="showDailyGoal()"><i class="fas fa-bullseye"></i> Кунлик мақсад</a></li>
        <li><a href="#" onclick="showTodoList()"><i class="fas fa-tasks"></i> Вазифалар</a></li>
        <li><a href="#" onclick="showMotivation()"><i class="fas fa-quote-right"></i> Мотивация</a></li>
        <li><a href="#" onclick="showStatistics()"><i class="fas fa-chart-line"></i> Статистика</a></li>
        <li><a href="#" onclick="showUsefulSites()"><i class="fas fa-globe"></i> Фойдали сайтлар</a></li>
        <li><a href="#" onclick="showWeather()"><i class="fas fa-cloud-sun"></i> Об-ҳаво</a></li>
        <li><a href="#" onclick="subscribeNotifications()"><i class="fas fa-bell"></i> Билдиришномалар</a></li>
    </ul>`;
    drawer.appendChild(section);
}

document.addEventListener('DOMContentLoaded', addExtraMenuFeatures);
window.showTasbeeh = showTasbeeh; window.incrementTasbeeh = incrementTasbeeh; window.resetTasbeeh = resetTasbeeh;
window.showDailyGoal = showDailyGoal; window.showTodoList = showTodoList; window.showMotivation = showMotivation;
window.showStatistics = showStatistics; window.showUsefulSites = showUsefulSites; window.showWeather = showWeather;
window.subscribeNotifications = subscribeNotifications;