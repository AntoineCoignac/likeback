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

export default mongoose.model("Delivery", DeliverySchema)