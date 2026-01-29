const db=require("../config/db")

const createInitialSession = async (session) => {
    const sql= `INSERT INTO call_sessions (session_id, caller_id, type, status, coin_rate_per_min, created_at, updated_at)
                 VALUES (?, ?, ?, 'SEARCHING', ?, NOW(), NOW())`;
    await db.execute(sql, [
        session.session_id,
        session.caller_id,
        session.type,
        session.coin_rate_per_min
    ]);
    return session.session_id;
}

const setMatchedSession = async (session_id, receiver_id) => {
    const sql= `UPDATE call_sessions 
    SET receiver_id = ?, status = 'RINGING', updated_at = NOW() WHERE session_id = ?`;
    await db.execute(sql, [receiver_id, session_id]);
}

const markConnected= async (session_id) => {
    const sql= `UPDATE call_sessions SET status='CONNECTED', started_at=NOW(), updated_at=NOW() WHERE session_id=?`;
    await db.execute(sql, [session_id]);
}

const markEnded= async (session_id) => {
    const sql= `UPDATE call_sessions SET status='ENDED', ended_at=NOW(),duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW()), updated_at=NOW() WHERE session_id=?`;
    await db.execute(sql, [session_id]);
}

const getSessionById= async (session_id) => {
    const [rows]= await db.execute(`SELECT * FROM call_sessions WHERE session_id=?`, [session_id]);
    return rows[0];
}

const setInitialBalances= async (session_id, caller_balance, receiver_balance)=>{
    const sql= `UPDATE call_sessions SET caller_remaining_coins = ?, receiver_remaining_coins = ?, updated_at=NOW() WHERE session_id = ?`; 
  await db.execute(sql, [session_id, caller_balance, receiver_balance]);

}

const updateCallerBalance= async (session_id, caller_balance)=>{
    const sql= `UPDATE call_sessions SET caller_remaining_coins = ?, updated_at=NOW() WHERE session_id = ?`; 
  await db.execute(sql, [caller_balance, session_id]);
}

const updateReceiverBalance= async (session_id, receiver_balance)=>{
    const sql= `UPDATE call_sessions SET receiver_remaining_coins = ?, updated_at=NOW() WHERE session_id = ?`; 
  await db.execute(sql, [receiver_balance, session_id]);
}

const findActiveByUser = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM call_sessions 
     WHERE status='CONNECTED' 
     AND (caller_id=? OR receiver_id=?) 
     LIMIT 1`,
    [user_id, user_id]
  );
  return rows[0];
};

const findSearchingByUser = async (user_id) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM call_sessions
    WHERE caller_id = ?
      AND status = 'SEARCHING'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [user_id]
  );
  return rows[0] || null;
};


module.exports={
    createInitialSession,
    setMatchedSession,
    markConnected,
    markEnded,
    getSessionById,
    setInitialBalances,
    updateCallerBalance,
    updateReceiverBalance,
    findActiveByUser,
    findSearchingByUser
}