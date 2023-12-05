const User = require("../models/user.model.js");
const Code = require("../models/code.model.js");
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

const createCode = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(createError(404, "User not found!"));
        }

        const min = 100000; // 100000 est le plus petit nombre à 6 chiffres
        const max = 999999; // 999999 est le plus grand nombre à 6 chiffres

        const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
        
        const newCode = new Code({
            number: randomCode,
            used: false,
            userId: user._id
        })

        await newCode.save();

        const mailOptions = {
            from: 'noreplike@gmail.com',
            to: info.email,
            subject: "Code de vérification",
            html : `<table style="width: 100%; background-color: #f5f5f5; padding: 20px;">
                      <tr>
                          <td>
                              <img src="https://like.cr/img/likelogo.png" alt="Like logo." style="margin: 0 auto 20px;" width="60" height="32">
                          </td>
                      </tr>
                      <tr>
                          <td style="background-color: #ffffff; padding: 20px; border: 1px solid #A7A7A7;">
                              <p>Bonjour <span style="font-weight : 500;">${user.name}</span>,</p>
                              <p>Voici votre code de vérification : ${randomCode}</p>
                              
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

        res.status(201).send("A code has been created.");

    } catch (error) {
        next(err)
    }
}

const testCode = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(createError(404, "User not found!"));
        }

        const userCode = await Code.findById(user._id);

        const code = req.body.code;

        if (code === userCode){
            userCode.used = true;
        }

        const updatedCode = await userCode.save();

        res.status(200).json(updatedCode);
    } catch (error) {
        next(err)
    }
}

module.exports = {
    createCode,
};