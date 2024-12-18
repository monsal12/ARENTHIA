// helpers/roleStatsHelper.js

function calculateRoleStats(role, stats) {
    const { strength, intelligence, ability } = stats;

    let physical_damage, magical_damage, physical_defense, magical_defense, heal;

    switch (role) {
        case 'flame':
        case 'wave':
        case 'venom':
            physical_damage = (strength * 180 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 180 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 60 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 60 / 100) + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'volt':
        case 'gale':
        case 'alloy':
            physical_damage = (strength * 150 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 150 / 100) + (ability * 25 / 100);
            physical_defense = strength + (ability * 25 / 100);
            magical_defense = intelligence + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'frost':
        case 'bloom':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 150 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 150 / 100) + (ability * 25 / 100);
            heal = intelligence + (ability * 25 / 100);
            break;
        case 'terra':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 180 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 180 / 100) + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'light':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 60 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 60 / 100) + (ability * 25 / 100);
            heal = (intelligence * 180 / 100) + (ability * 25 / 100);
            break;
        default:
            throw new Error('Invalid role specified');
    }

    return { physical_damage, magical_damage, physical_defense, magical_defense, heal };
}

module.exports = { calculateRoleStats };
