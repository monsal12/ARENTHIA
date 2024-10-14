const Monster = require('../models/monster'); // Pastikan model monster sudah diimport

const getMonsterByName = async (monsterName) => {
    try {
        // Mencari monster berdasarkan nama secara case-insensitive
        const monster = await Monster.findOne({ name: new RegExp(`^${monsterName}$`, 'i') });
        return monster;
    } catch (error) {
        console.error('Error menemukan monster:', error);
        return null;
    }
};

module.exports = { getMonsterByName };
