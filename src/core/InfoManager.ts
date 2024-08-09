import OpenAI, { ClientOptions } from "openai";
import { promises as fs } from "fs";

class InfoManager {
  private ai: OpenAI;
  private readonly aiModel = "mistralai/Mistral-7B-Instruct-v0.2";
  constructor(clientOptions: ClientOptions) {
    this.ai = new OpenAI(clientOptions);
  }

  async ask(question: string): Promise<string | null> {
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

  async generateAnswerFromExampleFile(text: string, fileName: string) {
    const fileData = await fs.readFile(fileName, "utf-8");

    try {
      const response = await this.ai.chat.completions.create({
        model: this.aiModel,
        messages: [
          {
            role: "user",
            content: `${text}. Here is an example ${fileData}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
      });

      return response.choices[0].message.content || "{}";
    } catch (e) {}
  }
}

export default InfoManager;
