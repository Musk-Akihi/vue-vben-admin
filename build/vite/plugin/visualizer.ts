/**
 * Package file volume analysis
 */
import visualizer from 'rollup-plugin-visualizer';
import { isReportMode } from '../../utils';

export function configVisualizerConfig() {
  if (isReportMode()) {
    return visualizer({
      // 文件名
      filename: './node_modules/.cache/visualizer/stats.html',
      // 在默认用户代理中打开生成文件
      open: true,
      // 从源代码中收集 gzip 大小并将其显示在图表中。
      gzipSize: true,
      // 从源代码中收集 brotli 大小并将其显示在图表中。
      brotliSize: true,
    }) as Plugin;
  }
  return [];
}
