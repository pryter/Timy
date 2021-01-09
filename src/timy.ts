import Discord, {Client, DMChannel, MessageEmbed, NewsChannel, TextChannel} from 'discord.js'
import dotenv from 'dotenv'
import {initialiseDB} from "./handler/firebase-admin";
import {convertTime} from "./utilities/numberprocessing";
import SLTO from "./types/SLTO";

//config .env
dotenv.config()

const client = new Discord.Client()
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
      let sumResult: SLTO = {}
      if (args === "all" || lowerContent === "-rank" || lowerContent === "-ranking") {
        const result = await database.where("ServerID", "==", guild).where("outtime", "!=", 0).get()
        if (!result.empty) {
          result.forEach((row) => {
            sumResult[row.get("UID")] = ((row.get("UID") in sumResult) ? sumResult[row.get("UID")] : 0) + (row.get("outtime") - row.get("intime"))
          })
          const sorted: object = Object.fromEntries(
            Object.entries(sumResult).sort(([, a], [, b]) => b - a)
          )
          let times: number = 0
          let rank: string = ""
          for (const [key, value] of Object.entries(sorted)) {
            if (times === 5 && limit) {
              break
            }
            let user = mess.guild?.members.cache.get(key)
            if (!user?.user.bot) {
              rank += `${times + 1}. **${user?.displayName}** -> ${convertTime(value)} \n`
              times++
            }
          }
          let content: MessageEmbed = new Discord.MessageEmbed().setTitle("คนเหงา 2021").setDescription(rank)
          await channel.send(content)
        }else{
          await channel.send('Aww no ranking data for now :/')
        }
      } else {
        await channel.send('Invalid argument try `blank` or `all`.')
      }
    }
  }
})


client.login(process.env.DISCORD_TOKEN)