const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { checkLevelUp } = require('../helpers/leveling');
const skills = require('../Data/skills');
const Monster = require('../models/monster');
const User = require('../models/user'); // Import User model for system account

const cooldowns = new Map(); // To store user cooldowns

const roleBonuses = {
    '1259877764304212059': { xpBonus: 10, celesBonus: 10 },
    '1259770078581358612': { xpBonus: 30, celesBonus: 30 },
    '1290094741618167808': { xpBonus: 40, celesBonus: 40 },
    '1270722170733203506': { xpBonus: 60, celesBonus: 60 },
};

const initBattle = async (interaction, user) => {
    const now = Date.now();
    const cooldownAmount = 15 * 60 * 1000; // 15 minutes in milliseconds

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
    let userMana = user.mana.current;
    let userStamina = user.stamina.current;

    const battleEmbed = new EmbedBuilder()
        .setTitle(`Pertarungan Melawan ${monster.name}`)
        .setDescription(`${user.username}, kamu bertarung melawan ${monster.name}!`)
        .addFields(
            { name: 'Kesehatanmu', value: `${userHealth}/${user.health.max}`, inline: true },
            { name: 'Kesehatan Monster', value: `${monsterHealth}`, inline: true }
        )
        .setColor(Colors.Blue)
        .setImage(monster.imageUrl)
        .setFooter({ text: '✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('attack').setLabel('Serang').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('defend').setLabel('Bertahan').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('flee').setLabel('Kabur').setStyle(ButtonStyle.Danger)
        );

    const skillOptions = user.skills.map(userSkill => {
        const skillData = skills.find(s => s.name === userSkill);
        if (!skillData) return { label: 'Skill Tidak Dikenal', value: 'undefined-skill', description: 'Skill tidak tersedia' };

        return {
            label: skillData.name.substring(0, 25),
            value: skillData.name,
            description: `Mana: ${skillData.manaCost || 0}, Stamina: ${skillData.staminaCost || 0}, Damage: ${skillData.damageFactor || 0}, Healing: ${skillData.healingFactor || 0}`,
        };
    });

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
        
        switch (i.customId) {
            case 'attack':
                const { damage, isCritical } = calculateDamage(user, monster);
                monsterHealth -= damage;
                responseMessage = `Kamu menyerang ${monster.name} dan memberikan damage sebesar ${damage} poin!${isCritical ? ' (Critical Hit!)' : ''}`;
                break;

            case 'defend':
                const userDefense = user.stats.ability || 0;
                const damageReduction = Math.floor(userDefense * 0.5);
                const mitigatedDamage = Math.max(0, (monster.attack || 0) - damageReduction);
                userHealth -= mitigatedDamage;
                responseMessage = `Kamu bertahan dan mengurangi damage sebesar ${damageReduction} poin! ${monster.name} menyerang kamu dan menyebabkan ${mitigatedDamage} poin damage!`;
                break;

            case 'flee':
                actionCollector.stop();
                return interaction.followUp('Kamu berhasil melarikan diri!');
            case 'selectSkill': // Menangani pemilihan skill
                const selectedSkillName = i.values[0];
                const selectedSkill = skills.find(skill => skill.name === selectedSkillName);
                if (!selectedSkill) {
                    return interaction.followUp('Skill tidak valid!');
                }

                // Periksa apakah user memiliki cukup mana dan stamina
                const hasEnoughMana = selectedSkill.manaCost ? user.mana.current >= selectedSkill.manaCost : true;
                const hasEnoughStamina = selectedSkill.staminaCost ? user.stamina.current >= selectedSkill.staminaCost : true;

                if (hasEnoughMana && hasEnoughStamina) {
                    if (selectedSkill.manaCost) user.mana.current -= selectedSkill.manaCost;
                    if (selectedSkill.staminaCost) user.stamina.current -= selectedSkill.staminaCost;

                    const skillDamage = Math.floor(selectedSkill.damageFactor * user.stats.intelligence);
                    monsterHealth -= skillDamage;
                    responseMessage = `Kamu menggunakan skill ${selectedSkill.name} dan memberikan damage sebesar ${skillDamage} poin!`;
                } else {
                    responseMessage = 'Mana atau Stamina tidak cukup untuk menggunakan skill ini!';
                }

                // Monster menyerang setelah penggunaan skill
                if (monsterHealth > 0) {
                    userHealth -= monster.attack;
                    responseMessage += `\n${monster.name} menyerang kamu dan menyebabkan ${monster.attack} poin damage!`;
                }

                // Perbarui embed dengan nilai kesehatan terbaru
                battleEmbed.setDescription(`${responseMessage}\n\nKesehatanmu: ${userHealth}/${user.health.max}\nKesehatan Monster: ${monsterHealth}`);
                await i.editReply({ embeds: [battleEmbed], components: [row, skillRow] });

                user.health.current = userHealth;
                default:
                    return;
                
        }

        if (userHealth > 0 && monsterHealth > 0) {
            const monsterDamage = Math.max(0, (monster.attack || 0) - (user.stats.defense || 0));
            userHealth -= monsterDamage;
            responseMessage += `\n${monster.name} menyerang kamu dan menyebabkan ${monsterDamage} poin damage!`;
        }

        battleEmbed.setDescription(`${responseMessage}\n\nKesehatanmu: ${userHealth}/${user.health.max}\nKesehatan Monster: ${monsterHealth}`);
        await i.editReply({ embeds: [battleEmbed], components: [row, skillRow] });

        if (userHealth <= 0) {
            actionCollector.stop();
            cooldowns.set(interaction.user.id, now); // Apply cooldown when losing
            return interaction.followUp('Kamu telah kalah dalam pertarungan!');
        }

        if (monsterHealth <= 0) {
            actionCollector.stop();
            cooldowns.set(interaction.user.id, now); // Apply cooldown when winning

            const systemUser = await User.findOne({ discordId: '994553740864536596' });
            const rewardCeles = monster.celesReward;
            const roleBonus = roleBonuses[interaction.member.roles.cache.find(r => roleBonuses[r.id])?.id] || { xpBonus: 0, celesBonus: 0 };

            const finalCelesReward = Math.floor(rewardCeles * (1 + roleBonus.celesBonus / 100));
            const finalXpReward = Math.floor(monster.experienceReward * (1 + roleBonus.xpBonus / 100));

            if (systemUser && systemUser.celes >= finalCelesReward) {
                systemUser.celes -= finalCelesReward;
                await systemUser.save();

                user.celes += finalCelesReward;
            }

            user.experience += finalXpReward;
            const leveledUp = await checkLevelUp(user);

            user.health.current = userHealth;
            user.mana.current = userMana;
            user.stamina.current = userStamina;

            await user.save();

            let levelUpMessage = `Kamu mengalahkan ${monster.name}! Mendapatkan ${finalXpReward} XP dan ${finalCelesReward} celes!`;
            if (leveledUp) {
                levelUpMessage += `\nSelamat! Kamu naik level ke level ${user.level}. Max HP sekarang adalah ${user.health.max}.`;
            }
            return interaction.followUp(levelUpMessage);
        }
    });

    actionCollector.on('end', collected => {
        if (collected.size === 0) {
            return interaction.followUp('Waktu habis! Pertarungan dibatalkan.');
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