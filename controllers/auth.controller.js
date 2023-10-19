const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');

export const register = async (req, res, next) => {
  
  // Validez les champs du formulaire (vous pouvez utiliser express-validator)
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Vérifiez d'abord si l'e-mail est déjà utilisé
  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists) {
    return res.status(400).json({ error: 'L\'adresse e-mail est déjà utilisée.' });
  }

  // Vérifiez le mot de passe
  const password = req.body.password;

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Le mot de passe ne répond pas aux critères de sécurité.' });
  }

  try {
    const hash = bcrypt.hashSync(password, 5);
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(201).send("User has been created.");
  } catch (err) {
    next(err);
  }
};

// Fonction pour vérifier le mot de passe
function isValidPassword(password) {
  // Utilisez une expression régulière pour valider le mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
}

export const login = async (req, res, next) => {
  try {
    
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};