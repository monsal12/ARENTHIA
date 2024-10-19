// Data armor pool
const armorPool = [
    { 
        name: "Steel Plate Armor", 
        grade: "Common", 
        statBoost: { 
            strength: 5, 
            intelligence: 0, 
            ability: 2
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297278103638507651/IMG_8793.jpg?ex=671557e2&is=67140662&hm=dbfcf811a4d022bcb2ce9159f8722876c94481bd8989129156328fd9bda6c761&=&format=webp&width=474&height=569",  
        rate: 0.6 
    },
    { 
        name: "Dragon Scale Armor", 
        grade: "Rare", 
        statBoost: { 
            strength: 7, 
            intelligence: 3, 
            ability: 5
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297278103873126460/IMG_8794.jpg?ex=671557e2&is=67140662&hm=ef99d9a301e8d3a80ae670958698de9657aff20c2abf00dba84f881a66ef39e3&=&format=webp&width=455&height=569", 
        rate: 0.25 
    },
    { 
        name: "Phoenix Feather Robe", 
        grade: "Epic", 
        statBoost: { 
            strength: 4, 
            intelligence: 8, 
            ability: 6
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297278104158474381/IMG_8795.jpg?ex=671557e2&is=67140662&hm=04458c88bb8029ee086a77d12b61896ac18fce72ced8ba4561e4a609fbcff8a6&=&format=webp&width=325&height=568", 
        rate: 0.1 
    },
    { 
        name: "Celestial Guardian Armor", 
        grade: "Legendary", 
        statBoost: { 
            strength: 10, 
            intelligence: 5, 
            ability: 8
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297278104430968944/IMG_8796.jpg?ex=671557e2&is=67140662&hm=931bdb508adade93547cbff63dda1afcb63084e77666b9fe9e45257f55cfc93a&=&format=webp&width=573&height=569", 
        rate: 0.04 
    }
    // Tambahkan armor lain sesuai kebutuhan
];

// Fungsi untuk menarik armor acak berdasarkan rate dan pity
const pullRandomArmor = (rateBoost, pityCounter) => {
    const totalPool = armorPool.length;

    // Hitung peluang berdasarkan rate boost
    const adjustedPool = Math.floor(totalPool * rateBoost);
    const randomIndex = Math.floor(Math.random() * adjustedPool);

    // Mengatur pity counter
    if (pityCounter >= 10) {
        // Tarik armor spesial jika pity tertrigger
        return null; // Kembalikan null untuk memicu armor spesial di luar loop
    }

    return armorPool[randomIndex % totalPool]; // Menghindari out of bounds
};

// Fungsi untuk menarik armor spesial
const pullSpecialArmor = () => {
    // Anda bisa menambahkan logika spesial untuk armor di sini
    // Misalnya, menarik armor tertentu atau mengembalikan armor tertentu
    return {
        name: "Dragon Scale Armor", 
        grade: "Rare", 
        statBoost: { 
            strength: 7, 
            intelligence: 3, 
            ability: 5
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297278103873126460/IMG_8794.jpg?ex=671557e2&is=67140662&hm=ef99d9a301e8d3a80ae670958698de9657aff20c2abf00dba84f881a66ef39e3&=&format=webp&width=455&height=569"
    };
};

module.exports = {
    pullRandomArmor,
    pullSpecialArmor,
};
