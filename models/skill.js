const { Schema, model } = require('mongoose');

const skillSchema = new Schema({
    name: String,
    element: String, // Flame, Wave, etc.
    levelRequired: Number, // Minimum level to learn
    effect: String, // Description of the skill
    manaCost: Number, // Mana cost for using the skill
    cooldown: Number, // Cooldown period between uses
    damageFactor: Number, // % multiplier of Intelligence for damage
    description: String,
    againstWeakElements: [String], // Elements where the skill is weaker
    damageReductionAgainstWeak: Number, // How much weaker (percentage) against those elements
});

module.exports = model('Skill', skillSchema);
