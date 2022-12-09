// dotenv config
const dotenv = require('dotenv')
dotenv.config()
const { TOKEN, API_KEY } = process.env

// finnhub RESTful API config
const finnhub = require('finnhub')

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = API_KEY
const finnhubClient = new finnhub.DefaultApi()

// discord config
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js')

const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
});

// Logs in Discord Bot
client.login(TOKEN)

// Discord Bot connection confirmation
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

let sym = '';
// use !stock "stockSymbol" to display stock data
client.on("messageCreate", async (message) => {
    if(!message?.author.bot){
        if (message.content.startsWith('!stock')) {
            // removes the "!stock" at beginning of the message
            const input = message.content.slice(7)
            sym = input.toUpperCase()

            if(input.length > 4){
                message.reply("Please enter a valid stock symbol")
                return
            }
            
            // using callback hell for now so i wanna try to find a better way to implement this API call
            finnhubClient.symbolSearch(input.toLowerCase(), (error, data, response) => {
                if (error) {
                    message.reply("Please enter a valid symbol (ex: !stock AAPL)")
                    return
                }
                //data should return "data", which is a parsed json object
                const desc = data.result[0].description
                const symbol = data.result[0].symbol
                finnhubClient.quote(input.toUpperCase(), (error, data, response) => {
                    const { c, l, h, dp, o } = data
                    const embed = {
                        color: 5763719,
                        title: `${desc} (${symbol})`,
                        fields: [
                            { name: "Current Price", value: `$${c}`, inline: true},
                            { name: "Low", value: `$${l}`, inline: true},
                            { name: "High", value: `$${h}`, inline: true},
                            { name: "Percentage Change", value: `${dp}%`, inline: true},
                            { name: "Open Price of the Day", value: `$${o}`, inline: true}
                        ]
                    }
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('primary')
                                .setLabel('Company News')
                                .setStyle(ButtonStyle.Success),
                        );
                    // Bot replies with an embedded message with stock data
                    message.reply({ embeds: [embed], components: [row] })
                    })
            })
        }
    }
});

// client.on(Events.InteractionCreate, interaction => {
// 	if (interaction.customId === 'primary') {
//         const date = new Date()
//         const currentDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
//         const previousWeek = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()-7}`
//         console.log(sym)
//         console.log(previousWeek)
//         console.log(currentDate)
//         finnhubClient.companyNews(sym, previousWeek, currentDate, (error, data, response) => {
//             console.log(data)
//             // const { headline, related, image, source, summary, url } = data
//             // const embed = {
//             //     color: 5763719,
//             //     title: `${sym} News`,
//             //     fields: [
//             //         { name: "Headline", value: `${headline}`, inline: true}
//             //     ]
//             // }
//             // interaction.reply({ embeds: [embed] })
//             interaction.reply('thanks')
//         })
//     }
// });