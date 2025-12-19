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
const updateCoinBalance = async (user_id, coins) => {
    const [result] = await db.execute(
        `UPDATE user SET coin_balance = coin_balance + ? WHERE user_id=?`,
        [coins, user_id]
    );
    return result;
};

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

const getRandomUsers = async (currentUserId) => {
  const [rows] = await db.execute(
    `
    SELECT 
      u.user_id,
      u.name,
      COALESCE(
        (
          SELECT photo_url
          FROM profile_photo
          WHERE user_id = u.user_id
            AND is_primary = 1
          LIMIT 1
        ), ""
      ) AS primary_image
    FROM user u
    WHERE u.user_id != ?
      AND u.is_online = 1
    ORDER BY RAND()
    LIMIT 20
    `,
    [currentUserId]
  );

  return rows;
};


const getProfileById=async (user_id) => {
     const [rows] = await db.execute(
    `
    SELECT user_id, name, username, mobile_number, email, age, date_of_birth,
           gender, bio, profile_status, status, coin_balance, location_lat,
           location_log, is_online, last_seen
    FROM users
    WHERE user_id = ?
    `,
    [user_id]
  );

  return rows[0] || null;
}

const isUserOnline = async (userId) => {
  const [rows] = await db.execute(
    `SELECT is_online FROM user WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows.length ? rows[0].is_online === 1 : false;
};

const getRandomOnlineUser = async (currentUserId) => {
  const [rows] = await db.execute(
    `
      SELECT user_id, name 
      FROM user
      WHERE user_id != ?
        AND is_online = 1
      ORDER BY RAND()
      LIMIT 1
    `,
    [currentUserId]
  );

  return rows[0] || null;
};


module.exports={
    createUserIfNotExist,
    findByMobile,
    findByMobileAndOtp,
    createOrUpdateOtp,
    clearOtp,
    findById,
    updateProfile,
    updateCoinBalance,
    getAllUsers,
    deleteUserId,
    getRandomUsers,
    getProfileById,
    isUserOnline,
    getRandomOnlineUser
}