const db = require("../config/db");

//////////////////////////////////////////////////////////
// OFFER CRUD
//////////////////////////////////////////////////////////

const getAllOffers = async (gender) => {
  let sql = `
        SELECT *
        FROM offers
        WHERE status=1
    `;

  let params = [];

  if (gender) {
    sql += `
            AND (target_audience=? OR target_audience='ALL')
        `;
    params.push(gender);
  }

  sql += `
        AND
        (
            start_date IS NULL
            OR start_date<=NOW()
        )

        AND
        (
            end_date IS NULL
            OR end_date>=NOW()
        )

        ORDER BY priority DESC,id DESC
    `;

  const [rows] = await db.query(sql, params);
console.log("🚀 ~ file: offerModel.js:49 ~ getAllOffers ~ rows:", rows)
  return rows;
};

const getOfferById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM offers WHERE id=?`,

    [id],
  );

  return rows[0];
};

const createOffer = async (data) => {
  const [result] = await db.query(
    `
        INSERT INTO offers
        (
            banner_type,
            background_image,
            right_image,
            redirect_url,
            priority,
            start_date,
            end_date,
            status,
            target_audience
        )

        VALUES(?,?,?,?,?,?,?,?,?)
        `,

    [
      data.banner_type,
      data.background_image,
      data.right_image,
      data.redirect_url,
      data.priority,
      data.start_date,
      data.end_date,
      data.status,
      data.target_audience,
    ],
  );

  return result.insertId;
};

const updateOffer = async (id, data) => {
  await db.query(
    `
        UPDATE offers

        SET

        banner_type=?,
        background_image=?,
        right_image=?,
        redirect_url=?,
        priority=?,
        start_date=?,
        end_date=?,
        status=?,
        target_audience=?

        WHERE id=?

        `,

    [
      data.banner_type,
      data.background_image,
      data.right_image,
      data.redirect_url,
      data.priority,
      data.start_date,
      data.end_date,
      data.status,
      data.target_audience,
      id,
    ],
  );
};

const updateOfferStatus = async (id, status) => {
  await db.query(
    `UPDATE offers SET status=? WHERE id=?`,

    [status, id],
  );
};

const deleteOffer = async (id) => {
  await db.query(
    `DELETE FROM offers WHERE id=?`,

    [id],
  );
};

//////////////////////////////////////////////////////////
// CONTENTS
//////////////////////////////////////////////////////////

const getContents = async (offerId) => {
  const [rows] = await db.query(
    `
        SELECT *
        FROM offer_contents
        WHERE offer_id=?
        ORDER BY sort_order
        `,

    [offerId],
  );

  return rows;
};

const addContent = async (data) => {
  const [result] = await db.query(
    `
        INSERT INTO offer_contents
        (
            offer_id,
            content_key,
            content_value,
            sort_order
        )

        VALUES(?,?,?,?)

        `,

    [data.offer_id, data.content_key, data.content_value, data.sort_order],
  );

  return result.insertId;
};

const updateContent = async (id, data) => {
  await db.query(
    `
        UPDATE offer_contents

        SET

        content_key=?,
        content_value=?,
        sort_order=?

        WHERE id=?

        `,

    [data.content_key, data.content_value, data.sort_order, id],
  );
};

const deleteContent = async (id) => {
  await db.query(
    `DELETE FROM offer_contents WHERE id=?`,

    [id],
  );
};

//////////////////////////////////////////////////////////
// FEATURES
//////////////////////////////////////////////////////////

const getFeatures = async (offerId) => {
  const [rows] = await db.query(
    `
        SELECT *
        FROM offer_features
        WHERE offer_id=?
        ORDER BY sort_order
        `,

    [offerId],
  );

  return rows;
};

const addFeature = async (data) => {
  const [result] = await db.query(
    `
        INSERT INTO offer_features
        (
            offer_id,
            icon,
            title,
            description,
            sort_order
        )

        VALUES(?,?,?,?,?)

        `,

    [data.offer_id, data.icon, data.title, data.description, data.sort_order],
  );

  return result.insertId;
};

const updateFeature = async (id, data) => {
  await db.query(
    `
        UPDATE offer_features

        SET

        icon=?,
        title=?,
        description=?,
        sort_order=?

        WHERE id=?

        `,

    [data.icon, data.title, data.description, data.sort_order, id],
  );
};

const deleteFeature = async (id) => {
  await db.query(
    `DELETE FROM offer_features WHERE id=?`,

    [id],
  );
};

//////////////////////////////////////////////////////////
// BUTTON
//////////////////////////////////////////////////////////

const getButton = async (offerId) => {
  const [rows] = await db.query(
    `
        SELECT *
        FROM offer_buttons
        WHERE offer_id=?
        LIMIT 1
        `,

    [offerId],
  );

  return rows[0];
};

const addButton = async (data) => {
  const [result] = await db.query(
    `
        INSERT INTO offer_buttons
        (
            offer_id,
            button_text,
            button_color,
            text_color,
            redirect_url
        )

        VALUES(?,?,?,?,?)

        `,

    [
      data.offer_id,
      data.button_text,
      data.button_color,
      data.text_color,
      data.redirect_url,
    ],
  );

  return result.insertId;
};

const updateButton = async (id, data) => {
  await db.query(
    `
        UPDATE offer_buttons

        SET

        button_text=?,
        button_color=?,
        text_color=?,
        redirect_url=?

        WHERE id=?

        `,

    [
      data.button_text,
      data.button_color,
      data.text_color,
      data.redirect_url,
      id,
    ],
  );
};

const deleteButton = async (id) => {
  await db.query(
    `DELETE FROM offer_buttons WHERE id=?`,

    [id],
  );
};

//////////////////////////////////////////////////////////
// DELETE CHILD RECORDS
//////////////////////////////////////////////////////////

const deleteContentsByOfferId = async (offerId) => {
  await db.query("DELETE FROM offer_contents WHERE offer_id = ?", [offerId]);
};

const deleteFeaturesByOfferId = async (offerId) => {
  await db.query("DELETE FROM offer_features WHERE offer_id = ?", [offerId]);
};

const deleteButtonByOfferId = async (offerId) => {
  await db.query("DELETE FROM offer_buttons WHERE offer_id = ?", [offerId]);
};

module.exports = {
  // Offer
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer,

  // Contents
  getContents,
  addContent,
  updateContent,
  deleteContent,

  // Features
  getFeatures,
  addFeature,
  updateFeature,
  deleteFeature,

  // Button
  getButton,
  addButton,
  updateButton,
  deleteButton,

  deleteContentsByOfferId,
  deleteFeaturesByOfferId,
  deleteButtonByOfferId,
};
