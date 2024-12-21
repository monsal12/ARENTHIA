const gachaPoolAksesoris = [
    
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
