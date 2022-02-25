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

const regex = new RegExp(/.*nexusmods\.com\/\w+\/mods\/\d+(\?.*)?/g);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nexus')
        .setDescription('Main command for interacting with Nexus Mods API')
        .addSubcommand(subcommand =>
            subcommand
            .setName('link')
            .setDescription('Retrieves a download link from Nexus Mods')
            .addStringOption(option =>
                option
                .setName('link')
                .setDescription('The link to the mod')
                .setRequired(true)
            )
            .addStringOption(option =>
                option
                .setName('version')
                .setDescription('The desired version of the mod')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('versions')
            .setDescription('Retrieves a list of versions for a mod')
            .addStringOption(option =>
                option
                .setName('link')
                .setDescription('The link to the mod')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('help')
            .setDescription('Retrieves a list of commands')
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let reply = await handle(interaction);
        if (reply.length > 2000) {
            await interaction.editReply('Text response is too long for Discord, sending in multiple parts');
            let tempReply = '';
            let lines = reply.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (tempReply.length + lines[i].length > 2000) {
                    await interaction.followUp(tempReply);
                    tempReply = '';
                }
                tempReply += lines[i] + '\n';
            }
            await interaction.followUp(tempReply);
        } else {
            await interaction.editReply(reply);
        }
    }
};

async function handle(interaction) {
    let subcommand = interaction.options.getSubcommand();

    if (subcommand === 'help') {
        let help = 'This bot is used to retrieve version and download link info from <https://nexusmods.com>\n';
        help += 'To get a download link, use the following format:\n';
        help += '`/nexus link <link> <version>`\n';
        help += 'To get a list of versions, use the following format:\n';
        help += '`/nexus versions <link>`\n\n';
        help += 'This is an open source project licensed under GPLv3\n';
        help += 'The source code is available here: <https://github.com/RyanEHenderson/HermaeusMora>\n ';
        help += 'This project is currently in a testing phase and is only available in Lexy\'s LOTD server';
        return help;
    }

    let link = interaction.options.getString('link');

    return new Promise((resolve, reject) => {
        if (!link.match(regex)) {
            reject('Invalid link: `' + link + '`');
            return;
        }
        let gameName = getGameName(link);
        let modId = getModId(link);
        getModFiles(gameName, modId).then((files) => {
            getModInfo(gameName, modId).then((info) => {
                if (subcommand === 'link') {
                    let version = interaction.options.getString('version');
                    resolve(getLink(version, files, info));
                } else if (subcommand === 'versions') {
                    resolve(getVersions(files, info));
                }
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}

function getLink(version, filesJSON, info) {
    let fileIds = getFileIds(filesJSON, version);
    if (fileIds.length == 0) {
        return 'Could not find the specified version';
    }
    let modName = info.name;
    if (fileIds.length > 1) {
        let fileNames = '';
        for (let i = 0; i < fileIds.length; i++) {
            let fileId = fileIds[i][1][0];
            let gameId = fileIds[i][1][1];
            let uploadTime = fileIds[i][2].substring(0, 19);
            fileNames += fileIds[i][0] + ` ${uploadTime} https://www.nexusmods.com/Core/Libs/Common/Widgets/DownloadPopUp?id=${fileId}&game_id=${gameId}\n`;
        }
        return (`Multiple files found for ${modName} version ${version}:\n${fileNames}`);
    } else {
        let fileId = fileIds[0][1][0];
        let gameId = fileIds[0][1][1];
        let fileName = fileIds[0][0];
        return (`Download link to ${modName}: ${fileName} version ${version}\nhttps://www.nexusmods.com/Core/Libs/Common/Widgets/DownloadPopUp?id=${fileId}&game_id=${gameId}`);
    }
};

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
                console.log(err);
                reject('An unknown error occured retrieving this mod');
            });

            let content = '';
            res.on('data', (chunk) => {
                content += chunk;
            });

            res.on('end', () => {
                let files = JSON.parse(content);
                if (files.hasOwnProperty('code')) {
                    let errorCode = files.code;
                    if (errorCode === 404) {
                        reject('That mod does not exist');
                    } else if (errorCode === 403) {
                        reject('That mod is currently hidden');
                    } else {
                        console.log(files);
                        reject('An unknown error occured retrieving this mod');
                    }
                    return;
                } else if (files.hasOwnProperty('message')) {
                    reject('An error occured');
                    return;
                }

                resolve(files);
            });
        });
    });
};

async function getModInfo(gameName, modId) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.nexusmods.com/v1/games/${gameName}/mods/${modId}.json`, options, (res) => {
            res.on('error', (err) => {
                console.log(err);
                reject('An unknown error occured retrieving mod info');
            });

            let content = '';
            res.on('data', (chunk) => {
                content += chunk;
            });

            res.on('end', () => {
                let info = JSON.parse(content);
                resolve(info);
            });
        });
    });
}

function getFileIds(filesJSON, version) {
    if (version === 'none' || version === 'blank') {
        version = "";
    }
    let files = [];
    for (let i = 0; i < filesJSON.files.length; i++) {
        if (filesJSON.files[i].version == version) {
            files.push([filesJSON.files[i].name, filesJSON.files[i].id, filesJSON.files[i].uploaded_time]);
        }
    }
    return files;
}

function getVersions(filesJSON, info) {
    let versions = [];
    for (let i = 0; i < filesJSON.files.length; i++) {
        if (!versions.includes(filesJSON.files[i].version)) {
            versions.push(filesJSON.files[i].version);
        }
    }
    let versionString = `Found the following versions for ${info.name}: ${versions.join(', ')}`;
    return versionString;
}