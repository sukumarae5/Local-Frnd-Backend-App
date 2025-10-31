const db=require("../config/db")

const findByMobile = async (mobile_number) => {
    console.log("Finding user by mobile number:", mobile_number);
    const [rows]=await db.execute('SELECT * from user WHERE mobile_number=?',
        [mobile_number]
    )
    return rows[0]
}

const createUserIfNotExist = async (mobile_number) => {
  const [result] = await db.execute(
    "INSERT IGNORE INTO user (mobile_number) VALUES (?)",
    [mobile_number]
  );
  return result;
};

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

const findById=async (id) => {
    const [rows]=await db.execute(`SELECT * from user WHERE user_id=?`, [id])
    return rows[0]    
}

const updateProfile =async (user_id, userData) => {
    const fields =[]
    const values=[]
    for (const key in userData){
        fields.push(`${key}=?`);
        values.push(userData[key])
    }
    if (fields.length === 0) {
        return { affectedRows: 0 };
    }
    values.push(user_id)
    const [result]= await db.execute(`UPDATE user SET ${fields.join(`, `)} WHERE user_id=?`, values)
    return result
}


const getAllUsers= async () => {
    const [rows] =await db.execute('SELECT * from user')
    return rows

} 

const deleteUserId= async (user_id) => {
    const [result]=await db.execute('DELETE from user WHERE user_id=?', [user_id])
    return result
}

module.exports={
    createUserIfNotExist,
    findByMobile,
    findByMobileAndOtp,
    createOrUpdateOtp,
    clearOtp,
    findById,
    updateProfile,
    getAllUsers,
    deleteUserId
}