const photoService= require("../services/photoServices")

exports.getAllPhotos = async (req, res) => {
  try {
    const result = await photoService.getAllPhotos();
    res.json({ success: true, photos: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPhotosByUserId= async (req, res) => {    
    try {
        const user_id= req.params.user_id       
        const result= await photoService.getPhotosByUserId(user_id)
        res.json(result)
    }

    catch (error) {
        res.status(500).json({success:false, message:error.message})
    }

}

exports.addPhoto= async (req, res) => {
    try {
        console.log(req.body)
        const user_id= req.params.user_id
        const {photo_url}= req.body 
        if (!photo_url) return res.status(400).json({ error: 'photo_url required' });
        const result= await photoService.addPhoto(user_id, photo_url)
        res.json(result)
    }

    catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
}

exports.updatePhotoUrl= async (req, res) => {
    try {
        console.log(req.body)
        const user_id= req.params.user_id
        const photo_id= req.params.photo_id
        const {photo_url, is_primary}= req.body 
        const result= await photoService.updatePhotoUrl(user_id, photo_id, {photo_url, is_primary})
        res.json(result)
    }
    catch (error) {
        res.status(500).json({success:false, message:error.message})
    }   
}

exports.deletePhotoById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const photo_id = req.params.photo_id;

    const result = await photoService.deletePhotoById(user_id, photo_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
