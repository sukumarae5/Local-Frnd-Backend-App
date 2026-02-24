const InterestModel = require('../models/interestModel');

  const addInterest= async (name) => {
    if (!name || name.trim() === "") {
      throw new Error("Interest name is required");
    }

    const id = await InterestModel.create(name.trim());
    return { id, name };
  }

  const updateInterest= async (id, name) => {
    if (!id) throw new Error("Interest id is required");
    if (!name || name.trim() === "") throw new Error("Interest name is required");

    const affected = await InterestModel.update(id, name.trim());

    if (affected === 0) {
      throw new Error("Interest not found");
    }

    return true;
  }

  const deleteInterest= async (id) => {
    if (!id) throw new Error("Interest id is required");

    const affected = await InterestModel.remove(id);

    if (affected === 0) {
      throw new Error("Interest not found");
    }

    return true;
  }

  const getAllInterests= async () => {
    return await InterestModel.getAll();
  }

module.exports = {
    addInterest,
    updateInterest,
    deleteInterest,
    getAllInterests
};
