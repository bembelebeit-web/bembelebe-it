const API_URL = 'https://bembelebe-it.onrender.com'; // ЗАМЕНИ НА СВОЮ ССЫЛКУ!

const form = document.getElementById('auth-form');
const title = document.getElementById('auth-title');
const switchLink = document.getElementById('switch-link');
const switchText = document.getElementById('switch-text');

let isLogin = true;

switchLink.onclick = (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    title.textContent = isLogin ? 'Login' : 'Register';
    switchText.textContent = isLogin ? 'No account?' : 'Have an account?';
    switchLink.textContent = isLogin ? 'Register' : 'Login';
    form.querySelector('button').textContent = isLogin ? 'Login' : 'Register';
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        if (isLogin) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/forum.html';
        } else {
            alert('Account created! Now login.');
            switchLink.click();
        }
    } catch (err) {
        alert(err.message);
    }
};
