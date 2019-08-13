# CubeText
专为 OIer 定制的 C++ 代码编辑器，一键运行，人性优化。

## 项目预览

![](https://s2.ax1x.com/2019/08/13/mPSH56.jpg)

## 运行此项目源码

### 1. 安装 nodejs
本项目由 `typescript` 编写，故需要先安装 [nodejs](https://nodejs.org)。

### 2. 安装 yarn

请不要使用 `npm` 而是 [yarn](https://yarnpkg.com/) 作为包管理器。

### 3. 安装 typescript

我们需要安装 `typescript` 编译器，将代码输出为 `javascript`。请在终端运行如下指令进行安装，可能需要管理员权限。

```
yarn global add typescript
```

### 4. 对于 Windows 用户

很不幸，您需要手动安装 `Windows-Build-Tools`，来补充 `Windows` 缺失的编译环境。

```
yarn global add windows-build-tools
```

### 5. 下载该源码

```
git clone https://github.com/YuhangQ/CubeText.git
```

### 6. 安装依赖

进入目录。

```
cd CubeText/
```

对于 Windows 用户

```
npm_install.bat
```

对于 macOS/Linux 用户

```
./npm_install.sh
```

> 注意：请务必使用上述方式安装支持库，如使用 yarn 或 npm install 等命令，程序将无法正常运行。

### 7. 编译项目

```
yarn build
```

编译完成后生成 `app` 文件夹，里面是编译好的 `javascript` 文件

### 8. 启动项目

准备了这么久，开始运行程序吧。

```
yarn start
```

### 9. 打包程序

本项目使用 `electron-builder` 进行打包。

```
yarn dist
```

即可生成当前平台的最终程序，输出目录在 `package/`

如需要打包成其他平台，或其他形式的程序，请参考 [electron-builder](https://www.electron.build/)

