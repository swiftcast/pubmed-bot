const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches pubmed'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};