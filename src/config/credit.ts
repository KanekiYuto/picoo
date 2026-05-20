// 任务类型：app 为应用类任务，model 为模型直调任务
export type TaskType = 'app' | 'model';

// 默认配额常量（未匹配到任何生成器时使用）
export const DEFAULT_CREDITS = 88888888;

/**
 * 获取产品所需的配额
 * @param string productId 产品ID
 * @param TaskType taskType 任务类型
 * @param parameters 请求参数
 * @returns 所需配额数量
 */
export const getRequiredCredits = (productId: string, taskType: TaskType, parameters: Record<string, any>) => {
    switch (taskType) {
        case 'app':
            return app(productId, parameters);
        case 'model':
            return model(productId, parameters);
        default:
            // return model(productId, parameters);
            return DEFAULT_CREDITS;
    }
};

/**
 * 获取 Model 类任务所需的配额
 * @param string productId 产品ID
 * @param Record<string, any> parameters 请求参数
 * @returns 所需配额数量，未匹配时返回 DEFAULT_CREDITS
 */
export const model = (productId: string, _parameters: Record<string, any>) => {
    switch (productId) {
        case 'bytedance/seedream/v4.5/edit':
            return 30;
        case 'bytedance/seedream/v4.5':
            return 30;
        default:
            return DEFAULT_CREDITS;
    }
}

/**
 * 获取 App 类任务所需的配额
 * @param string productId 产品ID
 * @param Record<string, any> parameters 请求参数
 * @returns 所需配额数量，未匹配时返回 DEFAULT_CREDITS
 */
export const app = (productId: string, _parameters: Record<string, any>) => {
    switch (productId) {
        case 'ai-hairstyle-changer':
            return 50;
        case 'ai-hair-color-changer':
            return 50;
        default:
            return DEFAULT_CREDITS;
    }
}