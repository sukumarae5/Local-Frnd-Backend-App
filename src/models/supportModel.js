const db = require("../config/db");

const createTicket = async (data) => {
  const { full_name, email, phone_number, message } = data;

  const [result] = await db.query(
    `INSERT INTO support_tickets 
     (full_name, email, phone_number, message)
     VALUES (?, ?, ?, ?)`,
    [full_name, email, phone_number, message]
  );

  return result;
};

const getAllTickets = async () => {
  const [rows] = await db.query(
    "SELECT * FROM support_tickets ORDER BY created_at DESC"
  );
  return rows;
};

const getTicketById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM support_tickets WHERE id = ?",
    [id]
  );
  return rows[0];
};

const updateTicket = async (id, full_name, email, phone_number, message, status) => {
  const [result] = await db.query(
    `UPDATE support_tickets 
     SET full_name=?, email=?, phone_number=?, message=?, status=? 
     WHERE id=?`,
    [full_name, email, phone_number, message, status, id]
  );
  return result;
};

const deleteTicket = async (id) => {
  const [result] = await db.query(
    "DELETE FROM support_tickets WHERE id = ?",
    [id]
  );
  return result;
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};
