import Discord, {DMChannel, MessageEmbed, NewsChannel, TextChannel} from 'discord.js'
import dotenv from 'dotenv'
import {initialiseDB} from "./handler/firebase-admin";
import {convertTime} from "./utilities/numberprocessing";
import {getRankingData} from "./utilities/datafetcher";
import SLTO from "./types/SLTO";
import {DiscordConfig, RankingReturn} from "./types/objects";

//config .env
dotenv.config()

const client: Discord.Client = new Discord.Client()
const database = initialiseDB().collection("timestamp")

client.on("ready", () => {
  console.log("Bot is ready")
})

client.on("voiceStateUpdate", async (bf, af) => {
  let memberID: string, guild: string

  if (bf.channel === null) {
    memberID = af.id
    guild = af.guild.id
    await database.add({UID: memberID, ServerID: guild, intime: Date.now(), outtime: 0})
  } else if (af.channel === null) {
    memberID = bf.id
    const target = await database.where("outtime", "==", 0).where("UID", "==", memberID).get()
    try {
      await database.doc(target.docs[0].id).update({outtime: Date.now()})
    } catch (_) {

    }
  }

})

client.on("message", async (mess) => {
  if (mess.author.id !== "784856113220419594") {
    const channel: TextChannel | DMChannel | NewsChannel = mess.channel
    const guild: string = (mess.guild !== null) ? mess.guild.id : "null"
    const lowerContent: string = mess.content.toLowerCase()
    if (lowerContent.includes("-info")) {
      const args: string = lowerContent.replace("-info ", "")
      let result: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
      switch (args) {
        case "past":
          result = await database.where("ServerID", "==", guild)
            .where("UID", "==", mess.author.id)
            .where("outtime", "!=", 0)
            .orderBy("outtime", "desc")
            .limit(1)
            .get()
          if (!result.empty) {
            let latest = result.docs[0]
            await channel.send(`Last call time: ${convertTime(parseInt(latest.get("outtime")) - parseInt(latest.get("intime")))}`)
          } else {
            await channel.send("No history available :/")
          }
          break
        case "current":
          result = await database.where("ServerID", "==", guild)
            .where("UID", "==", mess.author.id)
            .where("outtime", "==", 0)
            .orderBy("intime", "desc")
            .limit(1)
            .get()
          if (!result.empty) {
            let latest = result.docs[0]
            await channel.send(`Calling time: ${convertTime(Date.now() - parseInt(latest.get("intime")))}`)
          } else {
            await channel.send('You are not hanging in any call right now.')
          }
          break
        default:
          await channel.send('Invalid argument try `past` or `current`.')

      }
    }
    if (lowerContent.includes("-ranking") || lowerContent.includes("-rank")) {
      const args: string = lowerContent.replace("-rank ", "").replace("-ranking ", "")
      let limit: boolean = !(args === "all")
      let pramDiscordConfig: DiscordConfig = {client: client, channel: channel, guild: guild}
      let rankingOutput: RankingReturn
      switch (args) {
        case "" || "all":
          rankingOutput = await getRankingData(pramDiscordConfig,limit,false)
          switch (rankingOutput.status) {
            case "failed":
              await channel.send('Aww no ranking data for now :/')
              break
            case "success":
              let content: MessageEmbed = new Discord.MessageEmbed().setTitle("คนเหงา 2021").setDescription(rankingOutput.data)
              await channel.send(content)
              break
          }
          break
        case "dev":
          rankingOutput = await getRankingData(pramDiscordConfig,false,true)
          switch (rankingOutput.status) {
            case "failed":
              await channel.send('Aww no ranking data for now :/')
              break
            case "success":
              let content: MessageEmbed = new Discord.MessageEmbed().setTitle("คนเหงา 2021 (DEV)").setDescription(rankingOutput.data)
              await channel.send(content)
              break
          }
          break
        default:
          await channel.send('Invalid argument try `blank` or `all`.')
      }
    }
  }
})


client.login(process.env.DISCORD_TOKEN)