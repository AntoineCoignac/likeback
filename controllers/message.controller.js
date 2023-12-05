const Message = require("../models/message.model.js");
const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: 'noreplike@gmail.com',
      pass: process.env.MAIL

  }
})

// controllers/message.controller.js
const createMessage = async (req, res, next) => {
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
    const receiver = await User.findById(receiverId);

    const mailOptions = {
      from: 'noreplike@gmail.com',
      to: receiver.email,
      subject: "Nouveau message",
      html : `<table style="width: 100%; background-color: #f5f5f5; padding: 20px;">
                <tr>
                    <td>
                        <img src="https://like.cr/img/likelogo.png" alt="Like logo." style="margin: 0 auto 20px;" width="60" height="32">
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #ffffff; padding: 20px; border: 1px solid #A7A7A7;">
                        <p>Bonjour <span style="font-weight : 500;">${receiver.name}</span>,</p>
                        <p>Vous avez un nouveau message sur Like.</p>
                        <a href="https://app.like.cr" style="background-color: #D91A3D; color: #ffffff; text-align: center; text-decoration: none; padding: 10px 20px; margin-top: 14px; font-weight: 500px; border-radius: 3px; display: block;">Voir le message</a>
                    </td>
                </tr>
            </table>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log("E-mail envoyé "+ info.response)
      }
    })

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// controllers/message.controller.js
const getMessages = async (req, res, next) => {
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


const getConversations = async (req, res, next) => {
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

module.exports = {
  createMessage,
  getMessages,
  getConversations
};

