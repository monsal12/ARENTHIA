// models/monster.js
const { Schema, model } = require('mongoose');

const monsterSchema = new Schema({
    name: { type: String, required: true },
    health: { type: Number, required: true },
    attack: { type: Number, required: true },
    experienceReward: { type: Number, required: true },
    celesReward: { type: Number, default: 50 }, // Jumlah celes yang diberikan setelah mengalahkan monster
    defense: { type: Number, default: 5 }, // Tambahkan defense
    imageUrl: { type: String, required: true },
    channelId: { type: String, required: true }
});

module.exports = model('Monster', monsterSchema);
