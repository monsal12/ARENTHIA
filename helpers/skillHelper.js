const skills = require('../data/skills');

const getAvailableSkills = (user) => {
    return skills.filter(skill => skill.element === user.element && skill.levelRequirement <= user.level);
};

const learnSkill = (user, skillName) => {
    const skill = skills.find(s => s.name === skillName);
    if (!skill) {
        return 'Skill not found.';
    }

    if (user.skills.some(s => s.name === skillName)) {
        return 'You have already learned this skill.';
    }

    if (user.level < skill.levelRequirement) {
        return 'You do not meet the level requirement to learn this skill.';
    }

    user.skills.push(skill); // Add the skill to the user's skills
    return `You have learned the skill: ${skill.name}!`;
};

const viewSkills = (user) => {
    if (user.skills.length === 0) {
        return 'You have no skills learned.';
    }

    return user.skills.map(skill => `${skill.name} - Element: ${skill.element}`).join('\n');
};

module.exports = {
    getAvailableSkills,
    learnSkill,
    viewSkills
};
