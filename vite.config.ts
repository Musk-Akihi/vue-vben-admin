import type { UserConfig, ConfigEnv } from 'vite';
import pkg from './package.json';
import dayjs from 'dayjs';
import { loadEnv } from 'vite';
import { resolve } from 'path';
import { generateModifyVars } from './build/generate/generateModifyVars';
import { createProxy } from './build/vite/proxy';
import { wrapperEnv } from './build/utils';
import { createVitePlugins } from './build/vite/plugin';
import { OUTPUT_DIR } from './build/constant';

/**
 * path.resolve() 把一个路径或路径片段的序列解析为一个绝对路径
 */
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

/**
 * 项目信息
 */
const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

export default ({ command, mode }: ConfigEnv): UserConfig => {
  /**
   *  process.cwd() 当前工作目录
   * __dirname 代码所在目录
   */
  const root = process.cwd();

  /**
   * loadEnv 类型签名
   * 加载envDir中的.env文件。默认情况下只有前缀为VITE_ 会被加载。
   */
  const env = loadEnv(mode, root);

  /**
   * loadEnv 读取的布尔类型是一个字符串 需要使用此函数进行转换
   */
  const viteEnv = wrapperEnv(env);

  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE } = viteEnv;

  /**
   * command 命令 'build' | 'serve'
   */
  const isBuild = command === 'build';

  return {
    /**
     * 开发或生产环境服务的公共基础路径
     */
    base: VITE_PUBLIC_PATH,
    /**
     * 项目根目录（index.html文件所在的位置）
     */
    root,
    resolve: {
      /**
       * alias 会被传递到 @rollup/plugin-alias 作为 entries 的选项
       */
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    /**
     * 开发服务器选项
     */
    server: {
      /**
       * 启用 TLS + HTTP/2
       * 当 server.proxy 也被使用时，将会仅使用 TLS
       */
      https: true,
      /**
       * 指定服务器应该监听哪个IP地址
       * 设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址
       */
      host: true,
      /**
       * 指定开发服务器端口
       */
      port: VITE_PORT,
      /**
       * 为开发服务器配置自定义代理规则
       */
      proxy: createProxy(VITE_PROXY),
    },
    /**
     * 继承自 esbuild 转换选项
     */
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    /**
     * 构建选项
     */
    build: {
      /**
       * 设置最终构建的浏览器兼容目标
       */
      target: 'es2015',
      /**
       * 允许用户为css的压缩设置一个不同的浏览器target，并非是用于js转写目标
       * 应只针对非主流浏览器时使用
       */
      cssTarget: 'chrome80',
      /**
       * 指定输出路径（相对于项目根目录）
       */
      outDir: OUTPUT_DIR,
      // minify: 'terser',
      /**
       * 当 minify=“minify:'terser'” 解开注释
       */
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     drop_console: VITE_DROP_CONSOLE,
      //   },
      // },
      /**
       * 启用/禁用 gzip 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能
       */
      brotliSize: false,
      /**
       * 对顶触发警告的 chunk 大小
       */
      chunkSizeWarningLimit: 2000,
    },
    /**
     * 定义全局常量替换方式。其中每项在开发环境下会被定义在全局，而在构建时被静态替换
     */
    define: {
      // setting vue-i18-next
      // Suppress warning
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    css: {
      /**
       * 指定传递给css预处理器的选项。文件扩展名用作选项的键
       */
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },
    /**
     * 需要用到的插件数组
     */
    plugins: createVitePlugins(viteEnv, isBuild),
    /**
     * 依赖优化选项
     */
    optimizeDeps: {
      /**
       * 默认情况下，不在 node_modules 中的，链接的包不会被预构建。使用此选项可强制预构建链接的包
       *  @iconify/iconify: The dependency is dynamically and virtually loaded by @purge-icons/generated, so it needs to be specified explicitly
       */
      include: [
        '@vue/runtime-core',
        '@vue/shared',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
    },
  };
};
