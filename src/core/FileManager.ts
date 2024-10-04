import path from "path";
import { promises as fs } from "fs";

class FileManager {
  #contentDir = path.resolve("content");
  #assistantFilesDir = path.resolve("__assistant__");

  #templateFilesPath = path.resolve(this.#assistantFilesDir, "template");
  #jsonInfoExampleRoute = path.resolve(
    this.#assistantFilesDir,
    "example",
    "_info.json"
  );
  #mainContentExampleRoute = path.resolve(
    this.#assistantFilesDir,
    "example",
    "$lang.mdx"
  );

  async #folderExists(folderPath: string) {
    try {
      const stats = await fs.stat(folderPath);
      return stats.isDirectory();
    } catch (error: any) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  async copyDraft(folderName: string) {
    const destFolder = path.join(this.#contentDir, folderName);

    try {
      const folderExists = await this.#folderExists(destFolder);
      if (folderExists) {
        throw new Error('The folder already exists');
      }
      await fs.cp(this.#templateFilesPath, destFolder, {
        recursive: true,
        force: true,
      });
      console.log(`Template copied to ${destFolder}`);
    } catch (error: any) {
      console.error("Failed to copy template:", error.message);
    }
  }

  // Create a content file in the specified folder
  async createContentFile(folder: string, fileName: string, infoData: string) {
    const dirPath = path.join(this.#contentDir, folder);
    const filePath = path.join(dirPath, fileName);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, infoData, "utf-8");
      console.log(`${fileName} created at ${filePath}`);
    } catch (error: any) {
      console.error(`Failed to create ${fileName}:`, error.message);
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
