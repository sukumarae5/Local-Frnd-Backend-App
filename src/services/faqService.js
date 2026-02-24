const faqModel = require("../models/faqModel");

const addFAQ = async (question, answer) => {
  return await faqModel.createFAQ(question, answer);
};

const getFAQs = async () => {
  return await faqModel.getAllFAQs();
};

const getFAQById = async (id) => {
  return await faqModel.getFAQById(id);
};

const editFAQ = async (id, question, answer, status) => {
  return await faqModel.updateFAQ(id, question, answer, status);
};

const removeFAQ = async (id) => {
  return await faqModel.deleteFAQ(id);
};

module.exports = {
  addFAQ,
  getFAQs,
  getFAQById,
  editFAQ,
  removeFAQ,
};
