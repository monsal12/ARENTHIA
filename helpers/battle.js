const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { checkLevelUp } = require('../helpers/leveling');
const skills = require('../Data/skills');
const Monster = require('../models/monster');
const User = require('../models/user'); // Import User model for system account

const cooldowns = new Map(); // To store user cooldowns

const initBattle = async (interaction, user) => {
    const now = Date.now();
    const cooldownAmount = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if user has a cooldown and completed battle (win/lose)
    if (cooldowns.has(interaction.user.id)) {
        const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = Math.round((expirationTime - now) / 1000);
            return interaction.reply(`Kamu harus menunggu **${timeLeft} detik** sebelum menggunakan perintah ini lagi.`);
        }
    }

    const monster = await Monster.findOne({ channelId: interaction.channel.id });
    if (!monster) {
        return interaction.reply('Tidak ada monster yang dapat ditemukan di channel ini.');
    }

    let userHealth = user.health.current;
    let monsterHealth = monster.health;

    const battleEmbed = new EmbedBuilder()
        .setTitle(`Pertarungan Melawan ${monster.name}`)
        .setDescription(`${user.username}, kamu bertarung melawan ${monster.name}!`)
        .addFields(
            { name: 'Kesehatanmu', value: `${userHealth}/${user.health.max}`, inline: true },
            { name: 'Kesehatan Monster', value: `${monsterHealth}`, inline: true }
        )
        .setColor(Colors.Blue)
        .setImage(monster.imageUrl);

    // Action buttons: Attack, Defend, Flee
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('attack')
                .setLabel('Serang')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('defend')
                .setLabel('Bertahan')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('flee')
                .setLabel('Kabur')
                .setStyle(ButtonStyle.Danger)
        );

    // Generate skill options for select menu
    const skillOptions = user.skills.map(userSkill => {
        const skillData = skills.find(s => s.name === userSkill);
        if (!skillData) return { label: 'Skill Tidak Dikenal', value: 'undefined-skill', description: 'Skill tidak tersedia' };

        const label = skillData.name.substring(0, 25);
        let description = `Mana: ${skillData.manaCost || 0}, Stamina: ${skillData.staminaCost || 0}, Damage: ${skillData.damageFactor || 0}, Healing: ${skillData.healingFactor || 0}`;
        description = description.substring(0, 100);

        return {
            label: label,
            value: skillData.name,
            description: description,
        };
    }).filter(option => option.label.length > 0 && option.description.length > 0);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('selectSkill')
        .setPlaceholder('Pilih skill untuk digunakan')
        .addOptions(skillOptions);

    const skillRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [battleEmbed], components: [row, skillRow] });

    const filter = i => i.user.id === interaction.user.id;
    const actionCollector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    actionCollector.on('collect', async i => {
        if (i.replied || i.deferred) return; 
        await i.deferUpdate();

        let responseMessage = '';

        const applyMonsterAttack = (userHealth, monster) => {
            const monsterAttack = monster.attack || 0; // Default to 0 if undefined
            const monsterDamage = Math.max(0, monsterAttack - (user.stats.defense || 0));
            userHealth -= monsterDamage;
            return { userHealth, monsterDamage };
        };

        switch (i.customId) {
            case 'attack':
                const { damage, isCritical } = calculateDamage(user, monster);
                monsterHealth -= damage;
                responseMessage = `Kamu menyerang ${monster.name} dan memberikan damage sebesar ${damage} poin!${isCritical ? ' (Critical Hit!)' : ''}`;
                break;

            case 'defend':
                const userDefense = user.stats.ability || 0; // Ensure defense is valid
                const damageReduction = Math.floor(userDefense * 0.5);
                const monsterAttack = monster.attack || 0; // Ensure monster attack is valid
                const mitigatedDamage = Math.max(0, monsterAttack - damageReduction);
                userHealth -= mitigatedDamage;
                responseMessage = `Kamu bertahan dan mengurangi damage sebesar ${damageReduction} poin! ${monster.name} menyerang kamu dan menyebabkan ${mitigatedDamage} poin damage!`;
                break;

            case 'flee':
                actionCollector.stop();
                return interaction.followUp('Kamu berhasil melarikan diri!');

            case 'selectSkill':
                const selectedSkillName = i.values[0];
                const selectedSkill = skills.find(skill => skill.name === selectedSkillName);
                if (!selectedSkill) {
                    return interaction.followUp('Skill tidak valid!');
                }

                const hasEnoughMana = selectedSkill.manaCost ? user.mana.current >= selectedSkill.manaCost : true;
                const hasEnoughStamina = selectedSkill.staminaCost ? user.stamina.current >= selectedSkill.staminaCost : true;

                if (hasEnoughMana && hasEnoughStamina) {
                    if (selectedSkill.manaCost) user.mana.current -= selectedSkill.manaCost;
                    if (selectedSkill.staminaCost) user.stamina.current -= selectedSkill.staminaCost;

                    let healingAmount = 0;

                    if (selectedSkill.healingFactor) {
                        healingAmount = Math.floor(selectedSkill.healingFactor * user.stats.intelligence);
                        userHealth = Math.min(user.health.max, userHealth + healingAmount);
                        responseMessage = `Kamu menggunakan skill ${selectedSkill.name} dan memulihkan ${healingAmount} HP!`;
                    } else if (selectedSkill.damageFactor) {
                        const skillDamage = Math.floor(selectedSkill.damageFactor * user.stats.strength);
                        monsterHealth -= skillDamage;
                        responseMessage = `Kamu menggunakan skill ${selectedSkill.name} dan memberikan damage sebesar ${skillDamage} poin!`;
                    }
                } else {
                    responseMessage = 'Mana atau Stamina tidak cukup untuk menggunakan skill ini!';
                }
                break;

            default:
                return;
        }

        if (userHealth > 0 && monsterHealth > 0) {
            const { userHealth: newUserHealth, monsterDamage } = applyMonsterAttack(userHealth, monster);
            userHealth = newUserHealth;
            responseMessage += `\n${monster.name} menyerang kamu dan menyebabkan ${monsterDamage} poin damage!`;
        }

        // Update embed with new health status
        battleEmbed.setDescription(`${responseMessage}\n\nKesehatanmu: ${userHealth}/${user.health.max}\nKesehatan Monster: ${monsterHealth}`);
        await i.editReply({ embeds: [battleEmbed], components: [row, skillRow] });

        // Save user's updated health
        user.health.current = userHealth;
        await user.save();

        if (userHealth <= 0) {
            actionCollector.stop();
            cooldowns.set(interaction.user.id, now); // Apply cooldown when losing
            return interaction.followUp('Kamu telah kalah dalam pertarungan!');
        }

        if (monsterHealth <= 0) {
            actionCollector.stop();
            cooldowns.set(interaction.user.id, now); // Apply cooldown when winning

            // Retrieve celes from system account
            const systemUser = await User.findOne({ discordId: '994553740864536596' });
            const rewardCeles = monster.celesReward;

            if (systemUser && systemUser.celes >= rewardCeles) {
                systemUser.celes -= rewardCeles;
                await systemUser.save();

                user.celes += rewardCeles;
            }

            user.experience += monster.experienceReward;
            const leveledUp = await checkLevelUp(user);
            await user.save();

            let levelUpMessage = `Kamu mengalahkan ${monster.name}! Mendapatkan ${monster.experienceReward} XP dan ${rewardCeles} celes!`;
            if (leveledUp) {
                levelUpMessage += `\nSelamat! Kamu naik level ke level ${user.level}. Max HP sekarang adalah ${user.health.max}.`;
            }
            return interaction.followUp(levelUpMessage);
        }
    });

    actionCollector.on('end', collected => {
        if (collected.size === 0) {
            return interaction.followUp('Waktu habis! Pertarungan berakhir.');
        }
    });
};

const calculateDamage = (user, monster) => {
    const strength = user.stats.strength || 0;
    const defense = monster.defense || 0;
    const baseDamage = Math.max(0, strength - defense);
    const isCritical = Math.random() < 0.1; // 10% critical chance
    const criticalBonus = isCritical ? baseDamage * 0.5 : 0;

    return { damage: Math.floor(baseDamage + criticalBonus), isCritical };
};

module.exports = {
    data: {
        name: 'battle',
        description: 'Bertarung melawan monster di channel ini.',
    },
    async execute(interaction) {
        const user = await User.findOne({ discordId: interaction.user.id });
        if (!user) return interaction.reply('Kamu belum terdaftar!');

        return initBattle(interaction, user);
    },
};

module.exports = { initBattle };