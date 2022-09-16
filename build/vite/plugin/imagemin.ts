// Image resource files used to compress the output of the production environment
// https://github.com/anncwb/vite-plugin-imagemin
import viteImagemin from 'vite-plugin-imagemin';

export function configImageminPlugin() {
  const plugin = viteImagemin({
    // https://github.com/imagemin/imagemin-gifsicle
    gifsicle: {
      optimizationLevel: 7,
      interlaced: false,
    },
    // https://github.com/imagemin/imagemin-optipng
    optipng: {
      optimizationLevel: 7,
    },
    // https://github.com/imagemin/imagemin-mozjpeg
    mozjpeg: {
      quality: 20,
    },
    // https://github.com/imagemin/imagemin-pngquant
    pngquant: {
      quality: [0.8, 0.9],
      speed: 4,
    },
    // https://github.com/svg/svgo/#what-it-can-do
    svgo: {
      plugins: [
        {
          name: 'removeViewBox',
        },
        {
          name: 'removeEmptyAttrs',
          active: false,
        },
      ],
    },
  });
  return plugin;
}
