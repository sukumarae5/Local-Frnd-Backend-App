const supportService = require("../services/supportService");

const createTicket = async (req, res, next) => {
  try {
    await supportService.addTicket(req.body);
    res.status(201).json({ success: true, message: "Ticket created" });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const data = await supportService.getTickets();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTicket = async (req, res, next) => {
  try {
    const data = await supportService.getTicketById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    await supportService.editTicket(req.params.id, req.body);
    res.json({ success: true, message: "Ticket updated" });
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    await supportService.removeTicket(req.params.id);
    res.json({ success: true, message: "Ticket deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
};
