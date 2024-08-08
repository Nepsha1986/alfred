#!/usr/bin/env node

import path from "path";
import { promises as fs } from "fs";

import chalk from "chalk";

import DialogueManager from "./core/DialogueManager";
import InfoManager from "./core/InfoManager";

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
  private dialogManager: DialogueManager;
  private infoManager: InfoManager;

  features = new Map([
    ["Ask a question", this.createConversation.bind(this)],
    ["Create new post", this.createPostDraft.bind(this)],
  ]);

  constructor(config: MainConfig) {
    this.infoManager = new InfoManager({
      baseURL: config.baseUrl,
      apiKey: config.apiKey
    });
    this.dialogManager = new DialogueManager();
  }

  async createConversation() {
    const userQuestion = await this.dialogManager.ask(
      "Please type your question",
    );
    const answer = await this.infoManager.ask(userQuestion);

    console.log(chalk.green(answer));
  }

  async createPostDraft() {
    const postTitle = await this.dialogManager.ask(
      "Please provide post title",
    );

    console.log('New post created successfully!')
  }

  async startDialog() {
    const selectedAction = (await this.dialogManager.chooseFunctionality(
      this.features,
    )) as Function;
    void selectedAction();
  }
}

void App();
