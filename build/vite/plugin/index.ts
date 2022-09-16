import { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';
import purgeIcons from 'vite-plugin-purge-icons';
import windiCSS from 'vite-plugin-windicss';
import VitePluginCertificate from 'vite-plugin-mkcert';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import { configHtmlPlugin } from './html';
import { configPwaConfig } from './pwa';
import { configMockPlugin } from './mock';
import { configCompressPlugin } from './compress';
import { configStyleImportPlugin } from './styleImport';
import { configVisualizerConfig } from './visualizer';
import { configThemePlugin } from './theme';
import { configImageminPlugin } from './imagemin';
import { configSvgIconsPlugin } from './svgSprite';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const {
    VITE_USE_IMAGEMIN,
    VITE_USE_MOCK,
    VITE_LEGACY,
    VITE_BUILD_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
  } = viteEnv;

  const vitePlugins: (PluginOption | PluginOption[])[] = [
    /**
     * 提供 Vue3 单文件组件支持
     */
    vue(),
    /**
     * 提供 Vue3 JSX 支持（通过专用的 Bable 转换插件）
     */
    vueJsx(),
    /**
     * 允许在setup上 自定义name
     */
    vueSetupExtend(),
    /**
     * 使用 mkcert 为 vite https 开发服务提供证书支持
     */
    VitePluginCertificate({
      source: 'coding',
    }),
  ];

  /**
   * vite-plugin-windicss
   * windicss 是下一代工具优先对的 CSS 框架
   * 可以把 windicss 看作是按需提供的 Tailwind 替代方案，它提供了更快地加载体验，完美兼容 Tailwind v2.0，并且拥有很多额外的酷炫功能
   */
  vitePlugins.push(windiCSS());

  /**
   * @vitejs/plugin-legacy
   * vite 默认的浏览器支持基线是原生的 ESM。此插件为不支持原生 ESM 的传统浏览器提供支持
   */
  VITE_LEGACY && isBuild && vitePlugins.push(legacy());

  /**
   * vite-plugin-html
   * 一个为index.html提供 minify 和 基于 EJS模板功能 的Vite插件
   */
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  /**
   * vite-plugin-svg-icons
   * 用于生成svg雪碧图
   */
  vitePlugins.push(configSvgIconsPlugin(isBuild));

  /**
   * vite-plugin-mock
   * 提供本地和生产模拟服务
   * vite的数据模拟插件，是基于vite.js开发的。并同时支持本地环境和生产环境
   * Connect服务中间件在本地使用，mockjs在生产环境中使用
   */
  VITE_USE_MOCK && vitePlugins.push(configMockPlugin(isBuild));

  /**
   * vite-plugin-purge-icons
   * 方便高效的使用Iconify中所有的图标
   */
  vitePlugins.push(purgeIcons());

  /**
   * vite-plugin-style-import
   * 按需导入组件库样式
   */
  vitePlugins.push(configStyleImportPlugin(isBuild));

  /**
   * rollup-plugin-visualizer
   * 依赖分析插件
   */
  vitePlugins.push(configVisualizerConfig());

  /**
   * vite-plugin-theme
   * 动态更改界面主题色的 vite 插件
   */
  vitePlugins.push(configThemePlugin(isBuild));

  // The following plugins only work in the production environment
  if (isBuild) {
    /**
     * vite-plugin-imagemin
     * 压缩图片资产的vite插件
     */
    VITE_USE_IMAGEMIN && vitePlugins.push(configImageminPlugin());

    /**
     * rollup-plugin-gzip
     * vite-plugin-compression
     * 使用 gzip 或者 brotli 来压缩资源
     */
    vitePlugins.push(
      configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE),
    );

    /**
     * vite-plugin-pwa
     * PWA的一些技术集成
     */
    vitePlugins.push(configPwaConfig(viteEnv));
  }

  return vitePlugins;
}
