const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true },
    uniqueCode: { type: String, required: true, unique: true },
    strength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    ability: { type: Number, default: 0 },
    grade: { type: String, required: true },
    imageUrl: { type: String },
    price: { type: Number, default: 0 } 
});

module.exports = mongoose.model('Accessory', accessorySchema);
