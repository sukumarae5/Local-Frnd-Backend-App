const callModel =require("../models/callModel")
const db = require('../config/db');

const createSearching= async ({ session_id, caller_id, type, coin_rate_per_min }) => {
    return await callModel.createInitialSession({ session_id, caller_id, type, coin_rate_per_min });
}

const matchToReceiver= async (session_id, receiver_id) => {
    return await callModel.setMatchedSession( session_id, receiver_id );
}

const connectSession= async (session_id) => {
    return await callModel.markConnected( session_id );
}

const endSession= async (session_id) => {
    return await callModel.markEnded( session_id );
}

const getSession= async (session_id) => {
    return await callModel.getSessionById( session_id );
}

const setInitialBalances= async (session_id, caller_balance, receiver_balance)=>{
    return await callModel.setInitialBalances( session_id, caller_balance, receiver_balance );
}

const updateCallerBalance= async (session_id, caller_balance)=>{
    return await callModel.updateCallerBalance( session_id, caller_balance );
}

const updateReceiverBalance= async (session_id, receiver_balance)=>{
    return await callModel.updateReceiverBalance( session_id, receiver_balance );
}

const deductCoins= async (user_id, coins) => {
    let localConn = conn;
    let created = false;
    if (!localConn) {
      localConn = await db.getConnection();
      created = true;
      await localConn.beginTransaction();
    }
    try{
        const [result] = await localConn.execute(`SELECT coin_balance FROM user WHERE user_id = ? FOR UPDATE`, [user_id]);
    
        if (result.length === 0) {
          throw new Error("User not found");
        }
        const currentBalance = parseInt(result[0].coin_balance || 0, 10);
         if (currentBalance < coins) {
          throw new Error("Insufficient balance");
        }

        const newBalance = currentBalance - coins;
        if (newBalance < 0) {
          throw new Error("Insufficient balance");
        }
        await localConn.execute(`UPDATE user SET coin_balance = ? WHERE user_id = ?`, [newBalance, user_id]);
    
        if (created) {
          await localConn.commit();
        }   
        return { success: true, newBalance:newBalance };

    }
    catch(error){
        if (created) {
            await localConn.rollback();
        }
        throw error;
    }
}

module.exports={
    createSearching,
    matchToReceiver,
    connectSession,
    endSession,
    getSession,
    setInitialBalances,
    updateCallerBalance,
    updateReceiverBalance,
    deductCoins
}