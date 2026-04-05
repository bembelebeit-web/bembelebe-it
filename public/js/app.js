// Переключение разделов
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.sec).classList.add('active');
    });
});

// Копирование
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.closest('.cmd-card').querySelector('.cmd-code').textContent;
        navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
    });
});

// Поиск
document.getElementById('search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const active = document.querySelector('.section.active');
    active.querySelectorAll('.cmd-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
});