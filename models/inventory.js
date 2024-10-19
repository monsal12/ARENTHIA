const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // ID pengguna
    weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' }], // Referensi ke senjata
    armors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Armor' }] // Referensi ke armor
});

module.exports = mongoose.model('Inventory', inventorySchema);
