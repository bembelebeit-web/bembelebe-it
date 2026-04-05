const API_URL = 'https://YOUR-APP.onrender.com'; // ЗАМЕНИ НА СВОЮ ССЫЛКУ С RENDER!
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

// Обновляем шапку
function updateHeader() {
    const widget = document.getElementById('profile-widget');
    if (user) {
        widget.innerHTML = `<button class="btn" onclick="logout()">${user.username}</button>`;
    }
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

// Загрузка тем
async function loadTopics() {
    const list = document.getElementById('topics-list');
    try {
        const res = await fetch(`${API_URL}/api/topics`);
        const topics = await res.json();
        list.innerHTML = topics.map(t => `
            <div class="topic-card">
                <h3>${t.title}</h3>
                <p style="color:var(--text-secondary);font-size:13px;margin-top:4px;">by ${t.username}</p>
            </div>
        `).join('');
    } catch(err) {
        console.error(err);
    }
}

// Новая тема
document.getElementById('new-topic-btn')?.addEventListener('click', () => {
    if (!token) return window.location.href = 'auth.html';
    document.getElementById('new-topic-modal').classList.add('active');
});

document.getElementById('submit-topic')?.addEventListener('click', async () => {
    const title = document.getElementById('topic-title').value;
    const content = document.getElementById('topic-content').value;
    
    await fetch(`${API_URL}/api/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ title, content })
    });
    
    window.location.reload();
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
});

updateHeader();
loadTopics();