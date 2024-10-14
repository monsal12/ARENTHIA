const levelUpExperience = (level) => {
    return Math.floor(100 * Math.pow(level, 2)); // Rumus pengalaman untuk naik level
};

const checkLevelUp = async (user) => {
    const requiredExperience = levelUpExperience(user.level);
    
    if (user.experience >= requiredExperience) {
        user.level += 1;
        user.spyr += 5; // Menambahkan 5 spyr saat naik level
        user.experience -= requiredExperience; // Mengurangi pengalaman yang telah dicapai
        
        // Menaikkan max health setiap kali level naik
        user.health.max += 10; // Atur sesuai dengan seberapa banyak kenaikan max HP yang diinginkan
        user.health.current = user.health.max; // Menyetel current health ke max health
        user.stamina.max += 10;
        user.stamina.current = user.stamina.max; // Memastikan stamina saat ini tetap di max
        user.mana.max += 10;
        user.mana.current = user.mana.max; // Memastikan mana saat ini tetap di max

        await user.save();
        return true; // Menandakan bahwa user naik level
    }

    return false; // Tidak ada level up
};

module.exports = {
    levelUpExperience,
    checkLevelUp,
};
