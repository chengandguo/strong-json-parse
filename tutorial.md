# 安装
npm install rollup --save-dev

## 安装typescript校验
npm install @rollup/plugin-typescript --save-dev
npm install tslib typescript --save-dev

## 安装eslint
npm install eslint --save-dev
npm install @typescript-eslint/parser --save-dev
npm install @typescript-eslint/eslint-plugin --save-dev

Tips: rules 设置
"indent": "off",
"@typescript-eslint/indent": ["error", 2]
防止vscode eslint插件在写const定义时弹出报错。
```
 TypeError: Cannot read property 'loc' of undefined
```

# commit 信息规范
https://commitlint.js.org/#/guides-local-setup
type(scope) : subject

type（必须） : commit 的类别，只允许使用下面几个标识：
feat : 新功能
fix : 修复bug
docs : 文档改变
style : 代码格式改变
refactor : 某个已有功能重构
perf : 性能优化
test : 增加测试
build : 改变了build工具 如 grunt换成了 npm
revert : 撤销上一次的 commit
chore : 构建过程或辅助工具的变动
使用commitizen 工具
```
  sudo npm install commitizen -g 
  npm install husky @commitlint/cli --save-dev
  npm install lint-staged --save-dev
```

## enable Git hooks
```
  npx husky install
```
## create a hook
```
  npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

# 关于npm prepare的执行时机

1.npm publish
2.npm install

# git commit 提交前
运行eslint检查
检查commit提交规范


# 单测
官网：[Jest](https://jestjs.io/)
需要安装babel, jest才能正常工作
```
  npm install @babel/preset-env @babel/preset-typescript --save-dev
```

1.为了解决编辑器对 jest 断言方法的类型报错，如 test、expect 的报错，你还需要安装

```
npm install --save-dev @types/jest
```

2.testEnvironment 默认配置为 "node"
如果想测试dom相关的函数，比如window.setTimeout
设置testEnvironment为"jsdom"

```
  npm install jest-environment-jsdom --save-dev
```

# 压代码输出
```
  npm install @rollup/plugin-terser --save-dev
```

# 本地服务
```
  npm install rollup-plugin-serve --save-dev
```