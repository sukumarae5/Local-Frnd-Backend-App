const faqService = require("../services/faqService");

const createFAQ = async (req, res, next) => {
  try {
    const { question, answer } = req.body;

    await faqService.addFAQ(question, answer);

    res.status(201).json({ success: true, message: "FAQ created" });
  } catch (error) {
    next(error);
  }
};

const getAllFAQs = async (req, res, next) => {
  try {
    const data = await faqService.getFAQs();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getFAQ = async (req, res, next) => {
  try {
    const data = await faqService.getFAQById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateFAQ = async (req, res, next) => {
  try {
    const { question, answer, status } = req.body;

    await faqService.editFAQ(req.params.id, question, answer, status);

    res.json({ success: true, message: "FAQ updated" });
  } catch (error) {
    next(error);
  }
};

const deleteFAQ = async (req, res, next) => {
  try {
    await faqService.removeFAQ(req.params.id);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFAQ,
  getAllFAQs,
  getFAQ,
  updateFAQ,
  deleteFAQ,
};
