前端项目中，模块化管理可以方便我们管理代码，但是有些公用的依赖项需要在每个页面和组件重复引入，较为繁琐。尤其是中台项目，每个页面都要引入一堆UI框架的组件。我们可以通过配置插件来实现自动引入，这样用的时候直接就能用，代码上方少了一堆依赖看着也清晰不少。

自动依赖的实现是通过一个<font style="color:#DF2A3F;">unplugin-auto-import</font>的插件。

> 官网：[https://unplugin.unjs.io/showcase/unplugin-auto-import.html](https://unplugin.unjs.io/showcase/unplugin-auto-import.html)
>

> github：[https://github.com/unplugin/unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import)
>

插件支持vite、webpack、rollup等打包工具。下面以vite为例。



## 插件安装与引入
```bash
npm i -D unplugin-auto-import
```

```javascript
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    plugins: [
      AutoImport({ /* options */ }),
    ],
  ],
});


```

## 插件配置
配置项字段如下：

```javascript
AutoImport({
  // targets to transform
  include: [
    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
    /\.vue$/,
    /\.vue\?vue/, // .vue
    /\.md$/, // .md
  ],

  // global imports to register
  imports: [
    // presets
    'vue',
    'vue-router',
    // custom
    {
      '@vueuse/core': [
        // named imports
        'useMouse', // import { useMouse } from '@vueuse/core',
        // alias
        ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
      ],
      'axios': [
        // default imports
        ['default', 'axios'], // import { default as axios } from 'axios',
      ],
      '[package-name]': [
        '[import-names]',
        // alias
        ['[from]', '[alias]'],
      ],
    },
    // example type import
    {
      from: 'vue-router',
      imports: ['RouteLocationRaw'],
      type: true,
    },
  ],

  // Array of strings of regexes that contains imports meant to be filtered out.
  ignore: [
    'useMouse',
    'useFetch'
  ],

  // Enable auto import by filename for default module exports under directories
  defaultExportByFilename: false,

  // Auto import for module exports under directories
  // by default it only scan one level of modules under the directory
  dirs: [
    // './hooks',
    // './composables' // only root modules
    // './composables/**', // all nested modules
    // ...
  ],

  // Filepath to generate corresponding .d.ts file.
  // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
  // Set `false` to disable.
  dts: './auto-imports.d.ts',

  // Array of strings of regexes that contains imports meant to be ignored during
  // the declaration file generation. You may find this useful when you need to provide
  // a custom signature for a function.
  ignoreDts: [
    'ignoredFunction',
    /^ignore_/
  ],

  // Auto import inside Vue template
  // see https://github.com/unjs/unimport/pull/15 and https://github.com/unjs/unimport/pull/72
  vueTemplate: false,

  // Custom resolvers, compatible with `unplugin-vue-components`
  // see https://github.com/antfu/unplugin-auto-import/pull/23/
  resolvers: [
    /* ... */
  ],

  // Inject the imports at the end of other imports
  injectAtEnd: true,

  // Generate corresponding .eslintrc-auto-import.json file.
  // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
  eslintrc: {
    enabled: false, // Default `false`
    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
    globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
  },
})
```

其中我们需要关注的主要是imports、dirs、dts、resolvers。

+ imports: 支持预设方案和自定义的引入。
    - 预设：包含vue、react、react-dom等，直接在imports的列表项写。如设置vue，会自动支持ref、reactive等，设置react，会自动支持useState、useEffect等，react-dom支持useLocation、useNavigate等。详见：[https://github.com/unplugin/unplugin-auto-import/tree/main/src/presets](https://github.com/unplugin/unplugin-auto-import/tree/main/src/presets)
    - 自定义：都写在一个对象里，里面添加key，如axios: [ ['default', 'axios'] ], 相当于全局自动插入 import {default as axios} from 'axios'。
+ dirs：支持自动引入配置的目录的所有组件。比如设置dirs: ['./src/components', './src/apis']。
+ dts: 设置为true，或者设置具体的文件名，然后会将自动引入的组件生产一个dts文件，再在项目的tsconfig.json设置include，可以防止ts报错未定义的变量。
+ resolvers：这个是可以自己写代码实现动态设置自动引入。详见后面。

### vue
在vue中引入UI组件如antd，element-plus等，有现成的resolver可以用。

安装unplugin-vue-components。

> [https://unplugin.unjs.io/showcase/unplugin-vue-components.html](https://unplugin.unjs.io/showcase/unplugin-vue-components.html)
>

```javascript
npm i unplugin-vue-components -D
```

然后在resolvers中配置：

```javascript
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'] // 自动导入 vue 相关的函数
    }),
    Components({
      resolvers: [AntDesignVueResolver()], // 自动导入antd vue的组件
    }),
  ]
}
```

unplugin-vue-components支持了常见的UI框架，如ant-design-vue，element-plus，vant等等。

### react
相比较vue而言，react就没有unplugin-vue-components这样的库了，要自动引入antd的组件需要自己用resolvers实现。

```javascript
import react from '@vitejs/plugin-react';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // 自动引入组件，无须声明
    AutoImport({
      imports: [
        'react', // react, useState, useEffect, ...
        'react-router-dom', // useNavigate, useLocation, ...
        'ahooks',
        {
          'use-immer': [
            'useImmer'
          ],
        },
      ],
      dts: true,
      resolvers: [
        // 自己实现Antd组件和antd icons组件resolvers
      ],
    }),
  ],
});

```



### 自己实现动态resolvers
resolvers核心结构如下：

```javascript
{
  AutoImport({
    resolvers: [
      {
        type: 'component',
        resolve: (name) => {
          // 正则判断代码中未定义的变量name匹配规则, 如果匹配上
          return {
            name,
            from: '', // 组件所在位置， 如‘@ant-design/icons', 'antd/es',
            sideEffects: // 需要额外引入的文件, 如 'antd/es/button/style'
          }
        }
      }
    ],
  })
}
```



antd组件和icon引入，网上找的别人的一段代码如下：

```javascript
export function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim();
  return result.split(' ').join('-').toLowerCase();
}

export type Awaitable<T> = T | PromiseLike<T>;

export interface ImportInfo {
  as?: string;
  name?: string;
  from: string;
}

export type SideEffectsInfo =
  | (ImportInfo | string)[]
  | ImportInfo
  | string
  | undefined;

export interface ComponentInfo extends ImportInfo {
  sideEffects?: SideEffectsInfo;
}

export type ComponentResolveResult = Awaitable<
  string | ComponentInfo | null | undefined | void
>;

export type ComponentResolverFunction = (
  name: string,
) => ComponentResolveResult;
export interface ComponentResolverObject {
  type: 'component' | 'directive';
  resolve: ComponentResolverFunction;
}
export type ComponentResolver =
  | ComponentResolverFunction
  | ComponentResolverObject;

interface IMatcher {
  pattern: RegExp;
  styleDir: string;
}

const matchComponents: IMatcher[] = [
  {
    pattern: /^Avatar/,
    styleDir: 'avatar',
  },
  {
    pattern: /^AutoComplete/,
    styleDir: 'auto-complete',
  },
  {
    pattern: /^Anchor/,
    styleDir: 'anchor',
  },

  {
    pattern: /^Badge/,
    styleDir: 'badge',
  },
  {
    pattern: /^Breadcrumb/,
    styleDir: 'breadcrumb',
  },
  {
    pattern: /^Button/,
    styleDir: 'button',
  },
  {
    pattern: /^Checkbox/,
    styleDir: 'checkbox',
  },
  {
    pattern: /^Card/,
    styleDir: 'card',
  },
  {
    pattern: /^Collapse/,
    styleDir: 'collapse',
  },
  {
    pattern: /^Descriptions/,
    styleDir: 'descriptions',
  },
  {
    pattern: /^RangePicker|^WeekPicker|^MonthPicker/,
    styleDir: 'date-picker',
  },
  {
    pattern: /^Dropdown/,
    styleDir: 'dropdown',
  },
  {
    pattern: /^Flex/,
    styleDir: 'flex',
  },
  {
    pattern: /^Form/,
    styleDir: 'form',
  },
  {
    pattern: /^InputNumber/,
    styleDir: 'input-number',
  },

  {
    pattern: /^Input|^Textarea/,
    styleDir: 'input',
  },
  {
    pattern: /^Statistic/,
    styleDir: 'statistic',
  },
  {
    pattern: /^CheckableTag/,
    styleDir: 'tag',
  },
  {
    pattern: /^TimeRangePicker/,
    styleDir: 'time-picker',
  },
  {
    pattern: /^Layout/,
    styleDir: 'layout',
  },
  {
    pattern: /^Menu|^SubMenu/,
    styleDir: 'menu',
  },

  {
    pattern: /^Table/,
    styleDir: 'table',
  },
  {
    pattern: /^TimePicker|^TimeRangePicker/,
    styleDir: 'time-picker',
  },
  {
    pattern: /^Radio/,
    styleDir: 'radio',
  },

  {
    pattern: /^Image/,
    styleDir: 'image',
  },

  {
    pattern: /^List/,
    styleDir: 'list',
  },

  {
    pattern: /^Tab/,
    styleDir: 'tabs',
  },
  {
    pattern: /^Mentions/,
    styleDir: 'mentions',
  },

  {
    pattern: /^Step/,
    styleDir: 'steps',
  },
  {
    pattern: /^Skeleton/,
    styleDir: 'skeleton',
  },

  {
    pattern: /^Select/,
    styleDir: 'select',
  },
  {
    pattern: /^TreeSelect/,
    styleDir: 'tree-select',
  },
  {
    pattern: /^Tree|^DirectoryTree/,
    styleDir: 'tree',
  },
  {
    pattern: /^Typography/,
    styleDir: 'typography',
  },
  {
    pattern: /^Timeline/,
    styleDir: 'timeline',
  },
  {
    pattern: /^Upload/,
    styleDir: 'upload',
  },
];

export interface AntDesignResolverOptions {
  /**
   * exclude components that do not require automatic import
   *
   * @default []
   */
  exclude?: string[];
  /**
   * import style along with components
   *
   * @default 'css'
   */
  importStyle?: boolean | 'css' | 'less';
  /**
   * resolve `antd' icons
   *
   * requires package `@ant-design/icons-vue`
   *
   * @default false
   */
  resolveIcons?: boolean;

  /**
   * @deprecated use `importStyle: 'css'` instead
   */
  importCss?: boolean;
  /**
   * @deprecated use `importStyle: 'less'` instead
   */
  importLess?: boolean;

  /**
   * use commonjs build default false
   */
  cjs?: boolean;

  /**
   * rename package
   *
   * @default 'antd'
   */
  packageName?: string;

  prefix?: string;
}

function getStyleDir(compName: string): string {
  let styleDir;
  const total = matchComponents.length;
  for (let i = 0; i < total; i++) {
    const matcher = matchComponents[i];
    if (compName.match(matcher.pattern)) {
      styleDir = matcher.styleDir;
      break;
    }
  }
  if (!styleDir) styleDir = kebabCase(compName);

  return styleDir;
}

function getSideEffects(
  compName: string,
  options: AntDesignResolverOptions,
): SideEffectsInfo {
  const { importStyle = true, importLess = false } = options;

  if (!importStyle) return;
  const lib = options.cjs ? 'lib' : 'es';
  const packageName = options?.packageName || 'antd';

  if (importStyle === 'less' || importLess) {
    const styleDir = getStyleDir(compName);
    return `${packageName}/${lib}/${styleDir}/style`;
  } else {
    const styleDir = getStyleDir(compName);
    return `${packageName}/${lib}/${styleDir}/style`;
  }
}
const primitiveNames = [
  'Affix',
  'Anchor',
  'AnchorLink',
  'AutoComplete',
  'AutoCompleteOptGroup',
  'AutoCompleteOption',
  'Alert',
  'Avatar',
  'AvatarGroup',
  'BackTop',
  'Badge',
  'BadgeRibbon',
  'Breadcrumb',
  'BreadcrumbItem',
  'BreadcrumbSeparator',
  'Button',
  'ButtonGroup',
  'Calendar',
  'Card',
  'CardGrid',
  'CardMeta',
  'Collapse',
  'CollapsePanel',
  'Carousel',
  'Cascader',
  'Checkbox',
  'CheckboxGroup',
  'Col',
  'Comment',
  'ConfigProvider',
  'DatePicker',
  'MonthPicker',
  'WeekPicker',
  'RangePicker',
  'QuarterPicker',
  'Descriptions',
  'DescriptionsItem',
  'Divider',
  'Dropdown',
  'DropdownButton',
  'Drawer',
  'Empty',
  'Flex',
  'Form',
  'FormItem',
  'FormItemRest',
  'Grid',
  'Input',
  'InputGroup',
  'InputPassword',
  'InputSearch',
  'Textarea',
  'Image',
  'ImagePreviewGroup',
  'InputNumber',
  'Layout',
  'LayoutHeader',
  'LayoutSider',
  'LayoutFooter',
  'LayoutContent',
  'List',
  'ListItem',
  'ListItemMeta',
  'Menu',
  'MenuDivider',
  'MenuItem',
  'MenuItemGroup',
  'SubMenu',
  'Mentions',
  'MentionsOption',
  'Modal',
  'Statistic',
  'StatisticCountdown',
  'PageHeader',
  'Pagination',
  'Popconfirm',
  'Popover',
  'Progress',
  'Radio',
  'RadioButton',
  'RadioGroup',
  'Rate',
  'Result',
  'Row',
  'Select',
  'SelectOptGroup',
  'SelectOption',
  'Skeleton',
  'SkeletonButton',
  'SkeletonAvatar',
  'SkeletonInput',
  'SkeletonImage',
  'Slider',
  'Space',
  'Spin',
  'Steps',
  'Step',
  'Switch',
  'Table',
  'TableColumn',
  'TableColumnGroup',
  'TableSummary',
  'TableSummaryRow',
  'TableSummaryCell',
  'Transfer',
  'Tree',
  'TreeNode',
  'DirectoryTree',
  'TreeSelect',
  'TreeSelectNode',
  'Tabs',
  'TabPane',
  'Tag',
  'CheckableTag',
  'TimePicker',
  'TimeRangePicker',
  'Timeline',
  'TimelineItem',
  'Tooltip',
  'Typography',
  'TypographyLink',
  'TypographyParagraph',
  'TypographyText',
  'TypographyTitle',
  'Upload',
  'UploadDragger',
  'LocaleProvider',
];
let prefix = ''

let antdNames: Set<string>;

function genAntdNames(primitiveNames: string[]): void {
  antdNames = new Set(primitiveNames.map((name) => `${prefix}${name}`));
}
genAntdNames(primitiveNames);

function isAntd(compName: string): boolean {
  return antdNames.has(compName);
}

export function AntDesignResolver(
  options: AntDesignResolverOptions = {},
): ComponentResolver {
  prefix = options.prefix || ''

  return {
    type: 'component',
    resolve: (name: string) => {
      if (options.resolveIcons && name.match(/(Outlined|Filled|TwoTone)$/)) {
        return {
          name,
          from: '@ant-design/icons',
        };
      }

      if (isAntd(name) && !options?.exclude?.includes(name)) {
        const importName = name.slice(prefix.length);
        const { cjs = false, packageName = 'antd' } = options;
        const path = `${packageName}/${cjs ? 'lib' : 'es'}`;
        return {
          name: importName,
          from: path,
          sideEffects: getSideEffects(importName, options),
        };
      }
    },
  };
}

```



```javascript
import { AntDesignResolver } from './build/resolvers/antd';

export default defineConfig({
  plugins: [
    // 自动引入组件，无须声明
    AutoImport({
      imports: [
        'react', // react, useState, useEffect, ...
        'react-router-dom', // useNavigate, useLocation, ...
        'ahooks',
        {
          'use-immer': [
            'useImmer'
          ],
        },
      ],
      dts: true,
      resolvers: [
        // Antd组件和antd icons组件
        AntDesignResolver({
          resolveIcons: true,
          prefix: '',
        }),
      ],
    }),
  ],
});

```



## 自动引入图标配置
在unplugin这个仓库，还有一个package叫做unplugin-icons。这个库可以很方便的使用iconify的图标，在项目中以组件的形式使用各种UI框架的icons，并且<font style="color:rgb(36, 41, 46);">使用Icon自动引入,不需要下载图标库，系统会自动按需下载。</font>

>  iconify: [https://iconify.design/](https://iconify.design/)
>

> unplugin-icons: [https://unplugin.unjs.io/showcase/unplugin-icons.html](https://unplugin.unjs.io/showcase/unplugin-icons.html)
>

安装：

```javascript
yarn add -D unplugin-icons
```

## vue
在vue中使用依然很简单，利用unplugin-vue-components设置自动引入图标组件。

```javascript
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'


  plugins: [
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'icon', // 自动引入的Icon组件统一前缀，默认为 i，设置false为不需要前缀
          // {prefix}-{collection}-{icon} 使用组件解析器时，您必须遵循名称转换才能正确推断图标。
          // alias: { park: 'icon-park' } 集合的别名
          enabledCollections: ['ep'] // 这是可选的，默认启用 Iconify 支持的所有集合['mdi']
        }),
      ]
    }),
    Icons({
      // scale: 1, // 缩放
      compiler: 'vue3', // 编译方式
      // defaultClass: '', // 默认类名
      // defaultStyle: '', // 默认样式
      autoInstall: true
      // jsx: 'react' // jsx支持
    }),
  ],

