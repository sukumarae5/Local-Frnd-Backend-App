const db=require('../config/db')

const createLanguage= async (data) => {
    const {code, name_en, native_name, direction}=data
    const [result]= await db.execute(
        `INSERT INTO languages (code, name_en, native_name, direction)
        VALUES (?,?,?,?)`,
        [code, name_en, native_name, direction]
    )
    return result;
}

const findAllLanguages= async () => {
    const [rows]= await db.execute(
        `SELECT * FROM languages ORDER BY id DESC`
    )
    return rows;
}

const findById= async (params) => {
     const {id} = params;
     const [rows]=await db.execute(
        `SELECT * FROM languages WHERE id=?`,
        [id]
     )
     return rows[0];
}       

const updateLanguage= async (params, data) => {
    const {id} = params;
    const {code, name_en, native_name, direction, is_active}=data
    console.log('Model layer: Updating language with id:', id, data);
    const [result]= await db.execute(
        `UPDATE languages 
         SET code=?, name_en=?, native_name=?, direction=?, is_active=?
         WHERE id=?`,
         [code, name_en, native_name, direction, is_active, id]  
         
    )
    return result;
}

const deleteLanguage= async (params) => {
    const {id} = params;
    const [result]= await db.execute(
        `DELETE FROM languages WHERE id=?`,
        [id]
    )
    return result;
}

module.exports={
    createLanguage,
    findAllLanguages,
    findById,
    updateLanguage,
    deleteLanguage
}