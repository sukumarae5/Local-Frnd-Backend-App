const supportModel = require("../models/supportModel");

const addTicket = async (data) => {
  return await supportModel.createTicket(data);
};

const getTickets = async () => {
  return await supportModel.getAllTickets();
};

const getTicketById = async (id) => {
  return await supportModel.getTicketById(id);
};

const editTicket = async (id, data) => {
  const { full_name, email, phone_number, message, status } = data;

  return await supportModel.updateTicket(
    id,
    full_name,
    email,
    phone_number,
    message,
    status
  );
};

const removeTicket = async (id) => {
  return await supportModel.deleteTicket(id);
};

module.exports = {
  addTicket,
  getTickets,
  getTicketById,
  editTicket,
  removeTicket,
};
