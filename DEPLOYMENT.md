# 阿里云ECS部署指南

本文档将引导您完成音乐播放器项目在阿里云ECS服务器上的部署配置。

## 📋 部署概览

- **ECS服务器IP**: 47.99.191.102
- **应用端口**: 3000 (可自定义)
- **访问方式**: http://47.99.191.102:3000
- **部署方式**: GitHub Actions自动部署 + PM2进程管理

---

## 🚀 快速开始

### 前提条件

- ✅ 已有阿里云ECS实例(47.99.191.102)
- ✅ 拥有ECS的SSH登录权限
- ✅ 项目代码已托管在GitHub

---

## 📝 部署步骤

### 第一步: 配置ECS服务器环境

#### 1.1 SSH登录到ECS服务器

```bash
ssh username@47.99.191.102
```

> 将 `username` 替换为您的实际用户名

#### 1.2 下载项目代码(首次)

```bash
# 创建应用目录
mkdir -p ~/apps
cd ~/apps

# 克隆项目
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git my-music-player
cd my-music-player
```

> 将 `YOUR_USERNAME/YOUR_REPO` 替换为您的GitHub仓库地址

#### 1.3 运行环境初始化脚本

```bash
# 赋予脚本执行权限
chmod +x scripts/setup-ecs-server.sh

# 执行初始化脚本
bash scripts/setup-ecs-server.sh
```

**脚本会自动完成:**
- ✓ 检查/安装Node.js环境(18.x LTS)
- ✓ 配置npm淘宝镜像
- ✓ 安装PM2进程管理器
- ✓ 配置PM2开机自启
- ✓ 检测可用端口

#### 1.4 配置安全组规则

在阿里云控制台配置ECS安全组,开放应用端口:

1. 登录阿里云控制台
2. 进入ECS实例详情页
3. 点击「安全组」→「配置规则」
4. 添加入方向规则:
   - 端口范围: 3000/3000
   - 授权对象: 0.0.0.0/0
   - 描述: 音乐播放器应用端口

---

### 第二步: 配置GitHub Secrets

在GitHub仓库配置部署所需的密钥信息:

#### 2.1 进入GitHub仓库设置

```
仓库首页 → Settings → Secrets and variables → Actions → New repository secret
```

#### 2.2 添加以下Secrets

| Secret名称 | 说明 | 示例值 |
|-----------|------|-------|
| `ALIYUN_SSH_HOST` | ECS服务器公网IP | `47.99.191.102` |
| `ALIYUN_SSH_USER` | SSH登录用户名 | `root` 或其他用户 |
| `ALIYUN_SSH_PRIVATE_KEY` | SSH私钥内容 | 见下方说明 |
| `ALIYUN_SSH_PORT` | SSH端口(可选) | `22` (默认) |

#### 2.3 获取SSH私钥

**方法1: 使用现有密钥对**

```bash
# 在本地机器上查看私钥
cat ~/.ssh/id_rsa

# 复制完整内容(包括BEGIN和END行)
```

**方法2: 创建新的密钥对**

```bash
# 生成新密钥对
ssh-keygen -t rsa -b 4096 -C "deploy@github-actions"

# 将公钥添加到ECS服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub username@47.99.191.102

# 复制私钥内容用于GitHub Secrets
cat ~/.ssh/id_rsa
```

---

### 第三步: 首次手动部署

在ECS服务器上执行首次手动部署,验证环境配置:

```bash
# 确保在项目目录
cd ~/apps/my-music-player

# 赋予部署脚本执行权限
chmod +x scripts/deploy.sh

# 执行部署脚本
bash scripts/deploy.sh
```

**部署脚本会自动:**
1. 检查端口占用情况
2. 拉取最新代码
3. 安装项目依赖
4. 构建生产版本
5. 使用PM2启动应用
6. 执行健康检查

#### 3.1 验证部署结果

```bash
# 查看PM2进程状态
pm2 status

# 查看应用日志
pm2 logs my-music-player

# 测试应用访问
curl http://localhost:3000
```

#### 3.2 浏览器访问

打开浏览器访问: **http://47.99.191.102:3000**

如果能看到音乐播放器界面,说明部署成功! 🎉

---

### 第四步: 启用自动部署

完成上述配置后,GitHub Actions会自动工作:

#### 4.1 触发自动部署

每次推送代码到 `main` 或 `master` 分支时,会自动触发部署:

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

#### 4.2 手动触发部署

也可以在GitHub仓库页面手动触发:

```
仓库首页 → Actions → 部署到阿里云ECS → Run workflow
```

#### 4.3 查看部署状态

在 `Actions` 页面可以实时查看部署进度和日志。

---

## 🛠️ 常用管理命令

### PM2进程管理

