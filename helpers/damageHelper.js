const calculateSkillDamage = (user, skill, monster) => {
    let baseDamage = (user.stats.intelligence * skill.damage) / 100;

    // Adjust damage for elemental weaknesses/resistances
    if (monster.element === 'Light' || monster.element === 'Wave' || monster.element === 'Terra') {
        baseDamage *= 0.9; // Apply 10% damage reduction for these elements
    }

    return Math.max(0, baseDamage - monster.defense); // Apply monster defense
};

module.exports = {
    calculateSkillDamage,
};
