const {Schema, model, default: mongoose} = require("mongoose")

const fileSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    path: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    type: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    size: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const FileModel = model("File", fileSchema)
module.exports = FileModel