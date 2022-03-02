import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup } from "discordx";

@Discord()
@SlashGroup( { name: "auth", description: "Authenticates the user with Nexus Mods", root : "nexus"})
@SlashGroup("auth", "nexus")
class NexusAuth {
    @Slash("nexus")
    async nexus(
        @SlashOption("create") create: string,
        interaction: CommandInteraction
    ) {
        if (create) {
            await interaction.reply(create);
        } else {
            await interaction.reply("No command");
        }
    }
}