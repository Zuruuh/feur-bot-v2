import { Client, Intents, Message, User } from "discord.js";
import { config } from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";

const WORDS_REACTIONS: Word[] = [
  {
    word: "quoi",
    response: "https://tenor.com/view/feur-quoi-clip-gif-21195505",
  },
  {
    word: "oui",
    response:
      "https://tenor.com/view/stiti-oui-ouistiti-feur-best-joke-gif-22012916",
  },
  {
    word: "moi",
    response:
      "https://media.discordapp.net/attachments/565193871265628213/930557511466110996/-_Tu_veux_sortir_avec_moi_.gif",
  },
];

interface Word {
  word: string;
  response: string;
}

config();
async function main(): Promise<void> {
  const bot = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  });

  bot.on("messageCreate", async (message: Message) => {
    const { content, author } = message;

    WORDS_REACTIONS.forEach(async ({ word, response }: Word) => {
      const formatted = content.replace(/\W*/gi, "");
      const wordRegex = new RegExp(`${word}$`, "gi");
      if (formatted.toLowerCase().match(wordRegex)) {
        message.reply(response);
        await feured(author);
      }
    });
  });

  bot.login(process.env.BOT_TOKEN);
}

async function feured(author: User): Promise<void> {
  const path = resolve(join(__dirname, "..", "feured.json"));
  const currentState = (await readFile(path)).toString();

  const jsonState = JSON.parse(currentState);

  if (!jsonState[author.id]) {
    jsonState[author.id] = 0;
  }

  jsonState[author.id]++;

  console.log(
    `${author.username} has been feur'ed! Total: ${jsonState[author.id]}`
  );
  await writeFile(path, JSON.stringify(jsonState));
}

main();
