# 姑姑生日祝福网页

这是一个可直接部署到 GitHub Pages 的静态网页。

## 本地预览

在当前目录运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 发布到 GitHub Pages

1. 新建一个 GitHub 仓库。
2. 把 `index.html`、`styles.css`、`script.js`、`README.md` 上传到仓库根目录。
3. 打开仓库的 `Settings` -> `Pages`。
4. `Source` 选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/root`。
5. 保存后等待 GitHub 生成访问链接。

手机浏览器通常会禁止网页自动播放声音，所以页面中的英文版生日快乐旋律需要点击按钮后播放。

## 同一 Wi-Fi 手机访问

如果不使用 GitHub Pages，也可以让电脑和手机连接同一个 Wi-Fi，然后在电脑上运行本地服务：

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

手机浏览器打开电脑的局域网地址，例如：

```text
http://172.31.72.130:8000/index.html
```

这个地址只在电脑保持开机、服务保持运行、手机和电脑处于同一网络时可用。
