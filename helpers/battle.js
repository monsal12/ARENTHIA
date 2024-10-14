const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { checkLevelUp } = require('../helpers/leveling');
const skills = require('../Data/skills');
const Monster = require('../models/monster'); // Pastikan untuk mengimpor model monster

const cooldowns = new Map(); // Menyimpan cooldown untuk setiap pengguna

const initBattle = async (interaction, user) => {
    const now = Date.now();
    const cooldownAmount = 15 * 60 * 1000; // 15 menit dalam milidetik

    // Cek apakah pengguna dalam cooldown
    if (cooldowns.has(interaction.user.id)) {
        const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = Math.round((expirationTime - now) / 1000); // Waktu tersisa dalam detik
            return interaction.reply(`Kamu harus menunggu **${timeLeft} detik** sebelum menggunakan perintah ini lagi.`);
        }
    }

    // Set cooldown untuk pengguna
    cooldowns.set(interaction.user.id, now);

    // Ambil monster berdasarkan ID channel
    const monster = await Monster.findOne({ channelId: interaction.channel.id });
    if (!monster) {
        return interaction.reply('Tidak ada monster yang dapat ditemukan di channel ini.');
    }

    let userHealth = user.health.current;
    let monsterHealth = monster.health;

    // Embed awal pertarungan
    const battleEmbed = new EmbedBuilder()
        .setTitle(`Pertarungan Melawan ${monster.name}`)
        .setDescription(`${user.username}, kamu bertarung melawan ${monster.name}!`)
        .addFields(
            { name: 'Kesehatanmu', value: `${userHealth}/${user.health.max}`, inline: true },
            { name: 'Kesehatan Monster', value: `${monsterHealth}`, inline: true }
        )
        .setColor(Colors.Blue)
        .setImage(monster.imageUrl);

    // Tombol aksi
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

    // Menu dropdown skill
    const skillOptions = user.skills.map(userSkill => {
        const skillData = skills.find(s => s.name === userSkill);
        if (!skillData) return { label: 'Skill Tidak Dikenal', value: 'undefined-skill', description: 'Skill tidak tersedia' };

        const label = skillData.name.substring(0, 25);
        let description = `Mana: ${skillData.manaCost || 0}, Stamina: ${skillData.staminaCost || 0}, Damage: ${skillData.damageFactor || 0}, Healing: ${skillData.healingFactor || 0}`;
        description = description.substring(0, 100); // Maksimal 100 karakter

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

    // Balasan awal dengan embed dan tombol aksi
    await interaction.reply({ embeds: [battleEmbed], components: [row, skillRow] });

    const filter = i => i.user.id === interaction.user.id;
    const actionCollector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    actionCollector.on('collect', async i => {
        // Pastikan interaksi tidak sudah kadaluarsa
        if (i.replied || i.deferred) return; 
        await i.deferUpdate();

        let responseMessage = '';

        // Mendapatkan damage monster setelah aksi pengguna
        const applyMonsterAttack = (userHealth, monster) => {
            const monsterDamage = Math.max(0, monster.attack - (user.stats.defense || 0));
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
                const damageReduction = Math.floor(user.stats.defense * 0.5);
                const mitigatedDamage = Math.max(0, monster.attack - damageReduction);
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

        // Monster menyerang setelah aksi pengguna
        if (userHealth > 0 && monsterHealth > 0) {
            const { userHealth: newUserHealth, monsterDamage } = applyMonsterAttack(userHealth, monster);
            userHealth = newUserHealth;
            responseMessage += `\n${monster.name} menyerang kamu dan menyebabkan ${monsterDamage} poin damage!`;
        }

        // Perbarui embed dengan nilai kesehatan terbaru
        battleEmbed.setDescription(`${responseMessage}\n\nKesehatanmu: ${userHealth}/${user.health.max}\nKesehatan Monster: ${monsterHealth}`);
        await i.editReply({ embeds: [battleEmbed], components: [row, skillRow] });

        user.health.current = userHealth;
        await user.save();

        // Cek status akhir
        if (userHealth <= 0) {
            actionCollector.stop();
            return interaction.followUp('Kamu telah kalah dalam pertarungan!');
        }

        if (monsterHealth <= 0) {
            actionCollector.stop();
            user.experience += monster.experienceReward;
            user.celes += monster.celesReward; // Menambahkan celes yang didapat
            const leveledUp = await checkLevelUp(user);
            await user.save();

            let levelUpMessage = `Kamu mengalahkan ${monster.name}! Mendapatkan ${monster.experienceReward} XP dan ${monster.celesReward} celes!`;
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

// Fungsi untuk menghitung damage
const calculateDamage = (user, monster) => {
    const strength = user.stats.strength || 0; // Pastikan strength adalah angka
    const defense = monster.defense || 0; // Pastikan defense adalah angka
    const baseDamage = Math.max(0, strength - defense);
    const isCritical = Math.random() < 0.2; // 20% chance for critical hit

    return {
        damage: isCritical ? baseDamage * 2 : baseDamage,
        isCritical
    };
};

module.exports = { initBattle };
