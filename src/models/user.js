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

const markOnline = async (user_id) => {
  try {
    const [result] = await db.execute(
      `
      UPDATE user
      SET is_online = 1,
          last_seen = NOW()
      WHERE user_id = ?
      `,
      [user_id]
    );

    console.log("markOnline result:", result);
    console.log("affectedRows:", result.affectedRows);

  } catch (err) {
    console.error("markOnline error:", err);
  }
};


const markOffline = async (user_id) => {
  await db.execute(
    `
    UPDATE user
    SET is_online = 0,
        last_seen = NOW()
    WHERE user_id = ?
    `,
    [user_id]
  );
};


// const findByMobileAndOtp= async (mobile_number, otp) => {
//     const [rows] =await db.execute('SELECT * from user WHERE mobile_number=? AND otp=?',
//         [mobile_number, otp]
//     )
//     return rows[0]
// }

// const createOrUpdateOtp = async (mobile_number, otp) => {
//     await db.execute('INSERT INTO user (mobile_number, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp=?',
//         [mobile_number, otp, otp]
//     )
// }

const findByMobileAndOtp = async (mobile_number, otp) => {
  const [rows] = await db.execute(
    `SELECT * FROM user 
     WHERE mobile_number = ? 
     AND otp = ?
     AND otp_expires_at > NOW()`,
    [mobile_number, otp]
  );

  return rows[0];
};


const createOrUpdateOtp = async (mobile_number, otp) => {
  await db.execute(
    `INSERT INTO user (mobile_number, otp, otp_expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 SECOND))
     ON DUPLICATE KEY UPDATE 
       otp = VALUES(otp),
       otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 SECOND)`,
    [mobile_number, otp]
  );
};

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

// 🔹 Check if state belongs to country
const isValidStateForCountry = async (state_id, country_id) => {
  const [rows] = await db.execute(
    "SELECT id FROM states WHERE id = ? AND country_id = ?",
    [state_id, country_id]
  );
  return rows.length > 0;
};

// 🔹 Check if city belongs to state
const isValidCityForState = async (city_id, state_id) => {
  const [rows] = await db.execute(
    "SELECT id FROM cities WHERE id = ? AND state_id = ?",
    [city_id, state_id]
  );
  return rows.length > 0;
};


// 🔹 Check if username already exists (except current user)
const isUsernameTaken = async (username, user_id) => {
  const [rows] = await db.execute(
    "SELECT user_id FROM user WHERE username = ? AND user_id != ? LIMIT 1",
    [username, user_id]
  );
  return rows.length > 0;
};


