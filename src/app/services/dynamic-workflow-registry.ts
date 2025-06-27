import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { WorkflowConfig } from "@/app/types/workflow";

/**
 * 动态工作流注册器
 * 自动扫描指定目录下的 .json 和 .yaml 文件，动态生成工作流配置
 */

export interface WorkflowFiles {
  json: any; // ComfyUI 工作流 JSON
  yaml: WorkflowConfig; // 工作流配置 YAML
}

export class DynamicWorkflowRegistry {
  private workflowsPath: string;
  private workflowConfigs: Map<string, WorkflowConfig> = new Map();
  private workflowFiles: Map<string, any> = new Map();

  constructor(workflowsPath: string) {
    this.workflowsPath = path.resolve(workflowsPath);
  }

  /**
   * 扫描并加载所有工作流
   */
  async loadWorkflows(): Promise<void> {
    if (!fs.existsSync(this.workflowsPath)) {
      throw new Error(`工作流目录不存在: ${this.workflowsPath}`);
    }

    const files = fs.readdirSync(this.workflowsPath);
    const workflowMap = new Map<string, Partial<WorkflowFiles>>();

    // 按文件名分组（不包含扩展名）
    for (const file of files) {
      const ext = path.extname(file);
      const basename = path.basename(file, ext);

      if (ext === ".json" || ext === ".yaml" || ext === ".yml") {
        if (!workflowMap.has(basename)) {
          workflowMap.set(basename, {});
        }

        const workflow = workflowMap.get(basename)!;

        if (ext === ".json") {
          workflow.json = this.loadJsonFile(
            path.join(this.workflowsPath, file)
          );
        } else if (ext === ".yaml" || ext === ".yml") {
          workflow.yaml = this.loadYamlFile(
            path.join(this.workflowsPath, file)
          );
        }
      }
    }

    // 验证并注册工作流
    for (const [basename, workflow] of workflowMap) {
      if (workflow.json && workflow.yaml) {
        this.registerWorkflow(basename, workflow as WorkflowFiles);
      } else {
        console.warn(`工作流 '${basename}' 缺少必要文件:`, {
          hasJson: !!workflow.json,
          hasYaml: !!workflow.yaml,
        });
      }
    }

    console.log(`✅ 成功加载 ${this.workflowConfigs.size} 个工作流`);
  }

  /**
   * 加载 JSON 文件
   */
  private loadJsonFile(filePath: string): any {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`加载 JSON 文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 加载 YAML 文件
   */
  private loadYamlFile(filePath: string): WorkflowConfig {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const yamlData = yaml.load(content) as any;

      // 验证 YAML 配置格式
      this.validateWorkflowConfig(yamlData, filePath);

      return yamlData as WorkflowConfig;
    } catch (error) {
      console.error(`加载 YAML 文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 验证工作流配置格式
   */
  private validateWorkflowConfig(config: any, filePath: string): void {
    const requiredFields = ["id", "name", "workflowFile", "inputs", "outputs"];

    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`配置文件 ${filePath} 缺少必需字段: ${field}`);
      }
    }

    // 验证输入配置
    if (!Array.isArray(config.inputs)) {
      throw new Error(`配置文件 ${filePath} 的 inputs 必须是数组`);
    }

    for (const input of config.inputs) {
      console.log("input", input);
      if (!input.key || !input.name || !input.type || !input.jsonPath) {
        throw new Error(
          `配置文件 ${filePath} 的输入配置不完整: ${JSON.stringify(input)}`
        );
      }
    }

    // 验证输出配置
    if (!Array.isArray(config.outputs)) {
      throw new Error(`配置文件 ${filePath} 的 outputs 必须是数组`);
    }

    for (const output of config.outputs) {
      if (!output.name || !output.type || !output.nodeId) {
        throw new Error(
          `配置文件 ${filePath} 的输出配置不完整: ${JSON.stringify(output)}`
        );
      }
    }
  }

  /**
   * 注册单个工作流
   */
  private registerWorkflow(basename: string, workflow: WorkflowFiles): void {
    const config = workflow.yaml;
    const workflowJson = workflow.json;

    // 确保配置的 workflowFile 与实际文件名匹配
    const expectedJsonFile = `${basename}.json`;
    if (config.workflowFile !== expectedJsonFile) {
      console.warn(
        `工作流 '${basename}' 的 workflowFile 配置 (${config.workflowFile}) 与实际文件名不匹配，已自动修正`
      );
      config.workflowFile = expectedJsonFile;
    }

    // 添加时间戳
    if (!config.createdAt) {
      config.createdAt = new Date().toISOString();
    }
    config.updatedAt = new Date().toISOString();

    // 注册到映射表
    this.workflowConfigs.set(config.id, config);
    this.workflowFiles.set(expectedJsonFile, workflowJson);

    console.log(`📝 注册工作流: ${config.id} (${config.name})`);
  }

  /**
   * 获取所有工作流配置
   */
  getAllWorkflowConfigs(): WorkflowConfig[] {
    return Array.from(this.workflowConfigs.values());
  }

  /**
   * 根据ID获取工作流配置
   */
  getWorkflowConfig(id: string): WorkflowConfig | undefined {
    return this.workflowConfigs.get(id);
  }

  /**
   * 获取工作流配置映射表
   */
  getWorkflowConfigsMap(): Record<string, WorkflowConfig> {
    const result: Record<string, WorkflowConfig> = {};
    for (const [id, config] of this.workflowConfigs) {
      result[id] = config;
    }
    return result;
  }

  /**
   * 获取工作流文件映射表
   */
  getWorkflowFilesMap(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [filename, content] of this.workflowFiles) {
      result[filename] = content;
    }
    return result;
  }

  /**
   * 根据分类获取工作流配置
   */
  getWorkflowConfigsByCategory(category: string): WorkflowConfig[] {
    return Array.from(this.workflowConfigs.values()).filter(
      (config) => config.category === category
    );
  }

  /**
   * 获取所有工作流ID
   */
  getAllWorkflowIds(): string[] {
    return Array.from(this.workflowConfigs.keys());
  }

  /**
   * 获取所有分类
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    for (const config of this.workflowConfigs.values()) {
      if (config.category) {
        categories.add(config.category);
      }
    }
    return Array.from(categories);
  }

  /**
   * 验证工作流ID是否存在
   */
  isValidWorkflowId(id: string): boolean {
    return this.workflowConfigs.has(id);
  }

  /**
   * 获取工作流摘要信息
   */
  getWorkflowSummary(
    id: string
  ):
    | Pick<WorkflowConfig, "id" | "name" | "description" | "category">
    | undefined {
    const config = this.workflowConfigs.get(id);
    if (!config) return undefined;

    return {
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
    };
  }

  /**
   * 获取所有工作流摘要信息
   */
  getAllWorkflowSummaries(): Array<
    Pick<WorkflowConfig, "id" | "name" | "description" | "category">
  > {
    return Array.from(this.workflowConfigs.values()).map((config) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
    }));
  }

  /**
   * 重新加载工作流（用于开发时热重载）
   */
  async reload(): Promise<void> {
    this.workflowConfigs.clear();
    this.workflowFiles.clear();
    await this.loadWorkflows();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalWorkflows: this.workflowConfigs.size,
      categories: this.getAllCategories().length,
      workflowIds: this.getAllWorkflowIds(),
    };
  }
}
