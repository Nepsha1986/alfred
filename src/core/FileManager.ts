import path from "path";
import { promises as fs } from "fs";

class FileManager {
  #contentDir = path.resolve("content");
  #jsonInfoExampleRoute = path.resolve("example", "_info.json");

  async copyDraft(folderName: string) {
    const templateDir = path.resolve("example");
    const destFolder = path.join(this.#contentDir, folderName);

    try {
      await fs.cp(templateDir, destFolder, { recursive: true, force: true });
    } catch (error) {
      console.error("Failed to copy directory:", error);
    }
  }

  async createSpeciesInfo(folder: string, infoData: string) {
    const dirPath = path.join(this.#contentDir, folder);
    const filePath = path.join(dirPath, "_info.json");

    try {
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, infoData, "utf-8");
      console.log(`_info.json created at ${filePath}`);
    } catch (error) {
      console.error("Failed to create _info.json:", error);
    }
  }

  get contentDir() {
    return this.#contentDir;
  }

  get jsonInfoExampleRoute() {
    return this.#jsonInfoExampleRoute;
  }
}

export default FileManager;
