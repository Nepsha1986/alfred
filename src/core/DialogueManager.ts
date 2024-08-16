import chalk from "chalk";
import inquirer from "inquirer";

class DialogueManager {
  async ask(question: string): Promise<string> {
    const questions = [
      {
        name: "response",
        type: "input",
        message: chalk.blue(question),
      },
    ];

    // @ts-ignore
    const inputAnswer = await inquirer.prompt(questions);
    return inputAnswer["response"];
  }
  async chooseFunctionality(
    features: Map<string, Function>,
  ): Promise<Function | null> {
    const questions = [
      {
        name: "helper",
        type: "list",
        message: chalk.blue("Please choose what you want me to do"),
        choices: Array.from(features.keys()),
      },
    ];

    // @ts-ignore
    const answers: Answers = await inquirer.prompt(questions);
    return features.get(answers["helper"]) || null;
  }
}

export default DialogueManager;
