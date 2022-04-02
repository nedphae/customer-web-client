# React ChatUI pro 卡片库

用以开发/测试 React [ChatUI pro 自定义卡片模版](https://chatui.io/sdk/custom-component)

注意:
- ChatUI 自定义卡片是UMD 规范的、名为  AlimeComponent${CodeName} 的 React 组件。
- 打包时修改 [index.ts](./src/index.ts) 中的 `export default { default: YourComponent };`
- ChatUI pro 已经包含了 React 和 ChatUI 的包，所以打包时需要过滤掉这两个包，本项目的 [package.json](./package.json) 已经配置过滤


## 生成 ChatUI pro 卡片:

要生成ChatUI pro 卡片，再修改 index.ts 后执行:

```
npm run build
```

再 dist 文件夹中将生成 `index.cjs.js` `index.esm.js` 和 `index.umd.js`:

- `index.umd.js` 即为 ChatUI pro 需要的卡片模板
- 要安装卡片模板，复制并重命名 `index.umd.js` 到 `chat-server` 的 [src/public/chat/component](../chat-server/src/public/chat/component/README.md) 目录
- 修改 [setup.js](../chat-server/src/public/chat/setup.js) components 配置项中添加你的组件，具体方法查看 [自定义卡片模版](https://chatui.io/sdk/custom-component)
