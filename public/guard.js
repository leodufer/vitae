(function() {
    const token = localStorage.getItem('vitae_token');
    const path = window.location.pathname;
    const isDashboard = path.includes('dashboard.html');
    const isAuth = path.includes('auth.html');

    if (isDashboard && !token) {
        // Redirigir a login si intenta acceder al dashboard sin token
        window.location.href = 'auth.html';
    }

    if (isAuth && token) {
        // Redirigir al dashboard si ya está autenticado e intenta ir a login
        window.location.href = 'dashboard.html';
    }
})();
