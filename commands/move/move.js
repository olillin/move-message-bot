const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move') //
        .setDescription('Move a message to another channel')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        await interaction.reply(`Command ran in ${interaction.channel.id}`)
    },
}
