import {convertTime} from "./numberprocessing";
import Discord, {DMChannel, MessageEmbed, NewsChannel, TextChannel} from "discord.js";
import {initialiseDB} from "../handler/firebase-admin";
import SLTO from "../types/SLTO";
import {DiscordConfig, RankingReturn} from "../types/objects";

const database = initialiseDB().collection("timestamp")

export const getRankingData = async (discordConfig: DiscordConfig, limit: boolean, dev: boolean): Promise<RankingReturn> => {
  let sumResult: SLTO = {}
  let stat: string = "failed"
  let rank: string = ""
  const result = await database.where("ServerID", "==", discordConfig.guild).where("outtime", "!=", 0).get()
  if (!result.empty) {
    result.forEach((row) => {
      sumResult[row.get("UID")] = ((row.get("UID") in sumResult) ? sumResult[row.get("UID")] : 0) + (row.get("outtime") - row.get("intime"))
    })
    const sorted: object = Object.fromEntries(
      Object.entries(sumResult).sort(([, a], [, b]) => b - a)
    )
    let times: number = 0
    for (const [key, value] of Object.entries(sorted)) {
      if (times === 5 && limit) {
        break
      }
      let user = await discordConfig.client.users.fetch(key)
      if (!user.bot) {
        switch (dev) {
          case true:
            rank += `${times + 1}. **${user.username}** -> ${value} \n`
            break
          case false:
            rank += `${times + 1}. **${user.username}** -> ${convertTime(value)} \n`
            break
        }
        times++
      }
    }
    stat = "success"
  }

  return {status: stat, data: rank}
}