const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isSeller: {
        type: Boolean,
        required: true,
    },
    img: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    lang: {
        type: String,
        default: "fr",
    },
    lightMode: {
        type: Boolean,
        default: false,
    },
    newsletter: {
        type: Boolean,
        default: true,
    },
    phone: {
        type: String,
        required: false,
    },
    desc: {
        type: String,
        required: false,
    },
    tag: {
        type: String,
        required: false,
    },
    medias: {
        type:[String],
        required: false
    },
    instagram: {
        type: String,
        required: false,
    },
    tiktok: {
        type: String,
        required: false,
    },
    twitter: {
        type: String,
        required: false,
    },
    youtube: {
        type: String,
        required: false,
    },
    twitch: {
        type: String,
        required: false,
    },
    linkedin: {
        type: String,
        required: false,
    },
    sub: {
        type: Number,
        required:false,
    },
    subDate: {
        type: Date,
        required: false,
    },
    stripe: {
        type: String,
        required: false,
    },
    like: {
        type: Number,
        default: 0,
    },
    contract: {
        type: String,
        required: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    }
},{
    timestamps:true
});

module.exports = mongoose.model("User", UserSchema);