const getProfileById=async (user_id) => {
     const [rows] = await db.execute(
    `
    SELECT user_id, name, username, mobile_number, email, age, date_of_birth,
           gender, bio, profile_status, status, coin_balance, location_lat,
           location_log, is_online, last_seen
    FROM user
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

const getRandomOnlineOppositeGenderUser = async (currentUserId) => {
  const [[me]] = await db.execute(
    `SELECT gender FROM user WHERE user_id=?`,
    [currentUserId]
  );

  if (!me || !me.gender) return null;

  const targetGender = me.gender === "Male" ? "Female" : "Male";

  const [rows] = await db.execute(
    `
    SELECT user_id, name
    FROM user
    WHERE user_id != ?
      AND is_online = 1
      AND gender = ?
      AND status = 'active'
    ORDER BY RAND()
    LIMIT 10
    `,
    [currentUserId, targetGender]
  );

  return rows[0] || null;
};

const getNearestOnlineFemale = async (userId) => {
  const [[me]] = await db.execute(
    `SELECT location_lat, location_log FROM user WHERE user_id=?`,
    [userId]
  );

  if (!me?.location_lat || !me?.location_log) return null;

  const [rows] = await db.execute(
    `
    SELECT user_id, name,
    (
      6371 * acos(
        cos(radians(?)) *
        cos(radians(location_lat)) *
        cos(radians(location_log) - radians(?)) +
        sin(radians(?)) *
        sin(radians(location_lat))
      )
    ) AS distance
    FROM user
    WHERE gender = 'Female'
      AND is_online = 1
      AND status = 'active'
      AND location_lat IS NOT NULL
      AND location_log IS NOT NULL
    HAVING distance < 50
    ORDER BY distance
    LIMIT 1
    `,
    [me.location_lat, me.location_log, me.location_lat]
  );

  return rows[0] || null;
};


const rewardProfileVerification = async (user_id) => {
  const conn = await db.getConnection();
  console.log("Rewarding profile verification for user_id:", user_id);
  try {
    await conn.beginTransaction();

    const [[user]] = await conn.execute(
      `SELECT gender, profile_status, avatar_id FROM user WHERE user_id=? FOR UPDATE`,
      [user_id]
    );

    if (!user || user.profile_status === "verified" || !user.avatar_id) {
      await conn.rollback();
      return false;
    }

    const reward = user.gender === "Female" ? 20 : 50;

    await conn.execute(
      `
      UPDATE user
      SET coin_balance = coin_balance + ?,
          profile_status = 'verified',
          status = 'active'
      WHERE user_id=?
      `,
      [reward, user_id]
    );

    await conn.commit();
    return reward;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

const getNearestOnlineFemaleForMale = async (maleUserId, radiusKm = 50) => {
  // Get male location
  const [[male]] = await db.execute(
    `SELECT location_lat, location_log, gender
     FROM user
     WHERE user_id = ?`,
    [maleUserId]
  );

  if (!male || male.gender !== "Male") return null;
  if (male.location_lat === null || male.location_log === null) return null;

  const [rows] = await db.execute(
    `
    SELECT 
      user_id,
      name,
      location_lat,
      location_log,
      (
        6371 * acos(
          cos(radians(?)) *
          cos(radians(location_lat)) *
          cos(radians(location_log) - radians(?)) +
          sin(radians(?)) *
          sin(radians(location_lat))
        )
      ) AS distance
    FROM user
    WHERE gender = 'Female'
      AND is_online = 1
      AND status = 'active'
      AND location_lat IS NOT NULL
      AND location_log IS NOT NULL
    HAVING distance <= ?
    ORDER BY distance ASC
    LIMIT 1
    `,
    [
      male.location_lat,
      male.location_log,
      male.location_lat,
      radiusKm
    ]
  );

  return rows[0] || null;
};

const getRandomOnlineSearchingFemalesWithAvatar = async (limit = 20) => {
  limit = Number(limit); // 🔥 IMPORTANT

  const [rows] = await db.execute(
    `
    SELECT 
      u.user_id,
      u.name,
      cs.type AS call_type,
      a.avatar_id,
      a.image_url AS avatar_url
    FROM user u
    INNER JOIN call_sessions cs
      ON cs.caller_id = u.user_id
    LEFT JOIN avatars a
      ON a.avatar_id = u.avatar_id
    WHERE u.gender = 'Female'
      AND u.is_online = 1
      AND cs.status = 'SEARCHING'
    ORDER BY RAND()
    LIMIT ${limit}
    `
  );

  return rows;
};




module.exports={
    createUserIfNotExist,
    findByMobile,
    rewardProfileVerification,
    getNearestOnlineFemaleForMale,
    findByMobileAndOtp,
    getRandomOnlineOppositeGenderUser,
    createOrUpdateOtp,
    getNearestOnlineFemale,
    clearOtp,
    findById,
    updateProfile,
    updateCoinBalance,
    getAllUsers,
    isValidStateForCountry,
    isValidCityForState,
    isUsernameTaken,
    deleteUserId,
    getRandomUsers,
    getProfileById,
    isUserOnline,
    markOffline,
    markOnline,
    getRandomOnlineUser,
    getRandomOnlineSearchingFemalesWithAvatar
}