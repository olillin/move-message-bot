const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient, Events } = require('discord.js')
const registerCommands = require('./register_commands')

const requiredEnv = ['CLIENT_ID', 'CLIENT_SECRET', 'BOT_TOKEN']
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`Missing required environment variable ${env}`)
    }
})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const BOT_TOKEN = process.env.BOT_TOKEN

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, //
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ],
})

// const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

// const embed = new EmbedBuilder()
// 	.setTitle('Some Title')
// 	.setColor(0x00FFFF);

// webhookClient.send({
// 	content: 'Webhook test',
// 	username: 'some-username',
// 	avatarURL: 'https://i.imgur.com/AfFp7pu.png',
// 	embeds: [embed],
// });

client.once(Events.ClientReady, c => {
    console.log(`Client ${c.user.username} started`)

    c.guilds.cache.forEach(guild => {
        const guildId = guild.id
        registerCommands(CLIENT_ID, guildId, BOT_TOKEN)
    })
})

client.login(BOT_TOKEN)
