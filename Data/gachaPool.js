const gachaPool = [
    { 
        name: "Dragon Fang Saber", 
        grade: "Common", 
        statBoost: { 
            strength: 5, 
            intelligence: 0, 
            ability: 2 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1295648234466709545/374e6f2d-095f-4b51-ad5d-937676bdeff2.webp?ex=670f69f3&is=670e1873&hm=729f68ec3710dff8cd943cc03bdbe36bc4879a863b222377b472a359e60fa8d3&=&format=webp&width=350&height=350", // Ganti dengan URL gambar yang sesuai
        rate: 0.5 
    },
    { 
        name: "Phoenix Feather Spear", 
        grade: "Common", 
        statBoost: { 
            strength: 6, 
            intelligence: 0, 
            ability: 3 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1295679248409034784/c4c0f1cc-d69e-4dba-bcfc-45330c821ba2.webp?ex=670f86d5&is=670e3555&hm=34d586d2c1e62eab02dab5a95dbad282fb35864925a09ae1328c8f2f25832599&=&format=webp&width=585&height=585", 
        rate: 0.5 
    },
    { 
        name: "Celestial Fan", 
        grade: "Rare", 
        statBoost: { 
            strength: 0, 
            intelligence: 8, 
            ability: 2 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1295679785749577838/IMG_8691.jpg?ex=670f8755&is=670e35d5&hm=30a6fc9f05b19e1dd4b68362a4e312dd9f3bdd7479001e4d65a3de8714e974fa&=&format=webp&width=583&height=585", 
        rate: 0.25 
    },
    { 
        name: "White Tiger Claws", 
        grade: "Rare", 
        statBoost: { 
            strength: 8, 
            intelligence: 0, 
            ability: 2 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1295678525596110928/0e71e567-9dfd-4201-8e16-c43882d43953-0.png?ex=670f8629&is=670e34a9&hm=6b02756cbef255c1eadfb201c8e7e6e1ee29866ea0a69e6ff1d9a3fdd6f53580&=&format=webp&quality=lossless&width=585&height=585", 
        rate: 0.25 
    },
    { 
        name: "Vermilion Bird Bow", 
        grade: "Epic", 
        statBoost: { 
            strength: 8, 
            intelligence: 1, 
            ability: 3 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1295678525977661450/IMG_8685.jpg?ex=670f8629&is=670e34a9&hm=09f863d8f761d9817fc477a825e336f46790a766e6e67be152a14b7bbe321341&=&format=webp", 
        rate: 0.1 
    },
];
const totalRate = gachaPool.reduce((sum, weapon) => sum + weapon.rate, 0);
gachaPool.forEach(weapon => {
    weapon.normalizedRate = weapon.rate / totalRate;
});

// Helper function to pull a random weapon based on normalized rates
function pullRandomWeapon() {
    const roll = Math.random();
    let cumulativeRate = 0;

    for (const weapon of gachaPool) {
        cumulativeRate += weapon.normalizedRate;
        if (roll < cumulativeRate) {
            console.log(`You pulled: ${weapon.name} (${weapon.grade})`);
            return weapon;
        }
    }

    throw new Error("No weapon was selected.");
}

module.exports = { pullRandomWeapon };
