// 工作流配置类型定义

export interface WorkflowInput {
  /** 输入参数的key，对应工作流JSON中的路径 */
  key: string;
  /** 参数名称 */
  name: string;
  /** 参数类型 */
  type: "string" | "number" | "boolean" | "array";
  /** 是否必需 */
  required: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 参数描述 */
  description?: string;
  /** 数值类型的最小值 */
  min?: number;
  /** 数值类型的最大值 */
  max?: number;
  /** 字符串类型的选项（枚举） */
  options?: string[];
  /** 在工作流JSON中的节点路径，格式：nodeId.inputs.fieldName */
  jsonPath: string;
}

export interface WorkflowOutput {
  /** 输出名称 */
  name: string;
  /** 输出类型 */
  type: "image" | "video" | "audio" | "text" | "json";
  /** 输出描述 */
  description?: string;
  /** 在工作流JSON中的节点ID */
  nodeId: string;
  /** 文件名前缀 */
  filenamePrefix?: string;
}

export interface WorkflowConfig {
  /** 工作流ID */
  id: string;
  /** 工作流名称 */
  name: string;
  /** 工作流描述 */
  description?: string;
  /** 工作流分类 */
  category?: string;
  /** 对应的工作流JSON文件名 */
  workflowFile: string;
  /** 输入参数配置 */
  inputs: WorkflowInput[];
  /** 输出配置 */
  outputs: WorkflowOutput[];
  /** 工作流版本 */
  version?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

export interface WorkflowExecuteRequest {
  /** 工作流ID */
  workflowId: string;
  /** 输入参数 */
  inputs: Record<string, any>;
  /** 是否保存到云存储 */
  saveToCloud?: boolean;
  /** 回调URL */
  callbackUrl?: string;
}

export interface WorkflowExecuteResponse {
  /** 执行ID */
  executeId: string;
  /** 执行状态 */
  status: "pending" | "running" | "completed" | "failed";
  /** 输出结果 */
  outputs?: Array<{
    type: string;
    name: string;
    url?: string;
    data?: any;
  }>;
  /** 错误信息 */
  error?: string;
  /** 执行时间（毫秒） */
  executionTime?: number;
  /** 数据源标识 */
  source?: string;
}
