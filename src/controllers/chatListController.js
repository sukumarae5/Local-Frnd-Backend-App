import * as chatListService from "../services/chatListService.js";

export const getChatList = async (req, res) => {
  try {

    const userId = req.user.user_id;

    const list = await chatListService.getChatListService(
      userId
    );

    return res.json(list);

  } catch (err) {
    console.error("chat list error:", err);
    res.status(500).json({
      message: "Failed to load chat list"
    });
  }
};
