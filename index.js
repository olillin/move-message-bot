const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient, Events, Collection, MessageFlags } = require('discord.js')
const registerCommands = require('./register_commands')
const fs = require('node:fs')
const path = require('node:path')

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
client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
        }
    }
})

client.once(Events.ClientReady, c => {
    console.log(`Client ${c.user.username} started`)

    c.guilds.cache.forEach(guild => {
        const guildId = guild.id
        registerCommands(CLIENT_ID, guildId, BOT_TOKEN)
    })
})

client.login(BOT_TOKEN)
