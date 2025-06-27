import path from "path";
import { DynamicWorkflowRegistry } from "@/app/services/dynamic-workflow-registry";
import { WorkflowConfig } from "@/app/types/workflow";

// 工作流目录路径
const WORKFLOWS_DIR = path.join(process.cwd(), "workflows");

// 创建动态工作流注册器实例
const registry = new DynamicWorkflowRegistry(WORKFLOWS_DIR);

// 初始化标志
let isInitialized = false;

/**
 * 确保工作流已初始化
 */
async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    try {
      await registry.loadWorkflows();
      isInitialized = true;
      console.log("✅ 动态工作流系统初始化完成");
    } catch (error) {
      console.error("❌ 动态工作流系统初始化失败:", error);
      throw error;
    }
  }
}

/**
 * 获取所有工作流配置
 */
export async function getAllWorkflowConfigs(): Promise<WorkflowConfig[]> {
  await ensureInitialized();
  return registry.getAllWorkflowConfigs();
}

/**
 * 根据ID获取工作流配置
 */
export async function getWorkflowConfig(
  id: string
): Promise<WorkflowConfig | undefined> {
  await ensureInitialized();
  return registry.getWorkflowConfig(id);
}

/**
 * 获取工作流配置映射表
 */
export async function getWorkflowConfigsMap(): Promise<
  Record<string, WorkflowConfig>
> {
  await ensureInitialized();
  return registry.getWorkflowConfigsMap();
}

/**
 * 获取工作流文件映射表
 */
export async function getWorkflowFilesMap(): Promise<Record<string, any>> {
  await ensureInitialized();
  return registry.getWorkflowFilesMap();
}

/**
 * 根据分类获取工作流配置
 */
export async function getWorkflowConfigsByCategory(
  category: string
): Promise<WorkflowConfig[]> {
  await ensureInitialized();
  return registry.getWorkflowConfigsByCategory(category);
}

/**
 * 获取所有工作流ID
 */
export async function getAllWorkflowIds(): Promise<string[]> {
  await ensureInitialized();
  return registry.getAllWorkflowIds();
}

/**
 * 获取所有分类
 */
export async function getAllCategories(): Promise<string[]> {
  await ensureInitialized();
  return registry.getAllCategories();
}

/**
 * 验证工作流ID是否存在
 */
export async function isValidWorkflowId(id: string): Promise<boolean> {
  await ensureInitialized();
  return registry.isValidWorkflowId(id);
}

/**
 * 获取工作流摘要信息
 */
export async function getWorkflowSummary(
  id: string
): Promise<
  Pick<WorkflowConfig, "id" | "name" | "description" | "category"> | undefined
> {
  await ensureInitialized();
  return registry.getWorkflowSummary(id);
}

/**
 * 获取所有工作流摘要信息
 */
export async function getAllWorkflowSummaries(): Promise<
  Array<Pick<WorkflowConfig, "id" | "name" | "description" | "category">>
> {
  await ensureInitialized();
  return registry.getAllWorkflowSummaries();
}

/**
 * 重新加载工作流（用于开发时热重载）
 */
export async function reloadWorkflows(): Promise<void> {
  await registry.reload();
  console.log("🔄 工作流配置已重新加载");
}

/**
 * 获取统计信息
 */
export async function getWorkflowStats() {
  await ensureInitialized();
  return registry.getStats();
}

/**
 * 获取注册器实例（用于高级操作）
 */
export function getRegistry(): DynamicWorkflowRegistry {
  return registry;
}

// 向后兼容的同步函数（仅在已初始化时使用）
export function getAllWorkflowConfigsSync(): WorkflowConfig[] {
  if (!isInitialized) {
    throw new Error("工作流尚未初始化，请先调用异步版本的函数");
  }
  return registry.getAllWorkflowConfigs();
}

export function getWorkflowConfigSync(id: string): WorkflowConfig | undefined {
  if (!isInitialized) {
    throw new Error("工作流尚未初始化，请先调用异步版本的函数");
  }
  return registry.getWorkflowConfig(id);
}
