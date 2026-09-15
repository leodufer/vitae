const pool = require('../config/db');

const cvModel = {
    // Personal Data
    async getPersonalData(userId) {
        const [rows] = await pool.query('SELECT * FROM personal_data WHERE user_id = ?', [userId]);
        return rows[0] || {};
    },

    async savePersonalData(userId, { full_name, email, phone, location }) {
        await pool.query(
            'INSERT INTO personal_data (user_id, full_name, email, phone, location) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = ?, email = ?, phone = ?, location = ?',
            [userId, full_name, email, phone, location, full_name, email, phone, location]
        );
    },

    // Skills
    async getSkills(userId) {
        const [rows] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveSkills(userId, skills) {
        await pool.query('DELETE FROM skills WHERE user_id = ?', [userId]);
        if (skills && skills.length > 0) {
            const values = skills.map(s => [userId, s.skill_name, s.category]);
            await pool.query('INSERT INTO skills (user_id, skill_name, category) VALUES ?', [values]);
        }
    },

    // Soft Skills
    async getSoftSkills(userId) {
        const [rows] = await pool.query('SELECT * FROM soft_skills WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveSoftSkills(userId, skills) {
        await pool.query('DELETE FROM soft_skills WHERE user_id = ?', [userId]);
        if (skills && skills.length > 0) {
            const values = skills.map(s => [userId, s.skill_name]);
            await pool.query('INSERT INTO soft_skills (user_id, skill_name) VALUES ?', [values]);
        }
    },

    // Experience
    async getExperience(userId) {
        const [rows] = await pool.query('SELECT * FROM experience WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveExperience(userId, experiences) {
        await pool.query('DELETE FROM experience WHERE user_id = ?', [userId]);
        if (experiences && experiences.length > 0) {
            const values = experiences.map(e => [userId, e.position, e.company, e.duration, e.description]);
            await pool.query('INSERT INTO experience (user_id, position, company, duration, description) VALUES ?', [values]);
        }
    },

    // Education
    async getEducation(userId) {
        const [rows] = await pool.query('SELECT * FROM education WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveEducation(userId, education) {
        await pool.query('DELETE FROM education WHERE user_id = ?', [userId]);
        if (education && education.length > 0) {
            const values = education.map(e => [userId, e.degree, e.institution, e.duration]);
            await pool.query('INSERT INTO education (user_id, degree, institution, duration) VALUES ?', [values]);
        }
    },

    // Languages
    async getLanguages(userId) {
        const [rows] = await pool.query('SELECT * FROM languages WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveLanguages(userId, languages) {
        await pool.query('DELETE FROM languages WHERE user_id = ?', [userId]);
        if (languages && languages.length > 0) {
            const values = languages.map(l => [userId, l.language_name, l.level]);
            await pool.query('INSERT INTO languages (user_id, language_name, level) VALUES ?', [values]);
        }
    },

    // Social Networks
    async getSocialNetworks(userId) {
        const [rows] = await pool.query('SELECT * FROM social_networks WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveSocialNetworks(userId, networks) {
        await pool.query('DELETE FROM social_networks WHERE user_id = ?', [userId]);
        if (networks && networks.length > 0) {
            const values = networks.map(n => [userId, n.platform, n.url]);
            await pool.query('INSERT INTO social_networks (user_id, platform, url) VALUES ?', [values]);
        }
    },

    // Training
    async getTraining(userId) {
        const [rows] = await pool.query('SELECT * FROM training WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveTraining(userId, training) {
        await pool.query('DELETE FROM training WHERE user_id = ?', [userId]);
        if (training && training.length > 0) {
            const values = training.map(t => [userId, t.course_name, t.institution, t.duration, t.description]);
            await pool.query('INSERT INTO training (user_id, course_name, institution, duration, description) VALUES ?', [values]);
        }
    },

    // Personal References
    async getReferences(userId) {
        const [rows] = await pool.query('SELECT * FROM personal_references WHERE user_id = ?', [userId]);
        return rows;
    },

    async saveReferences(userId, references) {
        await pool.query('DELETE FROM personal_references WHERE user_id = ?', [userId]);
        if (references && references.length > 0) {
            const values = references.map(r => [userId, r.ref_name, r.relationship, r.phone, r.email]);
            await pool.query('INSERT INTO personal_references (user_id, ref_name, relationship, phone, email) VALUES ?', [values]);
        }
    },

    // Get Full CV Data
    async getFullCv(userId) {
        const [personal] = await pool.query('SELECT * FROM personal_data WHERE user_id = ?', [userId]);
        const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
        const [soft_skills] = await pool.query('SELECT * FROM soft_skills WHERE user_id = ?', [userId]);
        const [experience] = await pool.query('SELECT * FROM experience WHERE user_id = ?', [userId]);
        const [education] = await pool.query('SELECT * FROM education WHERE user_id = ?', [userId]);
        const [languages] = await pool.query('SELECT * FROM languages WHERE user_id = ?', [userId]);
        const [social] = await pool.query('SELECT * FROM social_networks WHERE user_id = ?', [userId]);
        const [training] = await pool.query('SELECT * FROM training WHERE user_id = ?', [userId]);
        const [references] = await pool.query('SELECT * FROM personal_references WHERE user_id = ?', [userId]);

        return {
            personal: personal[0] || {},
            skills,
            soft_skills,
            experience,
            education,
            languages,
            social,
            training,
            references
        };
    }
};

module.exports = cvModel;
