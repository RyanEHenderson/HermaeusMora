const https = require('https');
const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    nexusToken
} = require('../config.json');

const options = {
    headers: {
        accept: 'application/json',
        apikey: nexusToken
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nexus')
        .setDescription('Retrieves a download link from Nexus Mods')
        .addStringOption(option =>
            option.setName('link')
            .setDescription('The link to the mod')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('version')
            .setDescription('The version of the mod')
            .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        getLink(interaction);
        await interaction.editReply('This command is not yet implemented');
    }
}

function getLink(interaction) {
    let link = interaction.options.getString('link');
    let version = interaction.options.getString('version');
    let gameName = getGameName(link);
    let modId = getModId(link);
    getModFiles(gameName, modId);
    console.log(modId);
}

function getGameName(link) {
    return link.split('/')[3];
}

function getModId(link) {
    let modId = link.split('/')[5];
    if (modId.includes('?')) {
        return modId.split('?')[0].substring(0, modId.split('?')[0].length);
    } else {
        return modId;
    }
}

function getModFiles(gameName, modId) {
    console.log(`https://api.nexusmods.com/v1/games/${gameName}/mods/${modId}/files.json`);
    https.get(`https://api.nexusmods.com/v1/games/${gameName}/mods/${modId}/files.json`, options, (res) => {
        res.on('error', (err) => {
            console.log(err);
        });

        let content = '';
        res.on('data', (chunk) => {
            content += chunk;
        });
        
        res.on('end', () => {
            let files = JSON.parse(content);
            return files;
        });
    });
};