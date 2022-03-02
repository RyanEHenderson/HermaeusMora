import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup } from "discordx";

@Discord()
@SlashGroup( { name: "nexus", description: "Main command for Nexus interactions" } )
@SlashGroup("nexus")
class Nexus {
    @Slash()
    help(
        interaction: CommandInteraction
    ) {
        interaction.reply('Help');
    }
}
