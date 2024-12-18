const mongoose = require('mongoose');

// Define the Monster Schema
const monsterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensure each monster has a unique name
    },
    health: {
        current: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    mana: {
        current: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    stamina: {
        current: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    strength: { type: Number, required: true },
    intelligence: { type: Number, required: true },
    ability: { type: Number, required: true },
    creatorId: { type: String, required: true }, // User's Discord ID
    isMonster: {
        type: Boolean,
        default: true // Flag to indicate that it's a monster
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model for the Monster schema
const Monster = mongoose.model('Monsterdnd', monsterSchema);

module.exports = Monster;
