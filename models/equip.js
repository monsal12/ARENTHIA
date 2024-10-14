const equipmentSchema = new Schema({
    name: String,
    type: String,  // Weapon or Armor
    grade: String, // F, E, D, C, B, A, S
    stats: {
        mana: Number,
        strength: Number,
        intelligence: Number,
        defense: Number,
        stamina: Number,
        ability: Number
    }
});

module.exports = model('Equipment', equipmentSchema);
