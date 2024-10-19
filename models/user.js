const { Schema, model, models } = require('mongoose');

const userSchema = new Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    gachaCount: { type: Number, default: 0 },
    element: { type: String },
    skills: { type: [String], default: [] },
    level: { type: Number, default: 1 },
    weapons: [{ type: Schema.Types.ObjectId, ref: 'Weapon' }],
    armors: [{ type: Schema.Types.ObjectId, ref: 'Armor' }], // Tambahkan jalur armors di sini
    equippedWeapon: { type: Schema.Types.ObjectId, ref: 'Weapon', default: null },
    equippedArmor: { type: Schema.Types.ObjectId, ref: 'Armor', default: null }, // Tambahkan untuk armor
    experience: { type: Number, default: 0 },
    spyr: { type: Number, default: 5 },
    health: {
        current: { type: Number, default: 100 },
        max: { type: Number, default: 100 }
    },
    mana: {
        current: { type: Number, default: 100 },
        max: { type: Number, default: 100 }
    },
    stamina: {
        current: { type: Number, default: 100 },
        max: { type: Number, default: 100 }
    },
    stats: {
        strength: { type: Number, default: 10 },
        intelligence: { type: Number, default: 10 },
        ability: { type: Number, default: 10 }
    },
    rank: { type: String },
    guild: { type: String },
    celes: { type: Number, default: 0 },
    exploreCooldown: { type: Date, default: Date.now },
    tickets: {
        common: { type: Number, default: 0 },
        rare: { type: Number, default: 0 },
        mythic: { type: Number, default: 0 },
        legendary: { type: Number, default: 0 },
    },
    huntingCooldown: { type: Date, default: Date.now },
    
    // Tambahkan field 'hunger' dan 'thirst' di sini
    hunger: { type: Number, default: 100 }, // Level lapar
    thirst: { type: Number, default: 100 }, // Level haus
});

// Mengecek apakah model 'User' sudah ada
module.exports = models.User || model('User', userSchema);
