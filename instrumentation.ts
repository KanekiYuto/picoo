/**
 * Next.js Instrumentation 文件
 *
 * 这个文件会在服务器启动时执行，确保全局配置（如代理设置）在应用启动前就被加载
 *
 * 文档: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 只在 Node.js 服务器环境中执行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 导入 fetch 配置，确保代理设置在应用启动时就被加载
    await import('./src/lib/fetch-config');
  }
}
