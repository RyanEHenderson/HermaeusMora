const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    nexusToken
} = require('../config.json');

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
    console.log(link);
    console.log(version);
    getGameName(link);
    getModId(link);
}

function getGameName(link) {
    return link.split('/')[3];
}

function getModId(link) {
    return link.split('/')[5];
}