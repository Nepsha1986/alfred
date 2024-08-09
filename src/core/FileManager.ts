import path from "path";
import { promises as fs } from "fs";

class FileManager {
  #contentDir = path.resolve("content");
  #jsonInfoExampleRoute = path.resolve("example", "_info.json");
  #mainContentExampleRoute = path.resolve("example", "$lang.mdx");

  async copyDraft(folderName: string) {
    const templateDir = path.resolve("example");
    const destFolder = path.join(this.#contentDir, folderName);

    try {
      await fs.cp(templateDir, destFolder, { recursive: true, force: true });
    } catch (error) {
      console.error("Failed to copy directory:", error);
    }
  }

  async createContentFile(folder: string, fileName: string, infoData: string) {
    const dirPath = path.join(this.#contentDir, folder);
    const filePath = path.join(dirPath, fileName);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, infoData, "utf-8");
      console.log(`${fileName} created at ${filePath}`);
    } catch (error) {
      console.error(`Failed to create ${fileName}:`, error);
    }
  }

  get jsonInfoExampleRoute() {
    return this.#jsonInfoExampleRoute;
  }

  get mainContentExampleRoute() {
    return this.#mainContentExampleRoute;
  }
}

export default FileManager;
