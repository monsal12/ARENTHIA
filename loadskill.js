const mongoose = require('mongoose');
const Skill = require('./models/skill'); // Assuming you have a Skill model
const skillsData = require('./skills.json');

const loadSkillsToDatabase = async () => {
    await mongoose.connect('mongodb://localhost:27017/yourdatabase', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        for (const skill of skillsData) {
            const newSkill = new Skill(skill);
            await newSkill.save();
        }
        console.log('Skills successfully loaded into the database.');
    } catch (error) {
        console.error('Error loading skills:', error);
    } finally {
        mongoose.connection.close();
    }
};

loadSkillsToDatabase();
