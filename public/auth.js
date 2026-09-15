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

    // Forgot Password Form Logic
    const forgotForm = document.getElementById("forgot-form");
    const forgotMessage = document.getElementById("forgot-message");

    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("forgot-email").value;

            try {
                const response = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    forgotMessage.style.color = '#4CAF50';
                    if (data._dev_link) {
                        forgotMessage.innerHTML = `> SOLICITUD ENVIADA.<br>Enlace de desarrollo generado:<br><a href="${data._dev_link}" style="color: var(--accent); text-decoration: underline; word-break: break-all;">Haga clic aquí para restablecer</a>`;
                    } else {
                        forgotMessage.textContent = '> ' + data.message;
                    }
                } else {
                    forgotMessage.style.color = '#f44336';
                    forgotMessage.textContent = '> ERROR: ' + (data.error || 'No se pudo procesar la solicitud');
                }
            } catch (err) {
                console.error(err);
                forgotMessage.style.color = '#f44336';
                forgotMessage.textContent = '> ERROR: Fallo de conexión';
            }
        });
    }

    // Reset Password Form Logic
    const resetForm = document.getElementById("reset-form");
    const resetMessage = document.getElementById("reset-message");

    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = document.getElementById("reset-token").value;
            const password = document.getElementById("reset-password").value;

            try {
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, password })
                });

                const data = await response.json();

                if (response.ok) {
                    resetMessage.style.color = '#4CAF50';
                    resetMessage.textContent = '> ' + data.message + ' Redirigiendo a Login...';
                    
                    // Limpiar el parámetro de la URL
                    window.history.replaceState({}, document.title, window.location.pathname);

                    setTimeout(() => {
                        resetMessage.textContent = '';
                        document.getElementById("reset-password").value = '';
                        // Cambiar al login box
                        if (typeof toggleAuth === 'function') {
                            toggleAuth(null, 'login');
                        }
                    }, 2000);
                } else {
                    resetMessage.style.color = '#f44336';
                    resetMessage.textContent = '> ERROR: ' + (data.error || 'No se pudo restablecer la contraseña');
                }
            } catch (err) {
                console.error(err);
                resetMessage.style.color = '#f44336';
                resetMessage.textContent = '> ERROR: Fallo de conexión';
            }
        });
    }

    // Detect reset token in URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        // Guardar el token en el input oculto
        const tokenInput = document.getElementById("reset-token");
        if (tokenInput) {
            tokenInput.value = token;
        }
        // Mostrar el formulario de reset y ocultar los demás
        if (typeof toggleAuth === 'function') {
            toggleAuth(null, 'reset');
        }
    }
});
