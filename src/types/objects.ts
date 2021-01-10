import Discord, {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface RankingReturn {
  status: string,
  data: string
}
export interface DiscordConfig {
  client: Discord.Client,
  channel: TextChannel | DMChannel | NewsChannel,
  guild: string
}