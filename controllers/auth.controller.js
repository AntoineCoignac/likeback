const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const noReply = "noreply@like.cr";

const transporter = nodemailer.createTransport({
  host : "smtp-mail.outlook.com",
  service: 'hotmail',
  secureConnection: false,
  port : 587,
  auth: {
    user : noReply,
    pass: process.env.MAIL
  },
  tls: {
    ciphers:'SSLv3',
    rejectUnauthorized: false,
  }
})

const register = async (req, res, next) => {
  
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

const login = async (req, res, next) => {
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

    const mailOptions = {
      from: noReply,
      to: info.email,
      subject: "Connexion au compte",
      html : `<table style="width: 100%; background-color: #f5f5f5; padding: 20px;">
                <tr>
                    <td>
                        <img src="https://like.cr/img/likelogo.png" alt="Like logo." style="margin: 0 auto 20px;" width="60" height="38">
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #ffffff; padding: 20px; border: 1px solid #A7A7A7;">
                        <p>Bonjour ${info.name},</p>
                        <p>Quelqu'un vient de se connecter à votre compte. Si ce n'est pas vous, veuillez modifier votre mot de passe.</p>
                        <a href="https://app.like.cr" style="background-color: #D91A3D; color: #ffffff; text-decoration: none; padding: 10px 20px; margin-top: 14px; border-radius: 3px; display: block;">Modifier le mot de passe</a>
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

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};

module.exports = {
  register,
  login,
  logout,
};