```

然后使用时，按照前缀-图标集-图标名的格式来使用，如：

```html
<!-- 驼峰 -->
<IconEpFold class="v-icon" />
<!-- 或者 - -->
<icon-ep-fold class="v-icon" />
```

## react
react要用到unplugin-auto-import的resolvers。

```typescript
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'react', // react, useState, useEffect, ...
        'react-router-dom', // useNavigate, useLocation, ...
        'ahooks',
        {
          'use-immer': [
            'useImmer'
          ],
        },
      ],
      dts: true,
      resolvers: [
        // Antd组件
        AntDesignResolver({
          prefix: '',
        }),
        // icons
        IconsResolver({
          prefix: 'Icon',
          extension: 'jsx',
        }),
      ],
    }),
    Icons({
      compiler: 'jsx', // or 'solid'
    }),
  ],
});
```

使用：

```html
<!-- Icon是前缀，AntDesign是collection，DashboardOutlined是图标名 -->
<IconAntDesignDashboardOutlined />
```

实际使用的时候，说是按需下载图标，但是报错了找不到图标。因此又直接安装了全部图标，但是使用的时候按需引入还好。另外还报了两个错，一起安装依赖修复了。

```bash
# 修复找不到图标
yarn add @iconify/json      
# 修复找不到依赖
yarn add -D @svgr/core       
yarn add -D @svgr/plugin-jsx   
```

