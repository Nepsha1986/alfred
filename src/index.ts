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

  async generatePostWithAI(speciesName: string) {
    const folderName = speciesName.toLowerCase().replace(/\s/g, "-");

    console.log(
      chalk.yellow(
        `Trying to generate a post for ${speciesName} with a help of AI. Please wait...`,
      ),
    );

    const [generatedJsonResult, generatedContentResult] =
      await Promise.allSettled([
        this.infoManager.generateAnswerFromExampleFile(
          `I need to create a json data for ${speciesName}`,
          this.fileManager.jsonInfoExampleRoute,
        ),
        this.infoManager.generateAnswerFromExampleFile(
          `I need to create a content in .mdx format (markdown) for ${speciesName}`,
          this.fileManager.mainContentExampleRoute,
        ),
      ]);

    const generatedJson =
      generatedJsonResult.status === "fulfilled"
        ? generatedJsonResult.value
        : "{}";
    const generatedContent =
      generatedContentResult.status === "fulfilled"
        ? generatedContentResult.value
        : "";

    const results = await Promise.allSettled([
      this.fileManager.createContentFile(
        folderName,
        "_info.json",
        generatedJson || "",
      ),
      this.fileManager.createContentFile(
        folderName,
        "en.mdx",
        generatedContent || "",
      ),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to create file #${index + 1}:`, result.reason);
      }
    });

    console.log(
      chalk.green(
        `New post created successfully! Please check ${folderName} folder`,
      ),
    );
  }

  async copyTemplate(speciesName: string) {
    const folderName = speciesName.toLowerCase().replace(/\s/g, "-");

    try {
      void this.fileManager.copyDraft(folderName);
      console.log(
        chalk.green(
          `New draft for ${speciesName} created successfully! Please check ${folderName}`,
        ),
      );
    } catch (e) {
      console.log(
        chalk.red(`Error while creating a  Please check ${folderName}`),
      );
      throw new Error("can not copy");
    }
  }

  async createPostDraft() {
    const speciesName = await this.dialogManager.ask(
      "Please provide a unique species name",
    );

    const selectedAction = await this.dialogManager.chooseFunctionality(
      new Map([
        ["Generate with AI", () => this.generatePostWithAI(speciesName)],
        ["Copy from template", () => this.copyTemplate(speciesName)],
      ]),
    );

    selectedAction && selectedAction();
  }

  async startDialog() {
    const selectedAction = (await this.dialogManager.chooseFunctionality(
      this.features,
    )) as Function;
    void selectedAction();
  }
}

void App();
