import * as chatListModel from "../models/chatListModel.js";

export const getChatListService = async (userId) => {
  return await chatListModel.getChatList(userId);
};
