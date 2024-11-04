const gachaPoolAksesoris = [
    
        { 
            "name": "Cursed Ring", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 0, 
                "intelligence": 8, 
                "ability": 7 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897218797178881/IMG_9098.jpg?ex=6729c917&is=67287797&hm=853fb238716753b7f6637eff39220a4919806c0af92b080fb8432681409c0bb3&=&format=webp&width=498&height=498", 
            "rate": 0.1
        },
        { 
            "name": "Witch's Hat", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 2, 
                "intelligence": 10, 
                "ability": 0 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897219086843946/IMG_9099.jpg?ex=6729c917&is=67287797&hm=10a4fdf6e5a7bd5e568079e12537825cc6de801579773f385d892ed305d927d5&=&format=webp&width=498&height=498", 
            "rate": 0.3 
        },
        { 
            "name": "Pumpkin Amulet", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 5, 
                "intelligence": 6, 
                "ability": 4 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897219388702740/IMG_9100.jpg?ex=6729c917&is=67287797&hm=ad0589090601021705802b254dd8aeda0eaae484d0913878403cce4bf4db449c&=&format=webp&width=498&height=498", 
            "rate": 0.2 
        },
        { 
            "name": "Ghostly Pendant", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 1, 
                "intelligence": 3, 
                "ability": 2 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897219732766771/IMG_9101.jpg?ex=6729c917&is=67287797&hm=6b82b68fa13f7b175130427e619e6cc399b9db960d98759207c314d9911f87ed&=&format=webp&width=498&height=498", 
            "rate": 0.6 
        },
        { 
            "name": "Vampire Fangs Necklace", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 3, 
                "intelligence": 4, 
                "ability": 5 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897220059791430/IMG_9102.jpg?ex=6729c917&is=67287797&hm=103d334c0997ce416b754e3743c473b257a4a913c93410a2600594a863d9155c&=&format=webp&width=384&height=497", 
            "rate": 0.4 
        },
        { 
            "name": "Banshee's Earrings", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 0, 
                "intelligence": 12, 
                "ability": 3 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897220433215508/IMG_9103.jpg?ex=6729c918&is=67287798&hm=d3d1deba3925836dc3f5b81499468aa6ad1f9493f8c7a2becb8f126b0b40b9ac&=&format=webp&width=498&height=498", 
            "rate": 0.2 
        },
        { 
            "name": "Zombie Finger Ring", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 2, 
                "intelligence": 2, 
                "ability": 2 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897220710043679/IMG_9104.jpg?ex=6729c918&is=67287798&hm=58b4225f03e2cdcf1733f4501361699de824817e71a456057cb77458870e581f&=&format=webp&width=498&height=498", 
            "rate": 0.7 
        },
        { 
            "name": "Haunted Brooch", 
            "grade": "ultra rare", 
            "statBoost": { 
                "strength": 1, 
                "intelligence": 8, 
                "ability": 3 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897220982407199/IMG_9105.jpg?ex=6729c918&is=67287798&hm=ca126cea4a61f1ef93321f87d59939d84a29356876385f3efeed67403ebbf571&=&format=webp&width=664&height=498", 
            "rate": 0.3 
        },
        { 
            "name": "Eerie Charm Bracelet", 
            "grade": "epic", 
            "statBoost": { 
                "strength": 4, 
                "intelligence": 7, 
                "ability": 4 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897221259497483/IMG_9106.jpg?ex=6729c918&is=67287798&hm=20fcbe5f74688216463afd1dc133adcbbb3a63e47c9790cfa4b880128392ff1e&=&format=webp&width=332&height=498", 
            "rate": 0.1 
        },
        { 
            "name": "Black Cat's Tail Charm", 
            "grade": "rare", 
            "statBoost": { 
                "strength": 1, 
                "intelligence": 3, 
                "ability": 2 
            }, 
            "imageUrl": "https://media.discordapp.net/attachments/1302897152204345384/1302897221561483355/IMG_9107.jpg?ex=6729c918&is=67287798&hm=568edd5d53e5117b0c3a11489c99d10f5c73cc8cd855dd28b688df70008e209f&=&format=webp&width=427&height=498", 
            "rate": 0.6 
        }
    
    
];

// Helper function to pull a random accessory based on rates
function pullRandomAksesoris() {
    const roll = Math.random();
    let cumulativeRate = 0;

    for (const aksesoris of gachaPoolAksesoris) {
        cumulativeRate += aksesoris.rate;
        if (roll < cumulativeRate) {
            return aksesoris;
        }
    }
}

module.exports = { pullRandomAksesoris }; // Pastikan diekspor
