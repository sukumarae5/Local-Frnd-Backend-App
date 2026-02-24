
const db=require("../config/db")

exports.getUserProfile = async (userId) => {
  const [rows] = await db.execute(`
    
    SELECT 
  u.user_id,
  u.name,
  u.username,
  u.mobile_number,
  u.email,
  u.age,
  u.date_of_birth,
  u.gender,
  u.bio,
  u.profile_status,
  u.status,
  u.coin_balance,
  u.is_online,
  u.last_seen,
  u.location_lat,
  u.location_log,
  u.avg_rating,
  u.total_ratings,

  -- country / state / city
  c.id AS country_id,
  c.name AS country_name,
  s.id AS state_id,
  s.name AS state_name,
  ci.id AS city_id,
  ci.name AS city_name,

  -- avatar
  av.avatar_id,
  av.image_url AS avatar_url,

  -- language
lang.id           AS language_id,
lang.code         AS language_code,
lang.name_en      AS language_name_en,
lang.native_name  AS language_native_name,
lang.direction    AS language_direction,
lang.is_active    AS language_is_active,
lang.created_at   AS language_created_at,
lang.updated_at   AS language_updated_at,

  -- photos
  pp.photo_id,
  pp.photo_url,
  pp.is_primary,

  -- interests
  i.id AS interest_id,
  i.name AS interest_name,

  -- lifestyles
  -- lifestyles
lc.id   AS lifestyle_category_id,
lc.name AS lifestyle_category_name,

l.id    AS lifestyle_subcategory_id,
l.name  AS lifestyle_subcategory_name


FROM user u

LEFT JOIN countries c ON c.id = u.country_id
LEFT JOIN states s ON s.id = u.state_id
LEFT JOIN cities ci ON ci.id = u.city_id

LEFT JOIN avatars av ON av.avatar_id = u.avatar_id
LEFT JOIN profile_photo pp 
  ON pp.user_id = u.user_id AND pp.status = 'active'

LEFT JOIN user_interests ui ON ui.user_id = u.user_id
LEFT JOIN interests i ON i.id = ui.interest_id

LEFT JOIN user_lifestyles ul 
       ON ul.user_id = u.user_id

LEFT JOIN lifestyles l 
       ON l.id = ul.lifestyle_id

LEFT JOIN lifestyle_categories lc 
       ON lc.id = l.category_id

LEFT JOIN languages lang 
  ON lang.id = u.language_id

WHERE u.user_id = ?;

    `, [userId]);

  if (!rows.length) return null;

  const first = rows[0];

  // 🧍 USER
  const user = {
    user_id: first.user_id,
    name: first.name,
    username: first.username,
    mobile_number: first.mobile_number,
    email: first.email,
    age: first.age,
    date_of_birth: first.date_of_birth,
    gender: first.gender,
    bio: first.bio,
    profile_status: first.profile_status,
    status: first.status,
    coin_balance: first.coin_balance,
    is_online: first.is_online,
    last_seen: first.last_seen
  };

  // 📍 LOCATION
  const location = {
    country: first.country_id
      ? { id: first.country_id, name: first.country_name }
      : null,
    state: first.state_id
      ? { id: first.state_id, name: first.state_name }
      : null,
    city: first.city_id
      ? { id: first.city_id, name: first.city_name }
      : null,
    latitude: first.location_lat,
    longitude: first.location_log
  };

  // 🖼 PHOTOS
  const photosMap = new Map();
  rows.forEach(r => {
    if (r.photo_id && !photosMap.has(r.photo_id)) {
      photosMap.set(r.photo_id, {
        id: r.photo_id,
        url: r.photo_url,
        is_primary: r.is_primary
      });
    }
  });

  const photos = [...photosMap.values()];
  const primaryPhoto = photos.find(p => p.is_primary === 1) || null;

  // ❤️ AVATAR PRIORITY
  const profile_image =
    first.avatar_url || primaryPhoto?.url || null;

  const images = {
    avatar: first.avatar_url,
    profile_image,
    gallery: photos.filter(p => p.is_primary === 0).map(p => ({
      photo_id: p.id,
      photo_url: p.url
    }))
  };

  // 🌐 LANGUAGE
const language = first.language_id
  ? {
      id: first.language_id,
      code: first.language_code,
      name_en: first.language_name_en,
      native_name: first.language_native_name,
      direction: first.language_direction,
      is_active: first.language_is_active,
      created_at: first.language_created_at,
      updated_at: first.language_updated_at
    }
  : null;

  // 🎯 INTERESTS
  const interestMap = new Map();
  rows.forEach(r => {
    if (r.interest_id && !interestMap.has(r.interest_id)) {
      interestMap.set(r.interest_id, {
        id: r.interest_id,
        name: r.interest_name
      });
    }
  });

// 🌿 LIFESTYLES (category + subcategory)
const lifestyleMap = new Map();

rows.forEach(r => {
  if (r.lifestyle_subcategory_id) {

    const key = r.lifestyle_subcategory_id;

    if (!lifestyleMap.has(key)) {
      lifestyleMap.set(key, {
        category: {
          id: r.lifestyle_category_id,
          name: r.lifestyle_category_name
        },
        subcategory: {
          id: r.lifestyle_subcategory_id,
          name: r.lifestyle_subcategory_name
        }
      });
    }
  }
});


  return {
    user,
    location,
    language,
    images,
    interests: [...interestMap.values()],
    lifestyles: [...lifestyleMap.values()]
  };
};



