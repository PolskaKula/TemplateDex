// Don't change the code till line 11!
const { Client, IntentsBitField, EmbedBuilder, PermissionsBitField, ActivityType, SlashCommandBuilder, MessagePayload, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, BaseSelectMenuBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const { CanvasImage } = require('canvacord');
require('dotenv').config();
const db = new QuickDB();

const Discord = require('discord.js')

var timeout = [];

const cardCount = /* Here insert number of your cards. Remember to change it after every update! */;

// Don't touch the code till Channel set command.
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const fs = require('fs');
const { getServers } = require('dns');

client.commands = new Discord.Collection

const commandFiles = fs.readdirSync('src/commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`)

    client.commands.set(command.name, command)
}

client.on('ready', async () => {
    console.log(`${client.user.tag} is on.`);

    const CS = new SlashCommandBuilder()
    .setName('channelset')
    .setDescription('Sets a channel to spawn balls on');

    client.application.commands.create(CS);

    const Completion = new SlashCommandBuilder()
    .setName('completion')
    .setDescription('Shows the completion of your balls');

    client.application.commands.create(Completion);
    
    const List = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Shows the list of your balls')

    client.application.commands.create(List);
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand()) return;
    
    // Channel set command.
    if(interaction.commandName === 'channelset') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "Sorry, you have no permissions to do that!", ephemeral: true });
        await db.set(`channel_${interaction.guild.id}`, interaction.channel.id)

        const embed = new MessagePayload(interaction.guild, {
            embeds: [{
                title: `Channel set`,
                author: ({ name: `${interaction.user.globalName}` }),
                description: `Channel <#${await db.get(`channel_${interaction.guild.id}`)}> has been set as spawn channel!`,
                footer: ({ text: 'Bot created by [insert ur username]' }),
                color: (0x0099FF),
            }],
        });
        
        await interaction.reply(embed);
    }

    if(interaction.commandName === 'completion') {
        var page = 1;

        // This variable says how many cards this user has. Leave as 0.
        let cards = 0;

        // In 'YourBall' field insert the name of your ball. Leave value empty. Copy it as much as you have balls in the dex.
        let isYourBall = "";
        
        // Same here, but in ExampleEmoji insert the name of your emoji, while in ExampleEmojiID insert the emoji's ID. Copy it as much as you have balls in the dex.
        let isntYourBall = "<:ExampleEmoji:ExampleEmojiID> ";

        // This if checks if you have ball in the completion. Change yourballid to ID of your ball, which you will set later.
        if (await db.get(`yourballid-count-${interaction.user.id}`) >= 1) { 
            cards++;
            isYourBall = isYourBall;
            isntYourBall = "";
        }




        // If you have more than 1 page, use the page thing. Otherwise delete it.
        const Page1 = new ButtonBuilder()
            .setLabel("Page 1")
            .setCustomId('page1')
            .setStyle(ButtonStyle.Primary)
            
        const Page2 = new ButtonBuilder()
            .setLabel("Page 2")
            .setCustomId('page2')
            .setStyle(ButtonStyle.Primary)

        const PageRow = new ActionRowBuilder().addComponents(Page1, Page2)

        // Here is the ember creator. Change isYourBall and isntYourBall to your previous variables.
        const embed = new MessagePayload(interaction.guild, {
            embeds: [{
                author: ({ name: `${interaction.user.globalName}` }),
                description: `YourDex completion: **${Math.round((cards / cardCount) * 1000) / 10}%**`,
                fields: [
                    { name: '**__Owned figures__**', value: "" }, 
                    { name: '**Common:**', value: `${isYourBall}`,}
                    { name: '**__Missing figures__**', value: "" }, 
                    { name: '**Common:**', value: `${isntYourBall}`,}
                ],
                footer: ({ text: `Page 1/2` }),
                color: (0x0099FF),
            }],
            // Delete the line below if you don't use pages.
            components: [PageRow],
        });
        
        // Don't touch the line below!
        const reply = await interaction.reply(embed);

        // If you don't use pages, delete the thing below.
        Page1.setDisabled(true)
        Page2.setDisabled(false)
        try {
            // Page 1.
            await reply.edit({
                embeds: [{
                    author: ({ name: `${interaction.user.globalName}` }),
                    description: `YourDex completion: **${Math.round((cards / cardCount) * 1000) / 10}%**`,
                    fields: [
                        { name: '**__Owned figures__**', value: "" }, 
                        { name: '**Common:**', value: `${isYourBall}`,}
                        { name: '**__Missing figures__**', value: "" }, 
                        { name: '**Common:**', value: `${isntYourBall}`,}
                    ],
                    footer: ({ text: `Page 1/2` }),
                    color: (0x0099FF),
                }],
                components: [PageRow],
            }).catch(err => {});
        } catch (error) {
            console.error('Error page 1');
        }

        // Cooldown when you cannot change page anymore in miliseconds.
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
        })

        collector.on('collect', async (interaction2) => {
            if (interaction.user.id !== interaction2.user.id) return;

            // Page 1 again.
            if (interaction2.customId === 'page1') {
                page = 1;
                Page1.setDisabled(true)
                Page2.setDisabled(false)
                try {
                    await reply.edit({
                        embeds: [{
                            author: ({ name: `${interaction.user.globalName}` }),
                            description: `YourDex completion: **${Math.round((cards / cardCount) * 1000) / 10}%**`,
                            fields: [
                                { name: '**__Owned figures__**', value: "" }, 
                                { name: '**Common:**', value: `${isYourBall}`,}
                                { name: '**__Missing figures__**', value: "" }, 
                                { name: '**Common:**', value: `${isntYourBall}`,}
                            ],
                            footer: ({ text: `Page 1/2` }),
                            color: (0x0099FF),
                        }],
                        components: [PageRow],
                    }).catch(err => {});
                } catch (error) {
                    console.error('Error page 1');
                }

                collector.resetTimer();
            } else if (interaction2.customId === 'page2') {
                // Page 2.
                page = 2;
                Page2.setDisabled(true)
                Page1.setDisabled(false)
                try {
                    await reply.edit({
                        embeds: [{
                            author: ({ name: `${interaction.user.globalName}` }),
                            description: `YourDex completion: **${Math.round((cards / cardCount) * 1000) / 10}%**`,
                            fields: [
                                { name: '**__Owned figures__**', value: "" }, 
                                { name: '**Common:**', value: `${isYourBall}`,}
                                { name: '**__Missing figures__**', value: "" }, 
                                { name: '**Common:**', value: `${isntYourBall}`,}
                            ],
                            footer: ({ text: `Page 1/2` }),
                            color: (0x0099FF),
                        }],
                        components: [PageRow],
                    }).catch(err => {});
                } catch (error) {
                    console.error('Error page 2');
                }

                collector.resetTimer();
            }
        })

        // Leave as it is.
        collector.on('end', async () => {
            Page1.setDisabled(true);
            Page2.setDisabled(true);

            try {
                await reply.edit({
                    components: [PageRow]
                });
            } catch (error) {
                console.error('Error', error);
            }
        })

        return reply;
    }

    if(interaction.commandName === 'list') {
        var cards = [];
        var cache = [];
        if (await db.get(`collection.${interaction.user.id}`) != null) cache = Object.values(await db.get(`collection.${interaction.user.id}`));

        for (i = 0; i < cache.length; i++) {
            if (cache[i] == null) delete cache[i];
        }
        
        cache = cache.filter(element => element !== undefined || element !== null)

        for (i = 0; i < cache.length; i++) {
            if (cache[i] != null && cache[i] != undefined) cards.push(await db.get(`${cache[i].cardid}.name`));
        }
        
        cards = cards.filter(element => element !== undefined || element !== null)

        const realEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.globalName}` })
            .setTitle(`${interaction.user.displayName}'s historical figures`)
            .setFooter({ text: `Page 1/1` })
            .setColor(0x0099FF);

        const description = cards.join('\n');
        if (await db.get(`collection.${interaction.user.id}`) != null) realEmbed.setDescription(description); else realEmbed.setDescription("Nothing to see here!");

        const embed = new MessagePayload(interaction.guild, {
            embeds: [realEmbed],
        });
        
        await interaction.reply(embed);
    }
})

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    async function spawn(image, name, alias1, alias2, alias3, databaseName, baseHP, baseATK) {
        let isButtonLocked = false;

        const ButtonFirst = new ButtonBuilder()
            .setLabel('Catch me!')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('catch-me')
        
        const ButtonRow = new ActionRowBuilder().addComponents(ButtonFirst);

        const attachment = new MessagePayload(message.guild, {
            files: [
                {
                    attachment: image,
                    name: "ball.png"
                }
                ],
                content: 'A wild [yourtext] appeared!',
                components: [ButtonRow],
            });

        const channelsetid = await db.get(`channel_${message.guild.id}`);
        const channelset = client.channels.cache.find(channel => channel.id === channelsetid);
        
        const reply = await channelset.send(attachment);

        try {
            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                // Time before the ball despawns in miliseconds.
                time: 300000,
            })

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'catch-me') {
                    const modal = new ModalBuilder({
                        customId: `catchModal-${interaction.user.id}`,
                        title: 'Guess the [yourtext]'
                    })
            
                    const catchInput = new TextInputBuilder({
                        customId: `catchInput`,
                        label: '[yourtext]',
                        style: TextInputStyle.Short
                    })
            
                    const modalRow = new ActionRowBuilder().addComponents(catchInput)
            
                    modal.addComponents(modalRow)
            
                    await interaction.showModal(modal)

                    ButtonFirst.setDisabled(true);
                    try {
                        await reply.edit({
                            components: [ButtonRow]
                        });
                    } catch (error) {
                        console.error('Error', error);
                    }
            
                    const filter = (interaction) => interaction.customId === `catchModal-${interaction.user.id}`;
            
                    interaction.awaitModalSubmit({ filter, time: 30000 })
                        .then(async (modalInteraction) => {
                            try {
                                const caught = modalInteraction.fields.getTextInputValue(`catchInput`)
                
                                if (caught.toLowerCase() === name.toLowerCase() || caught.toLowerCase() === alias1.toLowerCase() || caught.toLowerCase() === alias2.toLowerCase() || caught.toLowerCase() === alias3.toLowerCase()) {
                                    if (isButtonLocked) return modalInteraction.reply(`<@${interaction.user.id}> I was caught already!`);
                                    const isShiny = Math.floor(Math.random() * 500)

                                    if (isShiny == 0) {    
                                        const hpchanger = Math.round(Math.random() * 40);
                                        const damagechanger = Math.round(Math.random() * 40);

                                        await db.add(`${databaseName}-count-${interaction.user.id}`, 1);
                                        await db.add(`overall-count-${interaction.user.id}`, 1);
                                        if (await db.get(`${databaseName}-count-${interaction.user.id}`) == 1) await db.add(`card-count-${interaction.user.id}`, 1);

                                        const cardIdOverall = await db.add(`card-id-overall`, 1);
                                        const cardId = `#${cardIdOverall}`;
                                        const countCards = await db.get(`overall-count-${interaction.user.id}`);
                                        await db.set(`collection.${interaction.user.id}.${countCards}`, { cardid: cardId });

                                        await db.set(`${cardId}.name`, `:sparkles: ${name} (ID: ${cardId}, ${hpchanger}% HP; ${damagechanger}% ATK)`);
                                        await db.set(`${cardId}.hp`, baseHP + ((baseHP / 100) * hpchanger));
                                        await db.set(`${cardId}.atk`, baseATK + ((baseATK / 100) * damagechanger));

                                        if (await db.get(`${databaseName}-count-${interaction.user.id}`) != 1) {
                                            modalInteraction.reply(`<@${interaction.user.id}> You caught **${name}!** (\u0060${cardId}\u0060)\n\n*[yourtext for a shiny]*`);
                                        } else {
                                            modalInteraction.reply(`<@${interaction.user.id}> You caught **${name}!** (\u0060${cardId}\u0060)\n\n*[yourtext for a shiny]*\nThis is a **new [yourtext]** that has been added to your completion!`);
                                        }
                                    } else {    
                                        const hpchanger = Math.round((Math.random() * 40) - 20);
                                        const damagechanger = Math.round((Math.random() * 40) - 20);

                                        await db.add(`${databaseName}-count-${interaction.user.id}`, 1);
                                        await db.add(`overall-count-${interaction.user.id}`, 1);
                                        if (await db.get(`${databaseName}-count-${interaction.user.id}`) == 1) await db.add(`card-count-${interaction.user.id}`, 1);

                                        const cardIdOverall = await db.add(`card-id-overall`, 1);
                                        const cardId = `#${cardIdOverall}`;
                                        const countCards = await db.get(`overall-count-${interaction.user.id}`);
                                        await db.set(`collection.${interaction.user.id}.${countCards}`, { cardid: cardId });

                                        await db.set(`${cardId}.name`, `${name} (ID: ${cardId}, ${hpchanger}% HP; ${damagechanger}% ATK)`);
                                        await db.set(`${cardId}.hp`, baseHP + ((baseHP / 100) * hpchanger));
                                        await db.set(`${cardId}.atk`, baseATK + ((baseATK / 100) * damagechanger));

                                        if (await db.get(`${databaseName}-count-${interaction.user.id}`) != 1) {
                                            modalInteraction.reply(`<@${interaction.user.id}> You caught **${name}!** (\u0060${cardId}\u0060)`);
                                        } else {
                                            modalInteraction.reply(`<@${interaction.user.id}> You caught **${name}!** (\u0060${cardId}\u0060)\n\nThis is a **new [yourtext]** that has been added to your completion!`);
                                        }
                                    }

                                    isButtonLocked = true;
                                    
                                    ButtonFirst.setDisabled(true);
                                    try {
                                        await reply.edit({
                                            components: [ButtonRow]
                                        });
                                    } catch (error) {
                                        console.error('Error', error);
                                    }
                                } else {
                                    modalInteraction.reply(`<@${interaction.user.id}> Wrong name!`);
                                    ButtonFirst.setDisabled(false);
                                    try {
                                        await reply.edit({
                                            components: [ButtonRow]
                                        });
                                    } catch (error) {
                                        console.error('Error', error);
                                    }
                                }
                            } catch (error) {
                                console.error('Error', error);
                                modalInteraction.reply(`<@${interaction.user.id}> an error occured, try again!`);
                                ButtonFirst.setDisabled(false);
                                try {
                                    await reply.edit({
                                        components: [ButtonRow]
                                    });
                                } catch (error) {
                                    console.error('Error', error);
                                }
                            }
                        }).catch(async (error) => {
                            ButtonFirst.setDisabled(false);
                            try {
                                await reply.edit({
                                    components: [ButtonRow]
                                });
                            } catch (error) {
                                console.error('Error', error);
                            }
                            console.error('Error', error);
                        });
                }
            })

            collector.on('end', async () => {
                ButtonFirst.setDisabled(true);

                try {
                    await reply.edit({
                        components: [ButtonRow]
                    });
                } catch (error) {
                    console.error('Error', error);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    if (message.guild.memberCount >= 10 || message.guild.id === "1128754504775512155") {
        if (timeout.includes(message.guild.id)) return null;
        if (await db.get(`channel_${message.guild.id}`) != null) {
            const rarity = Math.floor(Math.random() * 1000);
            if (rarity <= /* How often the card will spawn. The bigger number, the more often rarity. */) {    
                const FigureID = Math.floor(Math.random() * /*Number of cards in a certain rarity*/);
                if (FigureID == 0) {
                    spawn(/* Image link */, /*Name*/, /*Alias1*/, /*Alias2*/, /*Alias3*/, /*BallID*/, /*HP*/, /*ATK*/)
                } 
            } else if (rarity <= 649 && rarity >= 350) {    
                // Same with this rarity
            } else if (rarity >= 999) {    
                // The rarest rarity
            }
            
            timeout.push(message.guild.id)
            setTimeout(() => {
                timeout.shift();
                // Time between balls to spawn in miliseconds.
            }, 2700000)
        }
    }
});

client.login(/*Your bot's token*/);
