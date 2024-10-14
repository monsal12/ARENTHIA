const User = require('../models/user'); // Mengambil model User dari database

// Ambil data user berdasarkan ID
async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) {
        // Jika user tidak ditemukan, buat data user baru
        user = await User.create({ userId, level: 1, element: 'Flame', skills: [] });
    }
    return user;
}

// Update skill user
async function updateUserSkills(userId, skills) {
    await User.updateOne({ userId }, { $set: { skills } });
}

module.exports = { getUserData, updateUserSkills };
