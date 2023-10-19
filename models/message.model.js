const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
    senderId: {
        type: String,
        required:true,
    },
    receiverId: {
        type: String,
        required:true,
    },
    text: {
        type: String,
        required:true,
    },
},{
    timestamps:true
});

module.exports = mongoose.model("Message", MessageSchema);
