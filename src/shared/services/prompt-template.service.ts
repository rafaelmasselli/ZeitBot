import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

interface PromptConfig {
  system?: string;
  categories?: Record<string, any>;
  languages?: Record<string, any>;
  prompt_template?: string;
  rules?: string;
  response_schema?: any;
  [key: string]: any;
}

@injectable()
export class PromptTemplateService {
  private promptCache: Map<string, PromptConfig> = new Map();

  constructor(@inject("ILogger") private logger: ILogger) {}

  loadPrompt(promptName: string): PromptConfig {
    if (this.promptCache.has(promptName)) {
      return this.promptCache.get(promptName)!;
    }

    try {
      const promptPath = path.join(
        process.cwd(),
        "src",
        "config",
        "prompts",
        `${promptName}.yaml`
      );

      const fileContents = fs.readFileSync(promptPath, "utf8");
      const config = yaml.load(fileContents) as PromptConfig;

      this.promptCache.set(promptName, config);
      this.logger.debug(`Prompt template loaded: ${promptName}`);

      return config;
    } catch (error) {
      this.logger.error(
        `Error loading prompt template ${promptName}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  buildPrompt(promptName: string, variables: Record<string, any>): string {
    const config = this.loadPrompt(promptName);
    let prompt = config.prompt_template || "";

    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }

    return prompt;
  }

  getCategories(promptName: string): Record<string, any> {
    const config = this.loadPrompt(promptName);
    return config.categories || {};
  }

  getSchema(promptName: string): any {
    const config = this.loadPrompt(promptName);
    return config.response_schema;
  }
}
