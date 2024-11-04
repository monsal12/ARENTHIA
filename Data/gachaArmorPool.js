// Data armor pool
const armorPool = [
    [
        { 
            "name": "Phantom Cloak", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 0, 
                "intelligence": 10, 
                "ability": 5 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894128732049440/IMG_9082.jpg?ex=6729c636&is=672874b6&hm=4bf307c19ce5a8241aa7351c8a389a72594d4afdf4b17e50092267cb995ec743&=&format=webp&width=399&height=498", 
            "rate": 0.2 
        },
        { 
            "name": "Witch's Robe", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 2, 
                "intelligence": 9, 
                "ability": 1 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894129016999977/IMG_9083.jpg?ex=6729c636&is=672874b6&hm=a2019842cb7748516570ec8dff55e6ba38c23faefecc152ad14b9db64982cd79&=&format=webp&width=379&height=498", 
            "rate": 0.3 
        },
        { 
            "name": "Pumpkin Armor", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 12, 
                "intelligence": 2, 
                "ability": 1 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894129356865567/IMG_9084.jpg?ex=6729c637&is=672874b7&hm=3c253f65075a7ba851d87bfb2a37d17065269df4563b1eb58254112bd8a67f75&=&format=webp&width=498&height=498", 
            "rate": 0.2 
        },
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
        },
        { 
            "name": "Vampire Cloak", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 3, 
                "intelligence": 6, 
                "ability": 3 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894130120228918/IMG_9086.jpg?ex=6729c637&is=672874b7&hm=6898bd1fa25a631e9e54eca3e184b54992dc6eaaefd6af2b264489c27f1fcce0&=&format=webp&width=498&height=498", 
            "rate": 0.4 
        },
        { 
            "name": "Mummy Wraps", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 8, 
                "intelligence": 2, 
                "ability": 5 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894131114410015/IMG_9087.jpg?ex=6729c637&is=672874b7&hm=e6e3ab55627b1d936ae2bb4ad9426a7050724d3ed3186ab549bc7d5db4009d79&=&format=webp&width=332&height=498", 
            "rate": 0.2 
        },
        { 
            "name": "Zombie Suit", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 4, 
                "intelligence": 1, 
                "ability": 1 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894131382849627/IMG_9088.jpg?ex=6729c637&is=672874b7&hm=022adb4c376e4c810f97c44ab7d577c4b837c28e25b30be4fd9baaaa426f8181&=&format=webp&width=261&height=498", 
            "rate": 0.7 
        },
        { 
            "name": "Haunted Armor", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 6, 
                "intelligence": 5, 
                "ability": 1 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894131596755024/IMG_9089.jpg?ex=6729c637&is=672874b7&hm=24b5ae0b4147850c1fbf56ec879f1a00c4f37d293297b43decfd17edc4c9df66&=&format=webp&width=332&height=498", 
            "rate": 0.3 
        },
        { 
            "name": "Banshee's Veil", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 3, 
                "intelligence": 12, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894131831373889/IMG_9090.jpg?ex=6729c637&is=672874b7&hm=87687fc600a5bc6ba52ce5c7266ec6bf1b87e85b68e9f67ed6be010345c5aa43&=&format=webp", 
            "rate": 0.1 
        },
        { 
            "name": "Bat Wings Harness", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 0, 
                "intelligence": 2, 
                "ability": 4 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894132108202055/IMG_9091.jpg?ex=6729c637&is=672874b7&hm=6c994bb8cbdf396a65bd82c5db16b8647eac47ac9d2a24258e37dcb2455db640&=&format=webp&width=498&height=498", 
            "rate": 0.6 
        },
        { 
            "name": "Gravekeeper's Garb", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 10, 
                "intelligence": 3, 
                "ability": 2 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894191243956244/IMG_9092.jpg?ex=6729c645&is=672874c5&hm=96c20c23593443537d5a8d5e82aba1fc6c475b43cd29f4023be4fc612737a3a1&=&format=webp&width=280&height=498", 
            "rate": 0.1 
        },
        { 
            "name": "Specter Suit", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 5, 
                "intelligence": 7, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894191474507797/IMG_9093.jpg?ex=6729c645&is=672874c5&hm=bf64354f4c80342076ed119194eace87d18fd9391df3564a1ed8e40d5dac759b&=&format=webp&width=398&height=498", 
            "rate": 0.4 
        },
        { 
            "name": "Creepy Chainmail", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 6, 
                "intelligence": 0, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894191780560997/IMG_9094.jpg?ex=6729c645&is=672874c5&hm=1caf4b12aafd64482901647dd73c5cc2c629963269f75b3797b5e76d3d4ca8a8&=&format=webp&width=398&height=498", 
            "rate": 0.7 
        },
        { 
            "name": "Eerie Full Plate", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 15, 
                "intelligence": 0, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894192078487644/IMG_9095.jpg?ex=6729c645&is=672874c5&hm=34dc386d3ceabb1300fb40c1ab8a56abda4644c58baaa08bd0d46526cb2e8a93&=&format=webp", 
            "rate": 0.2 
        },
        { 
            "name": "Wraith's Armor", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 2, 
                "intelligence": 4, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894192405512277/IMG_9096.jpg?ex=6729c646&is=672874c6&hm=47e0863d95b7a611ea9dce91cc3a50ee7f090e13c0876d95a926a7f5aba59148&=&format=webp&width=222&height=498", 
            "rate": 0.6 
        },
        { 
            "name": "Black Cat's Cloak", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 4, 
                "intelligence": 6, 
                "ability": 2 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302894070749855764/1302894192829272074/IMG_9097.jpg?ex=6729c646&is=672874c6&hm=4286218c29925f55b0abc2e7d97d01bbad1dfd932c42595de186de4b14db95b8&=&format=webp&width=375&height=498", 
            "rate": 0.4 
        }
    ]
    
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
