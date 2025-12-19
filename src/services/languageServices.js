const languageModel = require('../models/languageModel')
const { param } = require('../routes/languageRoutes')

const createLanguage= async (data)=>{
    if(!data.code || !data.name_en || !data.native_name || !data.direction){
        throw new Error('missing_required_fields')
    }
    return await languageModel.createLanguage(data)
}

const getAllLanguages= async ()=>{
    return await languageModel.findAllLanguages()
}

const getLanguageById= async (params) => {
    const language= await languageModel.findById(params)
    if(!language){
        throw new Error('language_not_found')
    }
    return language
}

const updateLanguage= async (params, data) => {
    await getLanguageById(params)
    return await languageModel.updateLanguage(params, data)    
}

const deleteLanguage= async (params) => {   
    console.log('Service layer: Deleting language with params:', params.id);
    await getLanguageById(params)
    return await languageModel.deleteLanguage(params)
}

module.exports={
    createLanguage,
    getAllLanguages,
    getLanguageById,
    updateLanguage,
    deleteLanguage
}