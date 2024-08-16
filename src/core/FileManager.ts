import path from "path";
import { promises as fs } from "fs";

class FileManager {
  #contentDir = path.resolve("content");
  #assistantFilesDir = path.resolve("__assistant__");

  #templateFilesPath = path.resolve(this.#assistantFilesDir, "template");
  #jsonInfoExampleRoute = path.resolve(
    this.#assistantFilesDir,
    "example",
    "_info.json",
  );
  #mainContentExampleRoute = path.resolve(
    this.#assistantFilesDir,
    "example",
    "$lang.mdx",
  );

  async copyDraft(folderName: string) {
    const destFolder = path.join(this.#contentDir, folderName);

    try {
      await fs.cp(this.#templateFilesPath, destFolder, {
        recursive: true,
        force: true,
      });
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
