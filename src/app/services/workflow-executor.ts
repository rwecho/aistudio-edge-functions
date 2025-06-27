import { randomInt } from "crypto";
import { WorkflowConfig, WorkflowInput } from "@/app/types/workflow";

/**
 * 工作流执行器类
 * 负责处理工作流的参数验证、JSON修改和执行
 */
export class WorkflowExecutor {
  private config: WorkflowConfig;
  private workflowJson: any;

  constructor(config: WorkflowConfig, workflowJson: any) {
    this.config = config;
    this.workflowJson = JSON.parse(JSON.stringify(workflowJson)); // 深拷贝避免修改原始数据
  }

  /**
   * 验证输入参数
   */
  validateInputs(inputs: Record<string, any>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const inputConfig of this.config.inputs) {
      const value = inputs[inputConfig.key];

      // 检查必需参数
      if (
        inputConfig.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`参数 '${inputConfig.name}' (${inputConfig.key}) 是必需的`);
        continue;
      }

      // 如果参数不存在且有默认值，跳过验证
      if (value === undefined && inputConfig.defaultValue !== undefined) {
        continue;
      }

      // 类型验证
      if (value !== undefined) {
        const typeError = this.validateInputType(inputConfig, value);
        if (typeError) {
          errors.push(typeError);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证单个输入参数的类型
   */
  private validateInputType(
    inputConfig: WorkflowInput,
    value: any
  ): string | null {
    switch (inputConfig.type) {
      case "string":
        if (typeof value !== "string") {
          return `参数 '${inputConfig.name}' 必须是字符串类型`;
        }
        if (inputConfig.options && !inputConfig.options.includes(value)) {
          return `参数 '${
            inputConfig.name
          }' 必须是以下值之一: ${inputConfig.options.join(", ")}`;
        }
        break;

      case "number":
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `参数 '${inputConfig.name}' 必须是数字类型`;
        }
        if (inputConfig.min !== undefined && numValue < inputConfig.min) {
          return `参数 '${inputConfig.name}' 不能小于 ${inputConfig.min}`;
        }
        if (inputConfig.max !== undefined && numValue > inputConfig.max) {
          return `参数 '${inputConfig.name}' 不能大于 ${inputConfig.max}`;
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return `参数 '${inputConfig.name}' 必须是布尔类型`;
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          return `参数 '${inputConfig.name}' 必须是数组类型`;
        }
        break;
    }

    return null;
  }

  /**
   * 应用输入参数到工作流JSON
   */
  applyInputs(inputs: Record<string, any>): void {
    for (const inputConfig of this.config.inputs) {
      let value = inputs[inputConfig.key];

      // 使用默认值
      if (value === undefined && inputConfig.defaultValue !== undefined) {
        value = inputConfig.defaultValue;
      }

      // 特殊处理：如果是seed且未提供，生成随机数
      if (inputConfig.key === "seed" && value === undefined) {
        value = randomInt(0, 1000000);
      }

      // 应用值到工作流JSON
      if (value !== undefined) {
        this.setValueByPath(inputConfig.jsonPath, value);
      }
    }
  }

  /**
   * 根据路径设置工作流JSON中的值
   */
  private setValueByPath(path: string, value: any): void {
    const parts = path.split(".");
    let current = this.workflowJson;

    // 导航到目标位置
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    // 设置值
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  /**
   * 获取处理后的工作流JSON
   */
  getWorkflowJson(): any {
    return this.workflowJson;
  }

  /**
   * 获取输出节点信息
   */
  getOutputNodes(): Array<{ nodeId: string; type: string; name: string }> {
    return this.config.outputs.map((output) => ({
      nodeId: output.nodeId,
      type: output.type,
      name: output.name,
    }));
  }
}

/**
 * 创建工作流执行器实例
 */
export function createWorkflowExecutor(
  config: WorkflowConfig,
  workflowJson: any
): WorkflowExecutor {
  return new WorkflowExecutor(config, workflowJson);
}
