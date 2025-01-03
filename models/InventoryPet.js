const { Schema, model, models } = require('mongoose');

// Schema untuk Inventory Pet
const inventoryPetSchema = new Schema({
    user: { type: String, required: true, unique: true },  // Discord ID user
    pets: [
        {
            pet: { type: Schema.Types.ObjectId, ref: 'Pet' },  // Referensi ke model Pet
            uniqueCode: { type: String, required: true, unique: true },  // Unique code untuk pet
        }
    ]
});

module.exports = models.InventoryPet || model('InventoryPet', inventoryPetSchema);
