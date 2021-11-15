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
        await interaction.reply('This command is not yet implemented');
    }
}

function getLink(command) {

}