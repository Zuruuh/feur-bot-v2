import { Client, Intents, Message, User } from "discord.js";
import { config } from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { words } from "./words";
import type { Word } from "./types";

config();
async function main(): Promise<void> {
  const bot = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  });

  bot.on("messageCreate", async (message: Message) => {
    words.forEach(async ({ word, response }: Word) => {
      if (typeof word === "object") {
        word.forEach(async (subWord: string) => {
          return await reply(message, subWord, response);
        });
      } else if (typeof word === "string") {
        await reply(message, word, response);
      }
    });
  });

  bot.login(process.env.BOT_TOKEN);
}

async function reply(
  message: Message,
  word: string,
  responses: string | string[]
): Promise<void> {
  const { content, author } = message;
  const formatted = content.replace(/\W*/gi, "");
  const wordRegex = new RegExp(`${word}$`, "gi");
  if (formatted.toLowerCase().match(wordRegex)) {
    let response: string = "";
    if (typeof responses === "object") {
      response = responses[Math.floor(Math.random() * responses.length)];
    } else if (typeof responses === "string") {
      response = responses;
    }

    message.reply(response);
    await feured(author);
  }
}

async function feured(author: User): Promise<void> {
  const path = resolve(join(__dirname, "..", "feured.json"));

  try {
    await readFile(path);
  } catch (err: unknown) {
    await writeFile(path, "{}");
  }
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
