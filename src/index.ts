#!/usr/bin/env node

import path from "path";
import { promises as fs } from "fs";

import chalk from "chalk";

import DialogueManager from "./core/DialogueManager";
import InfoManager from "./core/InfoManager";
import FileManager from "./core/FileManager";

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
  private fileManager: FileManager;

  features = new Map([
    ["Ask a question", this.createConversation.bind(this)],
    ["Create new post", this.createPostDraft.bind(this)],
  ]);

  constructor(config: MainConfig) {
    this.infoManager = new InfoManager({
      baseURL: config.baseUrl,
      apiKey: config.apiKey,
    });
    this.dialogManager = new DialogueManager();
    this.fileManager = new FileManager();
  }

  async createConversation() {
    const userQuestion = await this.dialogManager.ask(
      "Please type your question",
    );
    const answer = await this.infoManager.ask(userQuestion);

    console.log(chalk.green(answer));
  }

  async createPostDraft() {
    const speciesName = await this.dialogManager.ask(
      "Please provide a unique species name",
    );
    const folderName = speciesName.toLowerCase().replace(" ", "-");

    const generatedJson = await this.infoManager.generateAnswerFromExampleFile(
      `I need to create a json data for ${speciesName}`,
      this.fileManager.jsonInfoExampleRoute,
    );

    const generatedContent =
      await this.infoManager.generateAnswerFromExampleFile(
        `I need to create a content in .mdx format (markdown) for ${speciesName}`,
        this.fileManager.mainContentExampleRoute,
      );

    await this.fileManager.createContentFile(
      folderName,
      "_info.json",
      generatedJson || "{}",
    );
    await this.fileManager.createContentFile(
      folderName,
      "en.mdx",
      generatedContent || "",
    );

    console.log(
      chalk.green(`New post created successfully! Please check ${folderName}`),
    );
  }

  async startDialog() {
    const selectedAction = (await this.dialogManager.chooseFunctionality(
      this.features,
    )) as Function;
    void selectedAction();
  }
}

void App();
