const fetch = require("node-fetch");
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches PubMed')
        .addStringOption(option =>
            option.setName("term")
                  .setDescription("The search terms to be returned")
                  .setMaxLength(200)
                  .setRequired(true)),
	async execute(interaction) {
		const terms = interaction.options.getString("term");
		await interaction.deferReply();
		try {
			const ids = await searchPubMed(terms); // Assuming this is an async function that returns an array of IDs
			const embed = await createSearchResultsEmbed(terms, ids);
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply('There was an error while executing this command!');
		}
	},
};

// Function to create and return the embed
async function createSearchResultsEmbed(terms, ids) {
  let embed = new EmbedBuilder()
      .setTitle('PubMed Search Results')
      .setDescription(`Search results for: ${terms}`)
      .setColor(0x0099FF)
      .setTimestamp();

  const summaries = await fetchArticleSummaries(ids);
  if (summaries) {
    ids.forEach((id, index) => {
      if (summaries[id]) {
        const summary = summaries[id];
        const title = summary.title || 'No title available';
        const authors = summary.authors.map(author => author.name).join(', ') || 'No authors listed';
        const pubDate = summary.pubdate || 'No publication date';
        embed.addFields({ name: `${index + 1}) ${title}`, value: `Authors: ${authors}\nPublication Date: ${pubDate} [PubMed Link](https://pubmed.ncbi.nlm.nih.gov/${id}/)` });
      }
    });
  }

  return embed;
}


const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const PUBMED_API_KEY = process.env.PMAPIKEY;

async function searchPubMed(searchWords) {
  const searchQuery = encodeURIComponent(searchWords);
  const searchUrl = `${PUBMED_API_BASE_URL}esearch.fcgi?db=pubmed&term=${searchQuery}&retmode=json&retmax=10&api_key=${PUBMED_API_KEY}`;

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

// Function to fetch article summaries
async function fetchArticleSummaries(ids) {
  const idsString = ids.join(',');
  const summaryUrl = `${PUBMED_API_BASE_URL}esummary.fcgi?db=pubmed&id=${idsString}&retmode=json`;

  try {
    const response = await fetch(summaryUrl);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching article summaries:', error);
    return null;
  }
}
