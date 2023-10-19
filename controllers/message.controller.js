const Message = require("../models/message.model.js");
const createError = require("../utils/createError.js");

// controllers/message.controller.js
export const createMessage = async (req, res, next) => {
  const { receiverId, text } = req.body;

  try {
    
    // Vérifier si les champs requis sont présents
    if (!receiverId || !text) {
      throw createError(400, "receiverId and text are required fields.");
    }

    // Utiliser l'ID de l'utilisateur connecté comme senderId
    const senderId = req.userId;

    // Créer le nouveau message
    const message = await Message.create({ senderId, receiverId, text });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// controllers/message.controller.js
export const getMessages = async (req, res, next) => {
  const { id } = req.params;

  try {
    
    // Ensure the conversation involves the logged-in user
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: id },
        { senderId: id, receiverId: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};


export const getConversations = async (req, res, next) => {
  try {
    
    // Récupérer les derniers messages de chaque conversation de l'utilisateur connecté
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: req.userId }, { receiverId: req.userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", req.userId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
      {
        $project: {
          senderId: 1,
          receiverId: 1,
          text: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};
