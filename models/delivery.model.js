const mongoose = require("mongoose");
const { Schema } = mongoose;

const DeliverySchema = new Schema({
    orderId: {
        type: String,
        required:true,
    },
    docs: {
        type: [
            {
                type: String,
            }
        ],
        required: true,
    },
    isValid: {
        type: Boolean,
        default: null,
    },
    feedback: {
        type: String
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Delivery", DeliverySchema)