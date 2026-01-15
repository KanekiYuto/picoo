/**
 * 全局 fetch 配置 - 解决 Google OAuth 连接超时问题
 *
 * 功能特性：
 * 1. 🔄 智能重试机制：Google OAuth 请求失败时自动重试最多 3 次
 * 2. ⏱️ 递增超时时间：第 1 次 30 秒，第 2 次 30 秒，第 3 次 45 秒
 * 3. 🌐 代理支持：自动检测并使用 http_proxy/https_proxy 环境变量
 * 4. 🚀 双重代理配置：同时支持标准 HTTP 代理和 undici ProxyAgent
 * 5. 📡 连接池优化：增强的 keep-alive 和连接复用设置
 *
 * 解决的问题：
 * - Better Auth Google OAuth 的 ConnectTimeoutError
 * - ETIMEDOUT 网络超时错误
 * - 代理环境下的连接问题
 *
 * 使用场景：
 * - 在网络较慢的环境中稳定连接 Google OAuth
 * - 通过代理服务器访问 Google 服务
 * - 需要增强网络请求可靠性的场景
 */

/**
 * 检查是否为超时相关错误
 *
 * @param error - 错误对象
 * @returns boolean - 是否为超时错误
 */
function isTimeoutError(error: unknown): boolean {
  const err = error as any;
  return (
    err?.name?.includes('Abort') ||
    err?.message?.includes('ETIMEDOUT') ||
    err?.message?.includes('timeout') ||
    err?.cause?.code?.includes('TIMEOUT')
  );
}

/**
 * 智能重试 fetch 函数
 *
 * @param originalFetch - 原始的 fetch 函数
 * @param input - 请求的 URL 或 Request 对象
 * @param init - 请求配置选项
 * @param retries - 最大重试次数（默认 3 次）
 * @returns Promise<Response> - HTTP 响应对象
 */
async function fetchWithRetry(
  originalFetch: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries = 3
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = attempt === 1 ? 30_000 : attempt * 15_000; // 递增超时时间
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await originalFetch(input, {
        ...init,
        signal: init?.signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      // 如果是最后一次尝试，或者不是网络超时错误，直接抛出
      if (attempt === retries || !isTimeoutError(error)) {
        throw error;
      }

      // 等待一段时间后重试，递增等待时间
      const waitTime = attempt * 1000;
      console.log(
        `Retry attempt ${attempt + 1}/${retries} after ${waitTime}ms due to timeout...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

/**
 * 代理配置类 - 统一管理代理环境变量
 */
class ProxyConfig {
  readonly httpProxy: string | undefined;
  readonly httpsProxy: string | undefined;
  readonly proxyUrl: string | undefined;

  constructor() {
    this.httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
    this.httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    this.proxyUrl = this.httpsProxy || this.httpProxy;
  }

  hasProxy(): boolean {
    return Boolean(this.proxyUrl);
  }

  getStatusMessage(): string {
    return this.hasProxy() ? `proxy: ${this.proxyUrl}` : 'direct connection';
  }
}

/**
 * Agent 配置常量
 */
const AGENT_CONFIG = {
  timeout: 45_000,
  keepAlive: true,
  keepAliveMsecs: 60_000,
  maxSockets: 50,
  maxFreeSockets: 10,
} as const;

const UNDICI_CONFIG = {
  connectTimeout: 45_000,
  headersTimeout: 45_000,
  bodyTimeout: 90_000,
  keepAliveTimeout: 60_000,
  keepAliveMaxTimeout: 600_000,
} as const;

/**
 * 配置标准 HTTP/HTTPS 全局 Agent
 */
function configureHttpAgent(http: any, https: any, proxyConfig: ProxyConfig) {
  if (proxyConfig.hasProxy()) {
    // 使用 https-proxy-agent
    try {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyAgent = new HttpsProxyAgent(proxyConfig.proxyUrl!, {
        timeout: AGENT_CONFIG.timeout,
        keepAlive: AGENT_CONFIG.keepAlive,
        keepAliveMsecs: AGENT_CONFIG.keepAliveMsecs,
      });
      https.globalAgent = proxyAgent;
      console.log(`HTTPS proxy configured: ${proxyConfig.proxyUrl}`);
    } catch {
      console.log('https-proxy-agent not available, using standard config');
    }
  } else {
    // 配置标准 HTTP/HTTPS Agent
    [http, https].forEach((module) => {
      if (module.globalAgent) {
        Object.assign(module.globalAgent, AGENT_CONFIG);
      }
    });
  }
}

/**
 * 配置 undici 全局 Dispatcher
 */
function configureUndiciAgent(proxyConfig: ProxyConfig) {
  try {
    const undici = require('undici');
    if (!undici?.Agent || !undici?.setGlobalDispatcher) {
      return;
    }

    let globalAgent: any;

    if (proxyConfig.hasProxy()) {
      // 使用 ProxyAgent
      globalAgent = new undici.ProxyAgent({
        uri: proxyConfig.proxyUrl,
        ...UNDICI_CONFIG,
      });
      console.log(`undici proxy configured: ${proxyConfig.proxyUrl}`);
    } else {
      // 使用标准 Agent
      globalAgent = new undici.Agent({
        ...UNDICI_CONFIG,
        maxCachedSessions: 100,
        connections: 50,
      });
    }

    undici.setGlobalDispatcher(globalAgent);
    console.log(`undici global dispatcher configured with ${AGENT_CONFIG.timeout}ms timeout`);
  } catch {
    console.log(`Using standard HTTP/HTTPS config with ${AGENT_CONFIG.timeout}ms timeout`);
  }
}

/**
 * 判断是否为 Google OAuth 相关请求
 */
function isGoogleOAuthRequest(input: RequestInfo | URL): boolean {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input?.url;

  return (
    url?.includes('googleapis.com') ||
    url?.includes('accounts.google.com') ||
    url?.includes('oauth2.googleapis.com')
  );
}

/**
 * 配置全局 fetch 重试机制
 */
function configureFetchRetry(originalFetch: typeof fetch) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    // Google OAuth 请求使用 3 次重试，其他请求不重试
    const retries = isGoogleOAuthRequest(input) ? 3 : 1;
    return fetchWithRetry(originalFetch, input, init, retries);
  };
}

// 在 Node.js 环境中配置全局代理超时时间
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const proxyConfig = new ProxyConfig();

  // 配置 Node.js 全局 Agent
  const http = require('http');
  const https = require('https');
  configureHttpAgent(http, https, proxyConfig);

  // 配置 undici 全局 Dispatcher
  configureUndiciAgent(proxyConfig);

  // 配置全局 fetch 重试机制
  const originalFetch = globalThis.fetch;
  if (originalFetch && typeof originalFetch === 'function') {
    globalThis.fetch = configureFetchRetry(originalFetch);
  }

  // 输出配置状态
  console.log(
    `Google OAuth fetch config loaded: ${AGENT_CONFIG.timeout}ms timeout + retry mechanism, ${proxyConfig.getStatusMessage()}`
  );
}

// 导出一个空对象，使其成为有效的 ES 模块
export {};
