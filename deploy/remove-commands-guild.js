const {
    guildId,
    discordToken
} = require('../config.json');

const {
    Client,
    Intents
} = require('discord.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    let guild = client.guilds.cache.get(guildId);
    guild.commands.fetch().then(commands => {
        commands.forEach(function (command) {
            guild.commands.delete(command.id).then(function () {
                console.log(`Deleted command ${command.id} (${command.name}) from ${guildId}`);
                client.destroy();
            }).catch(function (err) {
                console.log(err);
            });
        });
    });
});

client.login(discordToken);