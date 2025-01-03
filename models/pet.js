const { Schema, model } = require('mongoose');

const petSchema = new Schema({
    name: { type: String, required: true },
    species: { type: String, required: true },
    image: { type: String },
    owner: { type: String, required: true }, // User ID of the owner
    uniqueCode: { type: String, required: true },
    bonusStats: {
        health: { type: Number, default: 0 },
        mana: { type: Number, default: 0 },
        stamina: { type: Number, default: 0 },
    },
});

module.exports = model('Pet', petSchema);
