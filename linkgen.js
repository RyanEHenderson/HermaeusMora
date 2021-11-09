'use strict';

const fs = require('fs');
const https = require('https');
const {Client, Intents} = require('discord.js');
const milieu = require('milieu');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = milieu('nexus', {
    bot: {
        token: ''
    }
});

const token = config.bot.token;

function extractLink(content) {
    let lines = content.split(/\r?\n/);
    let gameId = '';
    let fileId = '';
    lines.forEach((line) => {
        if (line.startsWith('fileID')) {
            fileId = line.substring(line.indexOf('=')+1, line.length);
        }
        if (line.startsWith('url')) {
            let temp = line.substring(line.indexOf('.com/')+5, line.length);
            gameId = temp.substring(0, temp.indexOf('/'));
        }
    });
    if (gameId === '' || fileId === '') {
        return null;
    }
    return 'https://www.nexusmods.com/Core/Libs/Common/Widgets/DownloadPopUp?id=' + fileId + '&game_id=' + gameId;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Nexus Mods');
});

client.on('messageCreate', async (message) => {
    if (!message.content.toLowerCase().startsWith('!getlink')) {
        return;
    }
    if (!(message.attachments.size === 1 && message.attachments.first().name.toLowerCase().endsWith('.meta'))) {
        message.reply('You must attach exactly 1 .meta file');
        return;
    }

    let url = message.attachments.first().url;
    https.get(url, (response) => {
        response.on('error', err => {
            message.reply('There was an error checking this file, contact Robotic');
            console.log(err);
            return;
        });

        let content = '';
        response.on('data', (chunk) => {
            content += chunk;
        });

        response.on('end', () => {
            let link = extractLink(content);
            if (link === null) {
                message.reply('There was an error checking this file, contact Robotic');
                console.log(content);
                return;
            }
            message.reply('Direct download link: ' + link);
        });
    })
});

client.login(token);