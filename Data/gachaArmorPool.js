// Data armor pool
const armorPool = [
    
        { 
            "name": "Cursed Chestplate", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 5, 
                "intelligence": 1, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894129772232756/IMG_9085.jpg?ex=6729c637&is=672874b7&hm=0a19b8d9660998833b1adb0607f904fb8bef4f1db47a3467ecce030a0d83ebff&=&format=webp&width=436&height=498", 
            "rate": 0.6 
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
