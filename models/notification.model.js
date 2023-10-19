const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    isBrand: {
        type: Boolean,
        required:true,
    },
    type: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isReaded: {
        type: Boolean,
        default: false,
    }
},{
    timestamps:true
});

export default mongoose.model("Notification", NotificationSchema)