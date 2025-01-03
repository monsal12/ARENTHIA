const mongoose = require('mongoose');
const Monster = require('./models/monster');

const seedMonsters = async () => {
    const monsters = [
        {
            name: 'Goblin',
            health: 100,
            attack: 5,
            defense: 5,
            mana: 20,
            experienceReward: 50,
            celesReward: 20, // Tambahkan jika ingin memberikan reward celes
            imageUrl: 'https://media.discordapp.net/attachments/1280525209425674272/1280525366833709096/73959800-8932-4961-bac7-cbc979166812_1.png?ex=6707dbae&is=67068a2e&hm=16256afcfb46182b5dc92c52633d75026a441029fb5e072ba3604c8a308f4d65&=&format=webp&quality=lossless&width=379&height=569',
            channelId: '1319858289122476053' // Ganti dengan ID channel yang sesuai
        },
        {
            name: 'Wight',
            health:  250,
            attack: 18,
            defense: 9,
            experienceReward:  250,
            celesReward: 150,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295405535155195935/pikaso_edit_Candid-image-photography-natural-textures-highly-r_2.jpg?ex=670e87eb&is=670d366b&hm=75286696ee6dac2041201536fd155066ec358d272eb908e26c85b43541499199&=&format=webp&width=442&height=569',
            channelId: '1319858917118840832'
        },
        {
            name: 'Giant Spider',
            health:   600,
            attack:   40,
            defense: 18,
            experienceReward:  600,
            celesReward: 350,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295408105730998423/Firefly_Create_an_image_of_a_beholder_a_floating_spherical_creature_with_a_mass_of_eyestalks_protr.jpg?ex=670e8a4f&is=670d38cf&hm=e9e9ceaa1a88773731af5ddff6e0df9f880726b5185423d30054e6afadcab344&=&format=webp&width=350&height=350',
            channelId: '1319863662638530640'
        }
    ];

    await Monster.insertMany(monsters);
    console.log('Monsters added to the database!');
    mongoose.connection.close();
};

mongoose.connect('mongodb+srv://salmanempire200:Terdes1234@cluster0.rk1hw.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        seedMonsters();
    })
    .catch(err => console.log(err));