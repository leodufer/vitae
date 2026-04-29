document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginMessage = document.getElementById("login-message");
    const registerMessage = document.getElementById("register-message");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("reg-name").value;
            const email = document.getElementById("reg-email").value;
            const password = document.getElementById("reg-password").value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.style.color = '#4CAF50';
                    registerMessage.textContent = '> ' + data.message + ' Redirigiendo a Login...';
                    setTimeout(() => {
                        registerMessage.textContent = '';
                        document.getElementById('reg-name').value = '';
                        document.getElementById('reg-email').value = '';
                        document.getElementById('reg-password').value = '';
                        // Switch to login box
                        document.getElementById('register-box').classList.add('hidden');
                        document.getElementById('login-box').classList.remove('hidden');
                    }, 2000);
                } else {
                    registerMessage.style.color = '#f44336';
                    registerMessage.textContent = '> ERROR: ' + (data.error || 'No se pudo registrar');
                }
            } catch (err) {
                console.error(err);
                registerMessage.style.color = '#f44336';
                registerMessage.textContent = '> ERROR: Fallo de conexión';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.style.color = '#4CAF50';
                    loginMessage.textContent = '> ' + data.message + '...';
                    
                    // Store token
                    localStorage.setItem('vitae_token', data.token);
                    localStorage.setItem('vitae_user', JSON.stringify(data.user));

                    setTimeout(() => {
                        // Redirect to dashboard or home
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    loginMessage.style.color = '#f44336';
                    loginMessage.textContent = '> ERROR: ' + (data.error || 'Credenciales inválidas');
                }
            } catch (err) {
                console.error(err);
                loginMessage.style.color = '#f44336';
                loginMessage.textContent = '> ERROR: Fallo de conexión';
            }
        });
    }
});