exports.getPublicUserProfile = async (viewerId, userId) => {
  const [rows] = await db.execute(
    `
    SELECT 
      u.user_id,
      u.name,
      u.username,
      u.age,
      u.gender,
      u.bio,

      -- location
      c.name AS country_name,
      s.name AS state_name,
      ci.name AS city_name,

      -- avatar
      av.image_url AS avatar_url,

      -- photos
      pp.photo_id,
      pp.photo_url,
      pp.is_primary,

      -- interests
      i.id AS interest_id,
      i.name AS interest_name,

      -- lifestyles
      l.id AS lifestyle_id,
      l.name AS lifestyle_name

    FROM user u
    LEFT JOIN countries c ON c.id = u.country_id
    LEFT JOIN states s ON s.id = u.state_id
    LEFT JOIN cities ci ON ci.id = u.city_id

    LEFT JOIN avatars av ON av.avatar_id = u.avatar_id
    LEFT JOIN profile_photo pp 
      ON pp.user_id = u.user_id AND pp.status = 'active'

    LEFT JOIN user_interests ui ON ui.user_id = u.user_id
    LEFT JOIN interests i ON i.id = ui.interest_id

    LEFT JOIN user_lifestyles ul ON ul.user_id = u.user_id
    LEFT JOIN lifestyles l ON l.id = ul.lifestyle_id

    WHERE u.user_id = ?
      
    `,
    [userId]
  );

  if (!rows.length) return null;

  const first = rows[0];

  // 🖼 PHOTOS
  const photosMap = new Map();
  rows.forEach(r => {
    if (r.photo_id && !photosMap.has(r.photo_id)) {
      photosMap.set(r.photo_id, {
        id: r.photo_id,
        url: r.photo_url,
        is_primary: r.is_primary
      });
    }
  });

  const photos = [...photosMap.values()];
  const primaryPhoto = photos.find(p => p.is_primary === 1);

  // 🎯 INTERESTS
  const interestMap = new Map();
  rows.forEach(r => {
    if (r.interest_id && !interestMap.has(r.interest_id)) {
      interestMap.set(r.interest_id, {
        id: r.interest_id,
        name: r.interest_name
      });
    }
  });

  // 🌿 LIFESTYLES
  const lifestyleMap = new Map();
  rows.forEach(r => {
    if (r.lifestyle_id && !lifestyleMap.has(r.lifestyle_id)) {
      lifestyleMap.set(r.lifestyle_id, {
        id: r.lifestyle_id,
        name: r.lifestyle_name
      });
    }
  });

  return {
    user: {
      user_id: first.user_id,
      name: first.name,
      username: first.username,
      age: first.age,
      gender: first.gender,
      bio: first.bio
    },

    location: {
      country: first.country_name || null,
      state: first.state_name || null,
      city: first.city_name || null
    },

    images: {
      profile_image: first.avatar_url || primaryPhoto?.url || null,
      gallery: photos
        .filter(p => p.is_primary === 0)
        .map(p => p.url)
    },

    interests: [...interestMap.values()],
    lifestyles: [...lifestyleMap.values()]
  };
};

