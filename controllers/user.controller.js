const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");

const deleteUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can update only your account!"));
    }

    // Update the user fields based on the data sent from the frontend
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        // Check if the property exists in the User schema before updating
        if (User.schema.paths.hasOwnProperty(key)) {
          user[key] = req.body[key];
        }
      }
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    
    const searchValue = req.query.search;

    // Split the search query into individual words
    const searchWords = searchValue
      .split(" ")
      .filter((word) => word.trim() !== "");

    // Create an array to hold the different $or conditions
    const orConditions = [];

    // Loop through each word and create a $regex condition for each field
    searchWords.forEach((word) => {
      const regexCondition = { $regex: word, $options: "i" };
      orConditions.push(
        { username: regexCondition },
        { name: regexCondition },
        { lastname: regexCondition },
        { email: regexCondition }
        // Add other fields you want to search here
      );
    });

    // Construct the final $or query
    const users = await User.find({ $or: orConditions });

    // Sort the results based on relevance (you can customize the sorting criteria)
    users.sort((a, b) => {
      // For example, you can sort by the number of matching fields
      const relevanceA = Object.keys(a.toObject()).filter((key) =>
        orConditions.some((condition) => key in condition)
      ).length;

      const relevanceB = Object.keys(b.toObject()).filter((key) =>
        orConditions.some((condition) => key in condition)
      ).length;

      // Sort in descending order of relevance
      return relevanceB - relevanceA;
    });

    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteUser,
  getUser,
  updateUser,
  getUsers,
};
