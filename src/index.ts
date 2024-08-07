#!/usr/bin/env node

import path from "path";
import { promises as fs } from "fs";

import chalk from "chalk";
import inquirer from "inquirer";

import PostCreator from "./modules/post-creator";
import OpenAI from "openai";

interface Answers {
  helper: string;
}

type MainConfig = {
  apiKey: string;
  baseUrl: string;
};

const App = async () => {
  const configFile = await fs.readFile(
    path.join(process.cwd(), "alf.config.json"),
    "utf-8",
  );
  const config: MainConfig = JSON.parse(configFile);
  const alfred = new Alfred(config);

  void alfred.init();
};

class Alfred {
  private ai: OpenAI;
  private readonly aiModel = "mistralai/Mistral-7B-Instruct-v0.2";

  features = new Map([
    ["Ask a question", this.createConversation.bind(this)],
    ["Create new post", this.createPostDraft.bind(this)],
  ]);

  constructor(config: MainConfig) {
    this.ai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async getAnswer(question: string): Promise<string | null> {
    try {
      const response = await this.ai.chat.completions.create({
        model: this.aiModel,
        messages: [{ role: "user", content: question }],
        temperature: 0.7,
        max_tokens: 20,
      });

      return response.choices[0].message.content;
    } catch (e) {
      console.log(e);
      return "Error";
    }
  }

  async createConversation() {
    const questions = [
      {
        name: "assistant",
        type: "input",
        message: chalk.blue("Please type your question"),
      },
    ];

    // @ts-ignore
    let inputAnswer = await inquirer.prompt(questions);

    console.log(inputAnswer["assistant"]);

    const answer = await this.getAnswer(inputAnswer["assistant"]);

    console.log(chalk.green(answer));
  }

  createPostDraft() {
    void PostCreator();
  }

  async init() {
    const questions = [
      {
        name: "helper",
        type: "list",
        message: chalk.blue("Please choose what you want me to do"),
        choices: Array.from(this.features.keys()),
      },
    ];

    // @ts-ignore
    let answers: Answers = await inquirer.prompt(questions);
    const selectedAction = this.features.get(answers.helper);
    if (selectedAction) {
      void selectedAction();
      chalk.green("Done!");
    } else {
      chalk.red("No action found for the selected choice.");
    }
  }
}

void App();
