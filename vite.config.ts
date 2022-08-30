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
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
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
    server: {
      https: true,
      // Listening on all local IPs
      host: true,
      port: VITE_PORT,
      // Load proxy configuration from .env
      proxy: createProxy(VITE_PROXY),
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      // minify: 'terser',
      /**
       * 当 minify=“minify:'terser'” 解开注释
       * Uncomment when minify="minify:'terser'"
       */
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     drop_console: VITE_DROP_CONSOLE,
      //   },
      // },
      // Turning off brotliSize display can slightly reduce packaging time
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
    },
    define: {
      // setting vue-i18-next
      // Suppress warning
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },

    // The vite plugin used by the project. The quantity is large, so it is separately extracted and managed
    plugins: createVitePlugins(viteEnv, isBuild),

    optimizeDeps: {
      // @iconify/iconify: The dependency is dynamically and virtually loaded by @purge-icons/generated, so it needs to be specified explicitly
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
