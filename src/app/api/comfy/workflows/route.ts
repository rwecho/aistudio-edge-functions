import { NextRequest, NextResponse } from "next/server";
import { createWorkflowExecutor } from "@/app/services/workflow-executor";
import { generateImageByPrompt } from "@/app/services/comfy";
import { uploadToAliyun } from "@/app/services/aliyun";
import {
  WorkflowExecuteRequest,
  WorkflowExecuteResponse,
} from "@/app/types/workflow";
import {
  getAllWorkflowConfigs,
  getWorkflowConfig,
  getWorkflowConfigsByCategory,
  getWorkflowFilesMap,
} from "@/app/services/dynamic-workflows";

/**
 * GET /api/comfy/dynamic
 * 获取所有可用的工作流配置（动态版本）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");
    const category = searchParams.get("category");

    if (workflowId) {
      // 获取特定工作流配置
      const config = await getWorkflowConfig(workflowId);
      if (!config) {
        return NextResponse.json(
          { error: `工作流 '${workflowId}' 不存在` },
          { status: 404 }
        );
      }
      return NextResponse.json(config);
    }

    // 获取所有工作流配置
    let configs = await getAllWorkflowConfigs();

    if (category) {
      configs = await getWorkflowConfigsByCategory(category);
    }

    return NextResponse.json({
      workflows: configs,
      total: configs.length,
      source: "dynamic", // 标识这是动态加载的结果
    });
  } catch (error) {
    console.error("获取工作流配置失败:", error);
    return NextResponse.json(
      {
        error: "获取工作流配置失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comfy/dynamic
 * 执行工作流（动态版本）
 */
export async function POST(request: NextRequest) {
  try {
    const body: WorkflowExecuteRequest = await request.json();
    const { workflowId, inputs, saveToCloud } = body;

    // 获取工作流配置
    const config = await getWorkflowConfig(workflowId);
    if (!config) {
      return NextResponse.json(
        { error: `工作流 '${workflowId}' 不存在` },
        { status: 404 }
      );
    }

    // 获取工作流文件映射
    const workflowFiles = await getWorkflowFilesMap();
    const workflowJson = workflowFiles[config.workflowFile];

    if (!workflowJson) {
      return NextResponse.json(
        { error: `工作流文件 '${config.workflowFile}' 不存在` },
        { status: 404 }
      );
    }

    // 创建工作流执行器
    const executor = createWorkflowExecutor(config, workflowJson);

    // 验证输入参数
    const validation = executor.validateInputs(inputs);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "输入参数验证失败",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 应用输入参数到工作流JSON
    executor.applyInputs(inputs);
    const finalWorkflowJson = executor.getWorkflowJson();

    // 记录执行开始时间
    const startTime = Date.now();
    const executeId = `${workflowId}-${startTime}`;

    try {
      // 执行工作流
      const imageBuffers = await generateImageByPrompt(finalWorkflowJson);

      if (!imageBuffers || imageBuffers.length === 0) {
        return NextResponse.json(
          {
            executeId,
            status: "failed",
            error: "工作流执行失败，未生成任何输出",
            executionTime: Date.now() - startTime,
          } as WorkflowExecuteResponse,
          { status: 500 }
        );
      }

      // 处理输出结果
      const outputs = [];
      for (let i = 0; i < imageBuffers.length; i++) {
        const arrayBuffer = imageBuffers[i];
        const buffer = Buffer.from(arrayBuffer);
        let url = "";

        if (saveToCloud) {
          try {
            // 上传到云存储
            const filename = `${
              config.outputs[0]?.filenamePrefix || workflowId
            }-${executeId}-${i + 1}.png`;
            const uploadResult = await uploadToAliyun(buffer, filename);
            url = uploadResult.fileUrl;
          } catch (uploadError) {
            console.error("上传到云存储失败:", uploadError);
            // 如果上传失败，返回base64数据
            url = `data:image/png;base64,${buffer.toString("base64")}`;
          }
        } else {
          // 返回base64数据
          url = `data:image/png;base64,${buffer.toString("base64")}`;
        }

        outputs.push({
          type: "image",
          name: `output_${i + 1}`,
          url,
        });
      }

      const response: WorkflowExecuteResponse = {
        executeId,
        status: "completed",
        outputs,
        executionTime: Date.now() - startTime,
        source: "dynamic", // 标识这是通过动态系统执行的
      };

      return NextResponse.json(response);
    } catch (executionError) {
      console.error("工作流执行失败:", executionError);
      return NextResponse.json(
        {
          executeId,
          status: "failed",
          error: `工作流执行失败: ${
            executionError instanceof Error
              ? executionError.message
              : "未知错误"
          }`,
          executionTime: Date.now() - startTime,
        } as WorkflowExecuteResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API请求处理失败:", error);
    return NextResponse.json(
      {
        error: "API请求处理失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
