const mongoose = require("mongoose");
const { Schema } = mongoose;

const CodeSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    used: {
        type: Boolean,
        required: true
    },
    userId: {
        type: String,
        required: true
    }   
},{
    timestamps:true
});

module.exports = mongoose.model("Code", CodeSchema);