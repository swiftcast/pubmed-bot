const fetch = require("node-fetch");

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches pubmed')
        .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("The search terms results to be returned")
        .setMaxLength(200)
        .setRequired(true)
    ),
	async execute(interaction) {

    const terms = interaction.options.getString("term")
		await interaction.reply('Pong!');
    searchPubMed(terms).then(results => {
            console.log(terms, results);
          });
	},
};

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