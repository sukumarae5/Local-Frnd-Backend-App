const languageServices = require('../services/languageServices')

exports.createLanguage= async (req, res) => {
    try{
        const data= req.body
        const result= await languageServices.createLanguage(data)
        res.status(201).json({success: true, message: 'language added successfuly', data: result})
    }
    catch(err){
        res.status(400).json({success: false, error: err.message})
    }

}



exports.getAllLanguages = async(req, res)=>{
    try{
        const languages= await languageServices.getAllLanguages()
        res.status(200).json({success: true, data: languages})
    }
    catch(err){
        res.status(400).json({success: false, error: err.message})
    }
}

exports.getLanguage = async (req, res) => {
    try {
        const language= await languageServices.getLanguageById(req.params)
        res.status(200).json({success: true, data: language})
    } catch (error) {
        res.status(404).json({success: false, error: error.message})
    }
}


exports.updateLanguage= async (req, res) => {
    try {
        console.log('Updating language with id:', req.params);
        console.log('Update data:', req.body);  
        await languageServices.updateLanguage(req.params, req.body)
        res.status(200).json({success: true, message: 'language updated successfuly'})
    } catch (error) {
        res.status(400).json({success: false, error: error.message})
    }
}

exports.deleteLanguage= async (req, res) => {
    try {       
        console.log('Deleting language with id:', req.params);
        await languageServices.deleteLanguage(req.params)
        res.status(200).json({success: true, message: 'language deleted successfuly'})
    } catch (error) {
        res.status(400).json({success: false, error: error.message})
    }
}
