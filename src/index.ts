#!/usr/bin/env node

import path from "path";
import { promises as fs } from "fs";

import chalk from "chalk";

import PostCreator from "./modules/post-creator";
import OpenAI from "openai";
import DialogueManager from "./core/DialogueManager";

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

  void alfred.startDialog();
};

class Alfred {
  private ai: OpenAI;
  private readonly aiModel = "mistralai/Mistral-7B-Instruct-v0.2";
  private dialogManager: DialogueManager;

  features = new Map([
    ["Ask a question", this.createConversation.bind(this)],
    ["Create new post", this.createPostDraft.bind(this)],
  ]);

  constructor(config: MainConfig) {
    this.ai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.dialogManager = new DialogueManager();
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
    const userAnswer = await this.dialogManager.ask(
      "Please type your question",
    );
    const answer = await this.getAnswer(userAnswer);

    console.log(chalk.green(answer));
  }

  createPostDraft() {
    void PostCreator();
  }

  async startDialog() {
    const selectedAction = (await this.dialogManager.chooseFunctionality(
      this.features,
    )) as Function;
    void selectedAction();
  }
}

void App();
