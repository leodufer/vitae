document.addEventListener("DOMContentLoaded", () => {
    // --- THEME TOGGLE LOGIC ---
    const themeToggle = document.getElementById("theme-toggle");

    // Check local storage or system preference
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        if (themeToggle) themeToggle.textContent = "☾";
    } else {
        if (themeToggle) themeToggle.textContent = "☀";
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            let theme = document.documentElement.getAttribute("data-theme");
            if (theme === "light") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "dark");
                themeToggle.textContent = "☀";
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
                themeToggle.textContent = "☾";
            }
        });
    }

    // --- USER SESSION LOGIC ---
    const userDisplay = document.getElementById("user-display");
    const logoutBtn = document.getElementById("logout-btn");
    const userData = localStorage.getItem("vitae_user");

    if (userData && userDisplay) {
        const user = JSON.parse(userData);
        userDisplay.textContent = user.name.toUpperCase();
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("vitae_token");
            localStorage.removeItem("vitae_user");
            window.location.href = "index.html";
        });
    }

    // --- LANDING PAGE AUTH BUTTON ---
    const authBtn = document.querySelector('a[href="auth.html"]');
    if (authBtn && localStorage.getItem('vitae_token')) {
        authBtn.textContent = 'DASHBOARD';
        authBtn.href = 'dashboard.html';
    }

    // --- DASHBOARD NAVIGATION LOGIC ---
    const dashboardContent = document.querySelector(".dashboard-content");
    const sidebarItems = document.querySelectorAll(".sidebar-menu li");

    // API Helper
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('vitae_token');
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(endpoint, options);
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('vitae_token');
                window.location.href = 'auth.html';
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in API request to ${endpoint}:`, error);
            return null;
        }
    }

    // Save initial "Mi Currículum" content
    const sections = {
        'mi-curriculum': dashboardContent ? dashboardContent.innerHTML : ''
    };

    // Define other sections
    sections['datos-personales'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // DATOS PERSONALES</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-personal">GUARDAR CAMBIOS</button>
            </div>
        </div>
        <div class="card" style="max-width: 600px;">
            <div class="card-header">▸ FORMULARIO_IDENTIDAD</div>
            <form class="terminal-form" style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                <div class="form-group">
                    <label style="display: block; color: var(--accent); margin-bottom: 0.5rem;">[NOMBRE_COMPLETO]</label>
                    <input type="text" id="cv-full-name" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body);">
                </div>
                <div class="form-group">
                    <label style="display: block; color: var(--accent); margin-bottom: 0.5rem;">[EMAIL_CONTACTO]</label>
                    <input type="email" id="cv-email" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body);">
                </div>
                <div class="form-group">
                    <label style="display: block; color: var(--accent); margin-bottom: 0.5rem;">[TELÉFONO]</label>
                    <input type="text" id="cv-phone" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body);">
                </div>
                <div class="form-group">
                    <label style="display: block; color: var(--accent); margin-bottom: 0.5rem;">[UBICACIÓN]</label>
                    <input type="text" id="cv-location" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body);">
                </div>
            </form>
            <p id="save-msg" class="sys-msg" style="margin-top: 1rem;"></p>
        </div>
    `;

    sections['habilidades'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // HABILIDADES TÉCNICAS</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-skills">GUARDAR HABILIDADES</button>
            </div>
        </div>
        <div class="grid">
            <div class="card">
                <div class="card-header">▸ EDITOR_DE_SKILLS</div>
                <textarea id="skills-list" style="width: 100%; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Escribe una habilidad por línea (ej: JavaScript)"></textarea>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Una habilidad por línea.</p>
            </div>
            <div class="card">
                <div class="card-header">▸ VISTA_PREVIA</div>
                <div id="skills-preview" style="margin-top: 1rem;"></div>
            </div>
        </div>
        <p id="save-msg-skills" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['soft-skills'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // HABILIDADES BLANDAS</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-soft-skills">GUARDAR HABILIDADES</button>
            </div>
        </div>
        <div class="grid">
            <div class="card">
                <div class="card-header">▸ EDITOR_DE_SOFT_SKILLS</div>
                <textarea id="soft-skills-list" style="width: 100%; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Escribe una habilidad por línea (ej: Liderazgo)"></textarea>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Una habilidad por línea.</p>
            </div>
            <div class="card">
                <div class="card-header">▸ VISTA_PREVIA</div>
                <div id="soft-skills-preview" style="margin-top: 1rem;"></div>
            </div>
        </div>
        <p id="save-msg-soft-skills" class="sys-msg" style="margin-top: 1rem;"></p>
    `;
    sections['experiencia'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // EXPERIENCIA LABORAL</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-experience">GUARDAR EXPERIENCIA</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_EXPERIENCIA</div>
            <textarea id="experience-list" style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Cargo | Empresa | Duración | Descripción"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Cargo | Empresa | Duración | Descripción (Una por línea).</p>
        </div>
        <p id="save-msg-exp" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['educacion'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // EDUCACIÓN</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-education">GUARDAR EDUCACIÓN</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_EDUCACIÓN</div>
            <textarea id="education-list" style="width: 100%; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Título | Institución | Duración"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Título | Institución | Duración (Una por línea).</p>
        </div>
        <p id="save-msg-edu" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['idiomas'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // IDIOMAS</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-languages">GUARDAR IDIOMAS</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_IDIOMAS</div>
            <textarea id="languages-list" style="width: 100%; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Idioma | Nivel"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Idioma | Nivel (Una por línea).</p>
        </div>
        <p id="save-msg-lang" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['redes'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // REDES SOCIALES</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-social">GUARDAR REDES</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_REDES</div>
            <textarea id="social-list" style="width: 100%; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Ejemplo: LinkedIn | https://linkedin.com/in/tuusuario"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Plataforma | URL (Una por línea).</p>
        </div>
        <p id="save-msg-social" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['capacitaciones'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // CAPACITACIONES</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-training">GUARDAR CAPACITACIONES</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_CAPACITACIONES</div>
            <textarea id="training-list" style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Curso | Institución | Duración | Descripción"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Curso | Institución | Duración | Descripción (Una por línea).</p>
        </div>
        <p id="save-msg-training" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['referencias'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // REFERENCIAS PERSONALES</h2>
            <div class="dashboard-actions">
                <button class="btn-primary" id="save-references">GUARDAR REFERENCIAS</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">▸ EDITOR_DE_REFERENCIAS</div>
            <textarea id="references-list" style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; font-family: var(--font-body); margin-top: 1rem;" placeholder="Nombre | Relación | Teléfono | Email"></textarea>
            <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem;">Formato: Nombre | Relación | Teléfono | Email (Una por línea).</p>
        </div>
        <p id="save-msg-references" class="sys-msg" style="margin-top: 1rem;"></p>
    `;

    sections['configuracion'] = `
        <div class="dashboard-header">
            <h2>PANEL DE CONTROL // CONFIGURACIÓN</h2>
        </div>
        <div class="card">
            <div class="card-header">▸ AJUSTES_SISTEMA</div>
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>NOTIFICACIONES EMAIL</span>
                    <input type="checkbox" checked>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>PERFIL PÚBLICO</span>
                    <input type="checkbox">
                </div>
                <button class="btn-secondary" style="margin-top: 1rem; color: #f44336; border-color: #f44336;">ELIMINAR CUENTA</button>
            </div>
        </div>
    `;

    // Logic for loading and saving
    async function loadExperience() {
        const data = await apiRequest('/api/cv/experience');
        if (data && document.getElementById('experience-list')) {
            document.getElementById('experience-list').value = data.map(e => `${e.position} | ${e.company} | ${e.duration} | ${e.description}`).join('\n');
        }
    }

    async function saveExperience() {
        const list = document.getElementById('experience-list').value;
        const experiences = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [position, company, duration, description] = line.split('|').map(s => s.trim());
            return { position, company, duration, description };
        });
        const msg = document.getElementById('save-msg-exp');
        msg.textContent = '> GUARDANDO EXPERIENCIA...';
        const res = await apiRequest('/api/cv/experience', 'POST', { experiences });
        if (res) {
            msg.textContent = '> EXPERIENCIA ACTUALIZADA.';
            msg.style.color = 'var(--accent)';
        }
    }

    async function loadEducation() {
        const data = await apiRequest('/api/cv/education');
        if (data && document.getElementById('education-list')) {
            document.getElementById('education-list').value = data.map(e => `${e.degree} | ${e.institution} | ${e.duration}`).join('\n');
        }
    }

    async function saveEducation() {
        const list = document.getElementById('education-list').value;
        const education = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [degree, institution, duration] = line.split('|').map(s => s.trim());
            return { degree, institution, duration };
        });
        const msg = document.getElementById('save-msg-edu');
        msg.textContent = '> GUARDANDO EDUCACIÓN...';
        const res = await apiRequest('/api/cv/education', 'POST', { education });
        if (res) {
            msg.textContent = '> EDUCACIÓN ACTUALIZADA.';
            msg.style.color = 'var(--accent)';
        }
    }

    async function loadLanguages() {
        const data = await apiRequest('/api/cv/languages');
        if (data && document.getElementById('languages-list')) {
            document.getElementById('languages-list').value = data.map(l => `${l.language_name} | ${l.level}`).join('\n');
        }
    }

    async function saveLanguages() {
        const list = document.getElementById('languages-list').value;
        const languages = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [language_name, level] = line.split('|').map(s => s.trim());
            return { language_name, level };
        });
        const msg = document.getElementById('save-msg-lang');
        msg.textContent = '> GUARDANDO IDIOMAS...';
        const res = await apiRequest('/api/cv/languages', 'POST', { languages });
        if (res) {
            msg.textContent = '> IDIOMAS ACTUALIZADOS.';
            msg.style.color = 'var(--accent)';
        }
    }

    // Social Logic
    async function loadSocial() {
        const data = await apiRequest('/api/cv/social');
        if (data && document.getElementById('social-list')) {
            document.getElementById('social-list').value = data.map(n => `${n.platform} | ${n.url}`).join('\n');
        }
    }

    async function saveSocial() {
        const list = document.getElementById('social-list').value;
        const networks = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [platform, url] = line.split('|').map(s => s.trim());
            return { platform, url };
        });
        const msg = document.getElementById('save-msg-social');
        msg.textContent = '> GUARDANDO REDES...';
        const res = await apiRequest('/api/cv/social', 'POST', { networks });
        if (res) {
            msg.textContent = '> REDES SOCIALES ACTUALIZADAS.';
            msg.style.color = 'var(--accent)';
        }
    }

    // Training Logic
    async function loadTraining() {
        const data = await apiRequest('/api/cv/training');
        if (data && document.getElementById('training-list')) {
            document.getElementById('training-list').value = data.map(t => `${t.course_name} | ${t.institution} | ${t.duration} | ${t.description}`).join('\n');
        }
    }

    async function saveTraining() {
        const list = document.getElementById('training-list').value;
        const training = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [course_name, institution, duration, description] = line.split('|').map(s => s.trim());
            return { course_name, institution, duration, description };
        });
        const msg = document.getElementById('save-msg-training');
        msg.textContent = '> GUARDANDO CAPACITACIONES...';
        const res = await apiRequest('/api/cv/training', 'POST', { training });
        if (res) {
            msg.textContent = '> CAPACITACIONES ACTUALIZADAS.';
            msg.style.color = 'var(--accent)';
        }
    }

    // References Logic
    async function loadReferences() {
        const data = await apiRequest('/api/cv/references');
        if (data && document.getElementById('references-list')) {
            document.getElementById('references-list').value = data.map(r => `${r.ref_name} | ${r.relationship} | ${r.phone} | ${r.email}`).join('\n');
        }
    }

    async function saveReferences() {
        const list = document.getElementById('references-list').value;
        const references = list.split('\n').filter(line => line.trim() !== '').map(line => {
            const [ref_name, relationship, phone, email] = line.split('|').map(s => s.trim());
            return { ref_name, relationship, phone, email };
        });
        const msg = document.getElementById('save-msg-references');
        msg.textContent = '> GUARDANDO REFERENCIAS...';
        const res = await apiRequest('/api/cv/references', 'POST', { references });
        if (res) {
            msg.textContent = '> REFERENCIAS ACTUALIZADAS.';
            msg.style.color = 'var(--accent)';
        }
    }
    async function loadPersonalData() {
        const data = await apiRequest('/api/cv/personal');
        if (data) {
            if (document.getElementById('cv-full-name')) document.getElementById('cv-full-name').value = data.full_name || '';
            if (document.getElementById('cv-email')) document.getElementById('cv-email').value = data.email || '';
            if (document.getElementById('cv-phone')) document.getElementById('cv-phone').value = data.phone || '';
            if (document.getElementById('cv-location')) document.getElementById('cv-location').value = data.location || '';
        }
    }

    async function savePersonalData() {
        const full_name = document.getElementById('cv-full-name').value;
        const email = document.getElementById('cv-email').value;
        const phone = document.getElementById('cv-phone').value;
        const location = document.getElementById('cv-location').value;
        const msg = document.getElementById('save-msg');

        msg.textContent = '> GUARDANDO...';
        const res = await apiRequest('/api/cv/personal', 'POST', { full_name, email, phone, location });
        if (res) {
            msg.textContent = '> DATOS ACTUALIZADOS CORRECTAMENTE.';
            msg.style.color = 'var(--accent)';
        }
    }

    async function loadSkills() {
        const skills = await apiRequest('/api/cv/skills');
        if (skills) {
            const list = skills.map(s => s.skill_name).join('\n');
            if (document.getElementById('skills-list')) {
                document.getElementById('skills-list').value = list;
                updateSkillsPreview(list);
            }
        }
    }

    function updateSkillsPreview(list) {
        const preview = document.getElementById('skills-preview');
        if (!preview) return;
        const items = list.split('\n').filter(s => s.trim() !== '');
        preview.innerHTML = items.map(s => `<span class="highlight" style="display:inline-block; margin-right: 10px; margin-bottom: 5px;">[${s.toUpperCase()}]</span>`).join('');
    }

    async function saveSkills() {
        const list = document.getElementById('skills-list').value;
        const skills = list.split('\n').filter(s => s.trim() !== '').map(s => ({ skill_name: s.trim(), category: 'General' }));
        const msg = document.getElementById('save-msg-skills');

        msg.textContent = '> GUARDANDO HABILIDADES...';
        const res = await apiRequest('/api/cv/skills', 'POST', { skills });
        if (res) {
            msg.textContent = '> HABILIDADES ACTUALIZADAS.';
            msg.style.color = 'var(--accent)';
        }
    }

    async function loadSoftSkills() {
        const skills = await apiRequest('/api/cv/soft-skills');
        if (skills) {
            const list = skills.map(s => s.skill_name).join('\n');
            if (document.getElementById('soft-skills-list')) {
                document.getElementById('soft-skills-list').value = list;
                updateSoftSkillsPreview(list);
            }
        }
    }

    function updateSoftSkillsPreview(list) {
        const preview = document.getElementById('soft-skills-preview');
        if (!preview) return;
        const items = list.split('\n').filter(s => s.trim() !== '');
        preview.innerHTML = items.map(s => `<span class="highlight" style="display:inline-block; margin-right: 10px; margin-bottom: 5px; color: var(--accent);">[${s.toUpperCase()}]</span>`).join('');
    }

    async function saveSoftSkills() {
        const list = document.getElementById('soft-skills-list').value;
        const skills = list.split('\n').filter(s => s.trim() !== '').map(s => ({ skill_name: s.trim() }));
        const msg = document.getElementById('save-msg-soft-skills');

        msg.textContent = '> GUARDANDO HABILIDADES BLANDAS...';
        const res = await apiRequest('/api/cv/soft-skills', 'POST', { skills });
        if (res) {
            msg.textContent = '> HABILIDADES BLANDAS ACTUALIZADAS.';
            msg.style.color = 'var(--accent)';
        }
    }

    function switchSection(sectionId) {
        if (!sections[sectionId]) return;

        // Update active state in sidebar
        sidebarItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-section") === sectionId) {
                item.classList.add("active");
            }
        });

        // Add a "loading" effect similar to terminal
        dashboardContent.innerHTML = `
            <div class="hero-terminal" style="margin: 2rem auto; max-width: 400px;">
                <div class="terminal-body">
                    <p class="sys-msg">> ACCEDIENDO A SECCIÓN: ${sectionId.toUpperCase()}...</p>
                    <p class="sys-msg">> CARGANDO MÓDULOS...</p>
                    <p class="sys-msg highlight animate-pulse">_</p>
                </div>
            </div>
        `;

        setTimeout(async () => {
            dashboardContent.innerHTML = sections[sectionId];

            // Initial load for specific sections
            if (sectionId === 'mi-curriculum') {
                initDashboardButtons();
            } else if (sectionId === 'datos-personales') {
                await loadPersonalData();
                document.getElementById('save-personal').addEventListener('click', savePersonalData);
            } else if (sectionId === 'habilidades') {
                await loadSkills();
                document.getElementById('save-skills').addEventListener('click', saveSkills);
                document.getElementById('skills-list').addEventListener('input', (e) => updateSkillsPreview(e.target.value));
            } else if (sectionId === 'soft-skills') {
                await loadSoftSkills();
                document.getElementById('save-soft-skills').addEventListener('click', saveSoftSkills);
                document.getElementById('soft-skills-list').addEventListener('input', (e) => updateSoftSkillsPreview(e.target.value));
            } else if (sectionId === 'experiencia') {
                await loadExperience();
                document.getElementById('save-experience').addEventListener('click', saveExperience);
            } else if (sectionId === 'educacion') {
                await loadEducation();
                document.getElementById('save-education').addEventListener('click', saveEducation);
            } else if (sectionId === 'idiomas') {
                await loadLanguages();
                document.getElementById('save-languages').addEventListener('click', saveLanguages);
            } else if (sectionId === 'redes') {
                await loadSocial();
                document.getElementById('save-social').addEventListener('click', saveSocial);
            } else if (sectionId === 'capacitaciones') {
                await loadTraining();
                document.getElementById('save-training').addEventListener('click', saveTraining);
            } else if (sectionId === 'referencias') {
                await loadReferences();
                document.getElementById('save-references').addEventListener('click', saveReferences);
            }
        }, 600);
    }

    sidebarItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute("data-section");
            if (sectionId) switchSection(sectionId);
        });
    });

    // --- TERMINAL SIMULATION LOGIC ---
    const terminalBody = document.getElementById("terminal-body");
    const progressSpan = document.getElementById("progress-1");

    if (terminalBody && progressSpan) {
        const messages = [
            "> ACCEDIENDO A BASE DE DATOS...",
            "> LEYENDO PARÁMETROS DE LA OFERTA...",
            "> INICIANDO AGENTE OPTIMIZADOR...",
            "> APLICANDO MEJORAS DE FORMATO..."
        ];

        let msgIndex = 0;

        function addMessage() {
            if (msgIndex < messages.length) {
                const p = document.createElement("p");
                p.className = "sys-msg";
                p.textContent = messages[msgIndex];

                // Insert before progress bar
                const progressBar = document.querySelector(".progress-bar");
                terminalBody.insertBefore(p, progressBar);

                msgIndex++;
                setTimeout(addMessage, 1000 + Math.random() * 1000);
            } else {
                simulateProgress();
            }
        }

        setTimeout(addMessage, 1500);

        function simulateProgress() {
            let percent = 0;
            const totalBlocks = 14;

            const interval = setInterval(() => {
                percent += Math.floor(Math.random() * 5) + 1;
                if (percent >= 100) {
                    percent = 100;
                    clearInterval(interval);

                    setTimeout(() => {
                        const p = document.createElement("p");
                        p.className = "sys-msg";
                        p.style.color = "var(--accent)"; // Adapts to theme
                        p.textContent = "> OPTIMIZACIÓN COMPLETADA. RESULTADO: 98% MATCH.";
                        terminalBody.appendChild(p);
                    }, 500);
                }

                const filledBlocks = Math.floor((percent / 100) * totalBlocks);
                const emptyBlocks = totalBlocks - filledBlocks;

                const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
                progressSpan.textContent = `[${bar}] ${percent}%`;

            }, 150);
        }
    }

    // --- CV GENERATION & PDF LOGIC ---
    async function generateCV() {
        const data = await apiRequest('/api/cv/full');
        if (!data) return;

        const { personal, skills, soft_skills, experience, education, languages, social, training, references } = data;

        const cvHtml = `
            <div id="cv-template" style="background: white; color: #333; padding: 40px; font-family: 'Arial', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <header style="border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 2.5rem; text-transform: uppercase; letter-spacing: 2px;">${personal.full_name || 'TU NOMBRE'}</h1>
                    <p style="margin: 5px 0; font-size: 1rem; color: #666;">
                        ${personal.email || ''} | ${personal.phone || ''} | ${personal.location || ''}
                    </p>
                    <div style="margin-top: 10px;">
                        ${social.map(s => `<a href="${s.url}" style="color: #333; text-decoration: none; margin: 0 10px; font-size: 0.9rem;">${s.platform} ${s.url}</a>`).join(' | ')}
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px;">
                    <div class="main-col">
                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Experiencia Laboral</h3>
                            ${experience.map(exp => `
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                        <span>${exp.position}</span>
                                        <span>${exp.duration}</span>
                                    </div>
                                    <div style="font-style: italic; color: #555; margin-bottom: 5px;">${exp.company}</div>
                                    <p style="margin: 0; font-size: 0.95rem;">${exp.description}</p>
                                </div>
                            `).join('')}
                        </section>

                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Educación</h3>
                            ${education.map(edu => `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                        <span>${edu.degree}</span>
                                        <span>${edu.duration}</span>
                                    </div>
                                    <div style="color: #555;">${edu.institution}</div>
                                </div>
                            `).join('')}
                        </section>

                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Capacitaciones y Cursos</h3>
                            ${training && training.length > 0 ? training.map(t => `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                        <span>${t.course_name}</span>
                                        <span>${t.duration}</span>
                                    </div>
                                    <div style="font-style: italic; color: #555;">${t.institution}</div>
                                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${t.description || ''}</p>
                                </div>
                            `).join('') : '<p style="font-size: 0.9rem; color: #999;">No hay capacitaciones registradas.</p>'}
                        </section>
                    </div>

                    <div class="side-col">
                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Habilidades Técnicas</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                ${skills.map(s => `<span style="background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 0.85rem;">${s.skill_name}</span>`).join('')}
                            </div>
                        </section>

                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Habilidades Blandas</h3>
                            <ul style="padding-left: 20px; margin: 0; font-size: 0.9rem;">
                                ${soft_skills.map(s => `<li>${s.skill_name}</li>`).join('')}
                            </ul>
                        </section>

                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Idiomas</h3>
                            ${languages.map(l => `
                                <div style="font-size: 0.9rem; margin-bottom: 5px;">
                                    <strong>${l.language_name}:</strong> ${l.level}
                                </div>
                            `).join('')}
                        </section>

                        <section style="margin-bottom: 30px;">
                            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem;">Referencias</h3>
                            ${references && references.length > 0 ? references.map(r => `
                                <div style="font-size: 0.85rem; margin-bottom: 10px; line-height: 1.2;">
                                    <div style="font-weight: bold;">${r.ref_name}</div>
                                    <div style="color: #666;">${r.relationship}</div>
                                    <div>Tel: ${r.phone}</div>
                                    <div>${r.email}</div>
                                </div>
                            `).join('') : '<p style="font-size: 0.85rem; color: #999;">Disponibles bajo solicitud.</p>'}
                        </section>
                    </div>
                </div>
            </div>
        `;

        // Update dashboard content with preview
        const mainContent = document.querySelector(".dashboard-content");
        mainContent.innerHTML = `
            <div class="dashboard-header">
                <h2>VISTA PREVIA DE CURRÍCULUM</h2>
                <div class="dashboard-actions">
                    <button class="btn-secondary" id="back-to-dash">VOLVER AL PANEL</button>
                    <button class="btn-primary" id="download-pdf-now">DESCARGAR PDF</button>
                </div>
            </div>
            <div class="cv-preview-container" style="background: var(--bg-secondary); padding: 20px; border-radius: 8px; margin-top: 20px; overflow-y: auto; max-height: 80vh;">
                ${cvHtml}
            </div>
        `;

        document.getElementById('back-to-dash').addEventListener('click', () => {
            switchSection('mi-curriculum');
        });

        document.getElementById('download-pdf-now').addEventListener('click', () => {
            downloadPDF();
        });
    }

    function downloadPDF() {
        const element = document.getElementById('cv-template');
        if (!element) {
            alert('Primero debes generar el CV.');
            return;
        }

        const opt = {
            margin: 0,
            filename: 'Mi_Curriculum.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // New Promise-based usage:
        html2pdf().set(opt).from(element).save();
    }

    // Initialize buttons if on dashboard home
    function initDashboardButtons() {
        const genBtn = document.getElementById('generate-cv-btn');
        const dlBtn = document.getElementById('download-pdf-btn');

        if (genBtn) genBtn.addEventListener('click', generateCV);
        if (dlBtn) dlBtn.addEventListener('click', () => {
            // If we are not in preview, we generate first then download
            generateCV().then(() => {
                setTimeout(downloadPDF, 500);
            });
        });
    }

    initDashboardButtons();
});
