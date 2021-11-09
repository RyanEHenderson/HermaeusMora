'use strict';

const fs = require('fs');
const https = require('https');
const {Client, Intents} = require('discord.js');
const milieu = require('milieu');

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });
const config = milieu('nexus', {
    bot: {
        token: ''
    }
});

const token = config.bot.token;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Nexus Mods');
});

client.login(token);