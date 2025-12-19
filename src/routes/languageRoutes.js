const express= require('express')
const router= express.Router()
const languageController= require('../controllers/languageController')

router.post('/add', languageController.createLanguage)
router.get('/getlanguages', languageController.getAllLanguages)
router.get('/:id', languageController.getLanguage)
router.put('/updatelanguage/:id', languageController.updateLanguage)
router.delete('/:id', languageController.deleteLanguage)

module.exports= router;

