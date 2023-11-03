const fetch = require("node-fetch");
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches PubMed')
        .addStringOption(option =>
            option.setName("term")
                  .setDescription("The search terms results to be returned")
                  .setMaxLength(200)
                  .setRequired(true)),
	async execute(interaction) {
		const terms = interaction.options.getString("term");
		await interaction.deferReply();
		try {
			let ids = await searchPubMed(terms); // Assuming this function exists and returns an array of IDs
			let embed = new EmbedBuilder()
				.setTitle('PubMed Search Results')
				.setDescription(`Search results for: ${terms}`)
				.setColor(0x0099FF)
				.setTimestamp();

			// Add a field for each ID or group them as needed
			// Note: There is a limit on the number of fields you can have in an embed
			ids.forEach((id, index) => {
				if (index < 25) { // Discord currently allows a max of 25 fields
					embed.addFields({ name: `Result ${index + 1}`, value: id.toString(), inline: true });
				}
			});

			// Reply with the embed
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply('There was an error while executing this command!');
		}
	},
};

function createIdEmbed(ids) {
  // Create a new EmbedBuilder instance
  const embed = new EmbedBuilder()
    .setTitle('List of IDs')
    .setColor(0x0099FF) // You can set any color you like
    .setTimestamp();

  // Add fields to the embed for each ID
  // If the list is too long, you might need to split it into multiple embeds
  ids.forEach((id, index) => {
    // You could also group them in a single field, depending on how you want to display them
    embed.addFields({ name: `ID ${index + 1}`, value: id.toString(), inline: true });
  });

  // Return the created embed
  return embed;
}
const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

async function searchPubMed(searchWords) {
  const searchQuery = encodeURIComponent(searchWords);
  const searchUrl = `${PUBMED_API_BASE_URL}esearch.fcgi?db=pubmed&term=${searchQuery}&retmode=json&retmax=10`;

  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    // Extract IDs from the search result
    const ids = searchData.esearchresult.idlist;
    if (ids.length === 0) {
      return []; // No results found
    }

    // You can return the IDs or use them to fetch further details as needed
    return ids;
  } catch (error) {
    console.error('Error fetching PubMed data:', error);
    return [];
  }
}

