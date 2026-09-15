const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const verifyToken = require('../middlewares/authMiddleware');
const { personalDataValidator } = require('../middlewares/validators/cvValidator');

// Todas las rutas de CV requieren autenticación mediante JWT
router.use(verifyToken);

// Personal Data
router.get('/personal', cvController.getPersonal);
router.post('/personal', personalDataValidator, cvController.savePersonal);

// Skills
router.get('/skills', cvController.getSkills);
router.post('/skills', cvController.saveSkills);

// Soft Skills
router.get('/soft-skills', cvController.getSoftSkills);
router.post('/soft-skills', cvController.saveSoftSkills);

// Experience
router.get('/experience', cvController.getExperience);
router.post('/experience', cvController.saveExperience);

// Education
router.get('/education', cvController.getEducation);
router.post('/education', cvController.saveEducation);

// Languages
router.get('/languages', cvController.getLanguages);
router.post('/languages', cvController.saveLanguages);

// Social Networks
router.get('/social', cvController.getSocial);
router.post('/social', cvController.saveSocial);

// Training
router.get('/training', cvController.getTraining);
router.post('/training', cvController.saveTraining);

// Personal References
router.get('/references', cvController.getReferences);
router.post('/references', cvController.saveReferences);

// Full CV
router.get('/full', cvController.getFullCv);

module.exports = router;
