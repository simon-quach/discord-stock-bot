const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stock')
		.setDescription('retrieves stock data'),
	async execute(interaction) {
		await interaction.reply('boom');
	},
};