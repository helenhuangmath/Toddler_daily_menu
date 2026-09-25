# 在 iPhone 上使用 · Using it on iPhone

有两种方式。**推荐方式一**：免费、几分钟就能完成，家里每个人都能装。

| | 方式一：添加到主屏幕（网页App） | 方式二：原生App（Xcode） |
|---|---|---|
| 费用 | 免费 | 需要 Mac；给家人用需要 Apple 开发者账号（每年 99 美元） |
| 安装 | Safari 打开链接 →“添加到主屏幕” | Xcode 编译，TestFlight 邀请家人 |
| 更新 | 自动，打开即是最新版 | 每次都要重新编译、上传 |
| 离线 | 可以（拍照识别除外） | 可以（拍照识别除外） |
| 家人共享菜单 | “分享给家人”发链接，对方一点就能保存 | 以文字形式分享 |

---

## 方式一：添加到主屏幕（推荐）

### 第 1 步：把 App 放到网上（只做一次）

App 需要一个网址，家人才能打开。选一个即可：

**A. GitHub Pages**
1. 把分支 `claude/toddler-menu-app-zntnu6` 合并到 `main`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 自动部署后，网址是 `https://helenhuangmath.github.io/Toddler_daily_menu/`。

> 注意：这个仓库目前是**私有**的。私有仓库用 GitHub Pages 需要 GitHub Pro（付费）。也可以把仓库改成公开，代码里没有任何个人信息（API 密钥只存在各自的手机上）。

**B. Netlify 或 Cloudflare Pages（免费，可连私有仓库）**
1. 用 GitHub 账号登录 netlify.com（或 pages.cloudflare.com）。
2. 选择 “Import from Git” → 选这个仓库和 `main` 分支。
3. Build command 留空，Publish directory 填 `.`（仓库根目录）。
4. 部署完成后会得到一个网址，例如 `https://little-spoon.netlify.app`。

### 第 2 步：每位家人安装

1. 用 **Safari** 打开网址（必须是 Safari）。
2. 点底部的 **分享** 按钮（方框加向上箭头）。
3. 往下滑，点 **添加到主屏幕** → **添加**。
4. 主屏幕上会出现绿色的小勺图标，点开就是全屏 App，没网也能用。

App 第一次在 iPhone 的 Safari 里打开时，也会显示这个安装提示。

### 家人之间共享同一份菜单

每部手机的食材和菜单是分开保存的。想让全家看同一份菜单：

1. 一个人生成菜单后，在“菜单”页点 **分享给家人**，通过微信 / 信息发出链接。
2. 家人点开链接 → 点 **保存到这部手机**。

---

## 方式二：原生 iPhone App（Xcode）

仓库里已经包含 Xcode 项目（`ios/` 文件夹，用 Capacitor 打包）。需要一台装了 Xcode 16 或更新版本的 Mac。

### 装到自己的 iPhone（免费 Apple ID 即可）

```bash
git clone https://github.com/helenhuangmath/Toddler_daily_menu.git
cd Toddler_daily_menu
npm install
npm run ios        # 复制网页文件，同步到 ios/，然后打开 Xcode
```

在 Xcode 里：
1. 左侧点 **App** → **Signing & Capabilities** → **Team** 选你的 Apple ID。
2. 如果提示 Bundle Identifier 被占用，把 `com.littlespoon.menu` 改成你自己的，例如 `com.yourname.littlespoon`。
3. 用数据线连上 iPhone，顶部选你的手机，点 ▶ 运行。
4. 第一次要在 iPhone 上打开 **设置 → 通用 → VPN与设备管理**，信任你的开发者证书。

> 免费 Apple ID 签名的 App **7 天后会失效**，需要重新运行一次。

### 给家人用（TestFlight）

1. 注册 Apple Developer Program（每年 99 美元）。
2. Xcode 菜单 **Product → Archive** → **Distribute App** → **TestFlight & App Store**。
3. 在 App Store Connect 的 TestFlight 里添加家人的 Apple ID 邮箱。
4. 家人在 iPhone 上安装 **TestFlight** App，接受邀请后即可安装。

### 改了网页代码之后

```bash
npm run ios        # 每次修改后运行，会把最新代码同步进 Xcode 项目
```

---

## 拍照识别

两种方式都支持拍照识别食材，都需要在 App 的 **设置** 里填写 Anthropic API 密钥（每部手机各填一次，只保存在这部手机上）。不填密钥，其他功能都能正常用。
