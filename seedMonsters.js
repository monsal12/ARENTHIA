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
            channelId: '1280464656388980758' // Ganti dengan ID channel yang sesuai
        },
        {
            name: 'Orc',
            health: 150,
            attack: 10,
            defense: 6,
            mana: 30,
            experienceReward: 100,
            celesReward: 50, // Tambahkan jika ingin memberikan reward celes
            imageUrl: 'https://media.discordapp.net/attachments/1280525209425674272/1280525367173582867/d98b60932df91642c8e6edf860d174ee.jpg?ex=6707dbae&is=67068a2e&hm=4ea3557b868f0cee129706f185de168de0f09b78107b5402e754403e881079d5&=&format=webp&width=569&height=569',
            channelId: '1280464656388980758' // Ganti dengan ID channel yang sesuai
        },
        {
            name: 'Troll',
            health: 200,
            attack:  13,
            defense: 7,
            mana: 40,
            experienceReward: 150,
            celesReward: 120, // Tambahkan jika ingin memberikan reward celes
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295392549711646782/file-40AdZ00uvPuhfTNZCq47GreD.jpg?ex=670e7bd3&is=670d2a53&hm=11342d6aad5a7f87fd2184a8d862aed08c2ed151f9caafeeb816e0ba2e2362f5&=&format=webp&width=569&height=569',
            channelId: '1280464656388980758' // Ganti dengan ID channel yang sesuai
        },
        {
            name: 'Owlbear',
            health: 350,
            attack: 20,
            defense: 8,
            mana: 60,
            experienceReward: 200,
            celesReward: 150,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295398133500477490/file-rlfKGn8OYpXXRnRt6igur8JC_2.jpg?ex=670e8106&is=670d2f86&hm=df0f0801abb2bc3d7fc6bf826960511381956a969e6f5035b75232adf1a1468b&=&format=webp&width=350&height=350',
            channelId: '1280464774832062525'
        },
        {
            name: 'Wight',
            health:  250,
            attack: 18,
            defense: 9,
            experienceReward:  250,
            celesReward: 150,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295405535155195935/pikaso_edit_Candid-image-photography-natural-textures-highly-r_2.jpg?ex=670e87eb&is=670d366b&hm=75286696ee6dac2041201536fd155066ec358d272eb908e26c85b43541499199&=&format=webp&width=442&height=569',
            channelId: '1280464774832062525'
        },
        {
            name: 'Bulette',
            health:   300,
            attack:  22,
            defense: 10,
            experienceReward:  300,
            celesReward: 200,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295403894876143667/pikaso_edit_Candid-image-photography-natural-textures-highly-r.jpg?ex=670e8663&is=670d34e3&hm=e649e488f1898de4d5be60396e78eb10da0cd53efe837c6820b09ab2d5e6b883&=&format=webp&width=442&height=569',
            channelId: '1280464774832062525'
        },
        {
            name: 'Tarrasque',
            health:   500,
            attack:  35,
            defense: 15,
            experienceReward:  500,
            celesReward: 300,
            imageUrl:  'https://media.discordapp.net/attachments/1274994236474921062/1295404684206542900/pikaso_edit_Candid-image-photography-natural-textures-highly-r_1.jpg?ex=670e8720&is=670d35a0&hm=96d14c4dad417db5f2cfbec0755cb4752c1da8f9be9401628fc2405dd47753b7&=&format=webp&width=442&height=569',
            channelId: '1280491240714010624'
        },
        {
            name: 'Beholder',
            health:   400,
            attack:   30,
            defense: 12,
            experienceReward:  400,
            celesReward: 250,
            imageUrl:  'https://media.discordapp.net/attachments/1274994236474921062/1295406999378333737/Firefly_Generate_an_image_of_a_giant_spider_its_body_the_size_of_a_small_house_with_a_dark_mottle.jpg?ex=670e8948&is=670d37c8&hm=3af89a657e86845345ca7a492c16ba93e00f54f0d614be4ad36e5877218290dd&=&format=webp',
            channelId: '1280491240714010624'
        },
        {
            name: 'Giant Spider',
            health:   600,
            attack:   40,
            defense: 18,
            experienceReward:  600,
            celesReward: 350,
            imageUrl: 'https://media.discordapp.net/attachments/1274994236474921062/1295408105730998423/Firefly_Create_an_image_of_a_beholder_a_floating_spherical_creature_with_a_mass_of_eyestalks_protr.jpg?ex=670e8a4f&is=670d38cf&hm=e9e9ceaa1a88773731af5ddff6e0df9f880726b5185423d30054e6afadcab344&=&format=webp&width=350&height=350',
            channelId: '1280491240714010624'
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