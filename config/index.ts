import path from 'path';
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack';

const config = {
  projectName: 'muxiK-StackFrontend2.0',
  date: '2024-5-6',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    '@taro-hooks/plugin-react',
    '@taro-hooks/plugin-auto-import',
    '@tarojs/plugin-html',
    // 添加 Rspack 优化插件进行小程序构建优化
    [
      'muxi-tarojs-plugin-rspack',
      {
        // 启用构建分析（可选）
        analyze: false,

        // 启用压缩优化
        compress: true,

        // 优化选项
        optimization: {
          // 启用代码分割优化
          splitChunks: true,

          // 启用 Tree Shaking
          treeShaking: true,

          // 启用 SWC 编译优化
          useSwc: true,
        },
      },
    ],
    // [
    //   'taro-plugin-compiler-optimization',
    //   {
    //     closeScssCache: false, // 默认开启cache-loader缓存scss策略,若想关闭该策略改为true
    //   },
    // ],
  ],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  compiler: {
    type: 'webpack5',
    prebundle: {
      exclude: ['taro-ui'],
    },
  },
  cache: {
    enable: true, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    optimizeMainPackage: {
      enable: true,
      exclude: [
        path.resolve(__dirname, '../src/*.tsx'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (module) => module.resource?.indexOf('moduleName') >= 0,
      ],
    },
    webpackChain(chain) {
      // 原有的 Tailwind CSS 配置
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [
              {
                appType: 'taro',
                // disabled: WeappTailwindcssDisabled,
                rem2rpx: true,
              },
            ],
          },
        },
      });

      // chain.merge({
      //   plugin: {
      //     install: {
      //       plugin: import('terser-webpack-plugin'),
      //       args: [
      //         {
      //           terserOptions: {
      //             compress: true, // 默认使用terser压缩
      //             // mangle: false,
      //             keep_classnames: true, // 不改变class名称
      //             keep_fnames: true, // 不改变函数名称
      //           },
      //         },
      //       ],
      //     },
      //   },
      // });
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
    return merge({}, config, require('./dev'));
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
  return merge({}, config, require('./prod'));
};