```bash
# 查看所有应用状态
pm2 status

# 查看应用实时日志
pm2 logs my-music-player

# 重启应用
pm2 restart my-music-player

# 停止应用
pm2 stop my-music-player

# 删除应用
pm2 delete my-music-player

# 查看应用详细信息
pm2 describe my-music-player

# 监控资源使用
pm2 monit
```

### 应用更新

```bash
# 手动拉取最新代码并重新部署
cd ~/apps/my-music-player
bash scripts/deploy.sh
```

### 日志管理

```bash
# 查看应用日志
pm2 logs my-music-player

# 清空日志
pm2 flush

# 查看错误日志
tail -f ~/.pm2/logs/my-music-player-error.log

# 查看输出日志
tail -f ~/.pm2/logs/my-music-player-out.log
```

---

## 🔧 端口配置

### 修改应用端口

如果3000端口已被占用,可以修改为其他端口:

#### 方法1: 修改部署脚本

编辑 `scripts/deploy.sh`:

```bash
DEPLOY_PORT="${DEPLOY_PORT:-3001}"  # 改为3001或其他端口
```

#### 方法2: 使用环境变量

```bash
DEPLOY_PORT=3001 bash scripts/deploy.sh
```

#### 方法3: 修改GitHub Actions配置

编辑 `.github/workflows/deploy-to-aliyun.yml`:

```yaml
env:
  DEPLOY_PORT: 3001  # 修改端口号
```

> ⚠️ 记得同步修改ECS安全组规则,开放新端口

---

## ❓ 常见问题排查

### Q1: 部署后无法访问应用

**可能原因和解决方案:**

1. **安全组未开放端口**
   ```bash
   # 检查端口监听
   netstat -tuln | grep 3000
   
   # 如果能看到监听,说明是安全组问题
   # 去阿里云控制台添加安全组规则
   ```

2. **应用启动失败**
   ```bash
   # 查看错误日志
   pm2 logs my-music-player --err
   
   # 检查依赖安装
   cd ~/apps/my-music-player
   npm install
   ```

3. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i:3000
   
   # 修改为其他端口后重新部署
   DEPLOY_PORT=3001 bash scripts/deploy.sh
   ```

### Q2: GitHub Actions部署失败

**检查步骤:**

1. **验证Secrets配置**
   - 确认所有必需的Secrets都已添加
   - 检查SSH私钥格式是否正确(包含完整的BEGIN和END行)

2. **测试SSH连接**
   ```bash
   # 在本地测试SSH连接
   ssh -i ~/.ssh/id_rsa username@47.99.191.102
   ```

3. **查看Actions日志**
   - 在GitHub仓库的Actions页面查看详细错误信息

### Q3: 构建过程内存不足

如果ECS实例配置较低,可能遇到内存不足:

```bash
# 创建交换文件(临时方案)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Q4: npm安装依赖速度慢

```bash
# 确认已使用淘宝镜像
npm config get registry

# 如果不是淘宝镜像,执行:
npm config set registry https://registry.npmmirror.com
```

### Q5: PM2应用意外停止

```bash
# 查看PM2日志
pm2 logs my-music-player

# 查看系统日志
journalctl -u pm2-username.service

# 重启应用
pm2 restart my-music-player
```

---

## 🔐 安全建议

### 基础安全配置

1. **禁用密码登录,仅使用密钥认证**
   ```bash
   sudo vi /etc/ssh/sshd_config
   # 设置: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

2. **使用非root用户部署**
   ```bash
   # 创建部署用户
   sudo useradd -m -s /bin/bash deployer
   sudo usermod -aG sudo deployer
   
   # 为新用户配置SSH密钥
   sudo mkdir -p /home/deployer/.ssh
   sudo cp ~/.ssh/authorized_keys /home/deployer/.ssh/
   sudo chown -R deployer:deployer /home/deployer/.ssh
   ```

3. **配置防火墙**
   ```bash
   # 仅开放必要端口
   sudo firewall-cmd --permanent --add-port=22/tcp
   sudo firewall-cmd --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   ```

4. **定期更新系统**
   ```bash
   sudo yum update -y
   ```

---

## 📊 性能优化

### 启用Gzip压缩

编辑PM2配置文件 `ecosystem.config.js`,添加serve参数:

```javascript
args: '-s dist -l 3000 --gzip'
```

### CDN加速(可选)

如果有域名,可以配置阿里云CDN加速静态资源访问。

---

## 📞 技术支持

如遇到问题,可以通过以下方式获取帮助:

1. 查看服务器日志: `pm2 logs my-music-player`
2. 查看GitHub Actions日志
3. 检查ECS控制台监控面板
4. 联系运维团队

---

## 📝 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-09 | v1.0 | 初始版本,完成基础部署配置 |

---

**祝部署顺利! 🎉**
