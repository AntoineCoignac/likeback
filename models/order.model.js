const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderSchema = new Schema({
    gigId: {
        type: String,
        required:true,
    },
    title: {
        type: String,
        required:true,
    },
    price: {
        type: Number,
        required:true,
    },
    sellerId: {
        type: String,
        required:true,
    },
    buyerId: {
        type: String,
        required:true,
    },
    isCompleted: {
        type: Boolean,
        default:false
    },
    payment_intent: {
        type: String,
        required:true,
    },
    deadline: {
        type:Date
    },
    remainingRevisions: {
        type: Number,
        required: true,
    },
    brief: {
        type: String
    },
    acceptedBySeller: {
        type: Boolean,
        default: null,
    },
    isFinished: {
        type: Boolean,
        default: false,
    },
    isLiked: {
        type: Boolean,
        default: null,
    },
    deliveryTime: {
        type: Number,
        required: true,
    },
},{
    timestamps:true
});

module.exports = mongoose.model("Order", OrderSchema)