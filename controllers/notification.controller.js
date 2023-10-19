const Notification = require("../models/notification.model.js");
const createError = require("../utils/createError.js");
/*
const createNotification = async (req, res, next) => {
  const { userId, isBrand, type, senderId, text } = req.body;

  try {
    
    const newNotification = new Notification({
      userId,
      isBrand,
      type,
      senderId,
      text,
      isReaded: false,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (err) {
    next(err);
  }
};

const getNotifications = async (req, res, next) => {

  const { userId } = req;

  try {
    
    const notifications = await Notification.find({ userId });
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

const updateNotification = async (req, res, next) => {
  const { notificationId } = req.params;

  try {
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return next(createError(404, "Notification not found!"));
    }

    if (notification.userId !== req.userId) {
      return next(createError(403, "You are not authorized to update this notification."));
    }

    notification.isReaded = true;
    const updatedNotification = await notification.save();
    res.status(200).json(updatedNotification);
  } catch (err) {
    next(err);
  }
};
*/

