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

const regex = 'https:\/\/www\.nexusmods\.com\/\w+\/mods\/\d+'

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
        getLink(interaction).then(link => {
            interaction.editReply(link);
        });
    }
}

async function getLink(interaction) {
    let link = interaction.options.getString('link');
    let version = interaction.options.getString('version');
    return new Promise((resolve) => {
        if (!link.match(regex)) {
            resolve('Invalid link: `' + link + '`');
            return;
        }
        let gameName = getGameName(link);
        let modId = getModId(link);
        getModFiles(gameName, modId).then(files => {
            let fileIds = getFileId(files, version);
            if (fileIds === null) {
                resolve('Could not find the specified version');
                return;
            }
            let fileId = fileIds[1][0];
            let gameId = fileIds[1][1];
            let modName = fileIds[0];
            resolve(`Download link to \`${modName}\` version ${version}\nhttps://www.nexusmods.com/Core/Libs/Common/Widgets/DownloadPopUp?id=${fileId}&game_id=${gameId}`);
        }).catch(err => {
            console.log(err);
            resolve('An error occured getting the link');
        });
    });

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

async function getModFiles(gameName, modId) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.nexusmods.com/v1/games/${gameName}/mods/${modId}/files.json`, options, (res) => {
            res.on('error', (err) => {
                let errorCode = err.code;
                console.log(errorCode);
                reject(err);
            });

            let content = '';
            res.on('data', (chunk) => {
                content += chunk;
            });

            res.on('end', () => {
                let files = JSON.parse(content);
                resolve(files);
            });
        });
    });
};

function getFileId(filesJSON, version) {
    for (let i = 0; i < filesJSON.files.length; i++) {
        if (filesJSON.files[i].version == version) {
            return [filesJSON.files[i].name, filesJSON.files[i].id];
        }
    }
    return null;
}