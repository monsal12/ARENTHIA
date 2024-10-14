const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // ID pengguna
    weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' }] // Referensi ke senjata
});

module.exports = mongoose.model('Inventory', inventorySchema);
