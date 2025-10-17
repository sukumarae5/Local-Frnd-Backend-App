const db=require("../config/db")

const findByMobile = async (mobile_number) => {
    const [rows]=await db.execute('SELECT * from user WHERE mobile_number=?',
        [mobile_number]
    )
    return rows[0]
}

const findByMobileAndOtp= async (mobile_number, otp) => {
    const [rows] =await db.execute('SELECT * from user WHERE mobile_number=? AND otp=?',
        [mobile_number, otp]
    )
    return rows[0]
}

const createOrUpdateOtp = async (mobile_number, otp) => {
    await db.execute('INSERT INTO user (mobile_number, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp=?',
        [mobile_number, otp, otp]
    )
}

const clearOtp = async (mobile_number) => {
    await db.execute('UPDATE user SET otp=NULL WHERE mobile_number=?',
        [mobile_number]
    )
}

const updateProfile =async (mobile_number, userData) => {
    const fields =[]
    const values=[]
    for (const key in userData){
        fields.push(`${key}=?`);
        values.push(userData[key])
    }
    if (fields.length === 0) {
        return;
    }
    values.push(mobile_number)
    const [result]= await db.execute(`UPDATE user SET ${fields.join(`, `)} WHERE mobile_number=?`, values)
    return result
}


const getAllUsers= async () => {
    const [rows] =await db.execute('SELECT * from user')
    return rows

} 

module.exports={
    findByMobile,
    findByMobileAndOtp,
    createOrUpdateOtp,
    clearOtp,
    updateProfile,
    getAllUsers
}