/**
 * Mock plugin for development and production.
 * https://github.com/anncwb/vite-plugin-mock
 */
import { viteMockServe } from 'vite-plugin-mock';

export function configMockPlugin(isBuild: boolean) {
  return viteMockServe({
    // 自动读取模拟.ts 文件时，请忽略指定格式的文件
    ignore: /^\_/,
    // 设置模拟.ts文件的存储文件夹
    mockPath: 'mock',
    // 设置是否启用本地 xxx.ts 文件，不要在生产环境中打开它。设置为false将禁用mock功能
    localEnabled: !isBuild,
    // 设置打包是否启用 mock 功能
    prodEnabled: isBuild,
    // 如果生产环境开启了 mock 功能，即prodEnabked=true，则该代码会被注入到 injectFile 对应文件的底部
    injectCode: `
      import { setupProdMockServer } from '../mock/_createProductionServer';

      setupProdMockServer();
      `,
  });
}
