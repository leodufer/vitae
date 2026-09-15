const cvModel = require('../models/cvModel');

const cvController = {
    // Personal Data
    async getPersonal(req, res) {
        try {
            const data = await cvModel.getPersonalData(req.user.id);
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener datos personales.' });
        }
    },

    async savePersonal(req, res) {
        try {
            const { full_name, email, phone, location } = req.body;
            await cvModel.savePersonalData(req.user.id, { full_name, email, phone, location });
            res.json({ message: 'Datos personales guardados.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar datos personales.' });
        }
    },

    // Skills
    async getSkills(req, res) {
        try {
            const rows = await cvModel.getSkills(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener habilidades.' });
        }
    },

    async saveSkills(req, res) {
        try {
            const { skills } = req.body;
            await cvModel.saveSkills(req.user.id, skills);
            res.json({ message: 'Habilidades guardadas.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar habilidades.' });
        }
    },

    // Soft Skills
    async getSoftSkills(req, res) {
        try {
            const rows = await cvModel.getSoftSkills(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener habilidades blandas.' });
        }
    },

    async saveSoftSkills(req, res) {
        try {
            const { skills } = req.body;
            await cvModel.saveSoftSkills(req.user.id, skills);
            res.json({ message: 'Habilidades blandas guardadas.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar habilidades blandas.' });
        }
    },

    // Experience
    async getExperience(req, res) {
        try {
            const rows = await cvModel.getExperience(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener experiencia.' });
        }
    },

    async saveExperience(req, res) {
        try {
            const { experiences } = req.body;
            await cvModel.saveExperience(req.user.id, experiences);
            res.json({ message: 'Experiencia guardada.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar experiencia.' });
        }
    },

    // Education
    async getEducation(req, res) {
        try {
            const rows = await cvModel.getEducation(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener educación.' });
        }
    },

    async saveEducation(req, res) {
        try {
            const { education } = req.body;
            await cvModel.saveEducation(req.user.id, education);
            res.json({ message: 'Educación guardada.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar educación.' });
        }
    },

    // Languages
    async getLanguages(req, res) {
        try {
            const rows = await cvModel.getLanguages(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener idiomas.' });
        }
    },

    async saveLanguages(req, res) {
        try {
            const { languages } = req.body;
            await cvModel.saveLanguages(req.user.id, languages);
            res.json({ message: 'Idiomas guardados.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar idiomas.' });
        }
    },

    // Social Networks
    async getSocial(req, res) {
        try {
            const rows = await cvModel.getSocialNetworks(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener redes sociales.' });
        }
    },

    async saveSocial(req, res) {
        try {
            const { networks } = req.body;
            await cvModel.saveSocialNetworks(req.user.id, networks);
            res.json({ message: 'Redes sociales guardadas.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar redes sociales.' });
        }
    },

    // Training
    async getTraining(req, res) {
        try {
            const rows = await cvModel.getTraining(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener capacitaciones.' });
        }
    },

    async saveTraining(req, res) {
        try {
            const { training } = req.body;
            await cvModel.saveTraining(req.user.id, training);
            res.json({ message: 'Capacitaciones guardadas.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar capacitaciones.' });
        }
    },

    // Personal References
    async getReferences(req, res) {
        try {
            const rows = await cvModel.getReferences(req.user.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener referencias personales.' });
        }
    },

    async saveReferences(req, res) {
        try {
            const { references } = req.body;
            await cvModel.saveReferences(req.user.id, references);
            res.json({ message: 'Referencias personales guardadas.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al guardar referencias personales.' });
        }
    },

    // Full CV
    async getFullCv(req, res) {
        try {
            const cvData = await cvModel.getFullCv(req.user.id);
            res.json(cvData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el CV completo.' });
        }
    }
};

module.exports = cvController;
