const mongoose = require('mongoose');
const Skill = require('./models/skill');


const coalShot = {
    name: "Coal Shot",
    description: "Menembakkan bara api kecil ke target, memberikan 60% dari Intelligence pengguna sebagai damage.",
    effect: "Deals damage based on Intelligence",
    manaCost: 15,
    cooldown: 2,
    levelRequirement: 1,
    element: "Flame",
    damageType: "Magical",
    baseDamage: 60, // 60% of Intelligence
    affectedElements: ["Light", "Wave", "Terra"], // 10% reduced damage
};
