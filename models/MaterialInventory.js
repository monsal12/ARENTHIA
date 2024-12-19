const mongoose = require('mongoose');

const materialInventorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },  // ID pengguna
    materials: [
        {
            materialName: { type: String, required: true },  // Nama material (Fiber, Wood, dll)
            tier: { type: String, required: true },          // Tier material (T1 - T8)
            quantity: { type: Number, default: 0 }           // Jumlah material
        }
    ]
});

module.exports = mongoose.model('MaterialInventory', materialInventorySchema);
