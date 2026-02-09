# GitHub Secrets 配置详细指导

本文档将指导您如何为项目配置GitHub Actions自动部署所需的Secrets，实现代码推送后自动部署到阿里云服务器。

---

## 📋 目录

- [第1步: 获取SSH私钥](#第1步-获取ssh私钥)
- [第2步: 配置GitHub Secrets](#第2步-配置github-secrets)
- [第3步: 验证配置](#第3步-验证配置)
- [第4步: 重新运行部署](#第4步-重新运行部署)
- [常见问题](#常见问题)
- [安全建议](#安全建议)

---

## 第1步: 获取SSH私钥

SSH私钥是GitHub Actions连接到您阿里云服务器的关键凭证。有两种方式获取私钥：

### 方式1: 从现有服务器获取私钥 (推荐)

**适用场景**: 您已经可以通过密码或其他方式登录服务器

**操作步骤**:

1. 打开终端工具（Mac/Linux使用Terminal，Windows使用PowerShell或Xshell、FinalShell等）

2. 连接到阿里云服务器：
   ```bash
   ssh root@47.99.191.102
   ```

3. 输入密码登录成功后，运行以下命令查看私钥：
   ```bash
   cat ~/.ssh/id_rsa
   ```

4. **完整复制**输出的所有内容（包括 `-----BEGIN` 和 `-----END` 标记行）

5. 如果提示"没有那个文件或目录"，说明服务器上没有SSH密钥，请使用**方式2**

### 方式2: 生成新的SSH密钥对

**适用场景**: 服务器上没有现成的私钥，或需要为CI/CD专门生成新密钥

**操作步骤**:

1. **在本地电脑**上打开终端，运行以下命令生成新密钥对：
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
   ```

2. 按照提示操作：
   ```
   Enter file in which to save the key (/Users/your-name/.ssh/id_rsa): [直接回车]
   Enter passphrase (empty for no passphrase): [直接回车，不设置密码]
   Enter same passphrase again: [直接回车]
   ```

3. 查看并复制**私钥**内容：
   ```bash
   cat ~/.ssh/id_rsa
   ```
   > 💡 完整复制输出内容，稍后需要粘贴到GitHub Secrets

4. 查看**公钥**内容：
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

5. 将公钥上传到阿里云服务器：
   
   **方法A - 自动上传（推荐）**:
   ```bash
   ssh-copy-id root@47.99.191.102
   ```
   输入服务器密码后，公钥会自动添加到服务器

   **方法B - 手动上传**:
   ```bash
   # 先登录服务器
   ssh root@47.99.191.102
   
   # 创建.ssh目录（如果不存在）
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   
   # 编辑authorized_keys文件
   nano ~/.ssh/authorized_keys
   # 或使用 vi ~/.ssh/authorized_keys
   
   # 将公钥内容粘贴到文件末尾，保存退出
   
   # 设置正确的权限
   chmod 600 ~/.ssh/authorized_keys
   ```

### ⚠️ 私钥格式说明

**正确的私钥格式示例**:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAx1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP
QRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
...
(中间会有很多行类似的随机字符)
...
QRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
0123456789abcdefghijklmnopqrstuvwxyz==
-----END OPENSSH PRIVATE KEY-----
```

**重要提示**:
- ✅ 必须包含开头的 `-----BEGIN OPENSSH PRIVATE KEY-----`
- ✅ 必须包含结尾的 `-----END OPENSSH PRIVATE KEY-----`
- ✅ 中间所有行都要完整复制
- ❌ 不要有多余的空格或换行
- ❌ 不要遗漏任何字符

---

## 第2步: 配置GitHub Secrets

GitHub Secrets是存储敏感信息的安全方式，这些信息会在GitHub Actions运行时使用，但不会在代码或日志中显示。

### 2.1 打开Secrets设置页面

1. 访问您的仓库Secrets设置页面：
   ```
   https://github.com/robinlovesunny/my_music2026/settings/secrets/actions
   ```

2. 如果看到"404"或"权限不足"提示：
   - 确认您已登录GitHub账号
   - 确认您是该仓库的Owner或Admin
   - 联系仓库管理员添加您的权限

### 2.2 添加Secret #1: ALIYUN_SSH_HOST

**说明**: 服务器的IP地址或域名

1. 点击页面右上角的绿色按钮 **"New repository secret"**
2. 在 **Name** 输入框中填写：
   ```
   ALIYUN_SSH_HOST
   ```
3. 在 **Secret** 输入框中填写：
   ```
   47.99.191.102
   ```
4. 点击 **"Add secret"** 按钮保存

### 2.3 添加Secret #2: ALIYUN_SSH_USER

**说明**: SSH登录的用户名

1. 再次点击 **"New repository secret"**
2. **Name** 填写：
   ```
   ALIYUN_SSH_USER
   ```
3. **Secret** 填写：
   ```
   root
   ```
   > 💡 如果您使用其他用户名（如 `ubuntu`、`admin`等），请填写相应的用户名

4. 点击 **"Add secret"** 保存

### 2.4 添加Secret #3: ALIYUN_SSH_PORT

**说明**: SSH服务的端口号

1. 点击 **"New repository secret"**
2. **Name** 填写：
   ```
   ALIYUN_SSH_PORT
   ```
3. **Secret** 填写：
   ```
   22
   ```
   > 💡 如果您的服务器SSH端口不是默认的22（比如修改为2222等），请填写实际端口号

4. 点击 **"Add secret"** 保存

### 2.5 添加Secret #4: ALIYUN_SSH_PRIVATE_KEY (最重要!)

**说明**: SSH私钥，用于身份验证

1. 点击 **"New repository secret"**
2. **Name** 填写：
   ```
   ALIYUN_SSH_PRIVATE_KEY
   ```
3. **Secret** 填写：
   - 粘贴在第1步中复制的**完整私钥内容**
   - ⚠️ 必须包含 `-----BEGIN OPENSSH PRIVATE KEY-----` 开头
   - ⚠️ 必须包含 `-----END OPENSSH PRIVATE KEY-----` 结尾
   - ⚠️ 中间所有内容都要完整，不能有遗漏
   - ⚠️ 不要添加额外的空格或换行

4. 检查无误后，点击 **"Add secret"** 保存

---

## 第3步: 验证配置

### 3.1 检查Secrets列表

配置完成后，返回Secrets页面，您应该能看到以下4个Secrets：

```
✓ ALIYUN_SSH_HOST
✓ ALIYUN_SSH_USER  
✓ ALIYUN_SSH_PORT
✓ ALIYUN_SSH_PRIVATE_KEY
```

> 📌 **注意**: GitHub出于安全考虑，不会显示Secret的具体值，只会显示名称和最后更新时间

### 3.2 Secret配置对照表

| Secret名称 | 示例值 | 说明 |
|-----------|--------|------|
| `ALIYUN_SSH_HOST` | `47.99.191.102` | 服务器IP地址 |
| `ALIYUN_SSH_USER` | `root` | SSH登录用户名 |
| `ALIYUN_SSH_PORT` | `22` | SSH端口号 |
| `ALIYUN_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH...` | SSH私钥（完整内容） |

### 3.3 修改Secret

如果发现配置错误，可以：
1. 找到需要修改的Secret
2. 点击右侧的 **"Update"** 按钮
3. 输入新的值
4. 点击 **"Update secret"** 保存

---

## 第4步: 重新运行部署

配置好Secrets后，需要触发GitHub Actions重新执行部署流程。

### 方法1: 重新运行失败的Workflow (推荐)

1. 访问Actions页面：
   ```
   https://github.com/robinlovesunny/my_music2026/actions
   ```

2. 在Workflow运行列表中找到最近失败的运行记录（通常有红色 ❌ 标记）

3. 点击进入该运行详情页面

4. 点击右上角的 **"Re-run jobs"** 按钮

5. 选择 **"Re-run all jobs"**

6. 等待部署完成（通常需要1-3分钟）

### 方法2: 推送新代码触发

如果没有失败的记录可以重新运行，可以推送一个新的提交：

```bash
# 进入项目目录
cd /Users/jiabin/Documents/Qteam-Demo-2026/my_music2026

# 创建一个空提交来触发部署
git commit --allow-empty -m "Trigger deployment"

# 推送到GitHub
git push origin main
```

### 查看部署日志

1. 在Actions页面点击正在运行或已完成的workflow

2. 点击左侧的job名称（如 "deploy"）

3. 展开各个步骤，查看详细日志

4. 如果部署成功，最后会显示绿色 ✅ 标记

---

## 常见问题

### ❓ Q1: 粘贴私钥后提示格式错误？

**A**: 请检查以下几点：
- ✅ 确保复制了完整内容，包括 `-----BEGIN` 和 `-----END` 标记行
- ✅ 不要有多余的空格或空行
- ✅ 使用文本编辑器打开私钥文件，确保复制完整
- ✅ 不要使用Word等富文本编辑器，避免格式问题

**解决方法**:
```bash
# 将私钥复制到剪贴板（Mac）
pbcopy < ~/.ssh/id_rsa

# 将私钥复制到剪贴板（Linux）
xclip -sel clip < ~/.ssh/id_rsa

# 或者直接查看并手动复制
cat ~/.ssh/id_rsa
```

### ❓ Q2: 配置后还是提示"Connection refused"或连接失败？

**A**: 请依次检查以下项：

**1. 服务器防火墙设置**
```bash
# 登录服务器后检查SSH端口是否开放
sudo netstat -tlnp | grep ssh

# 如果使用阿里云，检查安全组规则
# 访问: 阿里云控制台 → ECS → 安全组 → 配置规则
# 确保允许入站22端口
```

**2. SSH用户名是否正确**
```bash
# 在服务器上查看当前用户
whoami

# 确认该用户有SSH登录权限
cat /etc/ssh/sshd_config | grep AllowUsers
```

**3. 公钥是否正确配置**
```bash
# 在服务器上检查authorized_keys
cat ~/.ssh/authorized_keys

# 确认文件权限正确
ls -la ~/.ssh/authorized_keys
# 应该显示: -rw------- (600权限)

# 修复权限（如果需要）
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**4. SSH服务是否运行**
```bash
# 检查SSH服务状态
sudo systemctl status sshd
# 或
sudo service ssh status

# 如果未运行，启动服务
sudo systemctl start sshd
```

### ❓ Q3: 怎么查看详细的部署日志？

**A**: 
1. 访问 `https://github.com/robinlovesunny/my_music2026/actions`
2. 点击任意一个workflow运行记录
3. 点击左侧的job名称（如 "deploy" 或 "build"）
4. 每个步骤都可以展开查看详细输出
5. 如果有错误，会用红色标记显示

### ❓ Q4: 能否使用密码代替SSH私钥？

**A**: 不推荐。原因：
- ❌ GitHub Actions无法交互式输入密码
- ❌ 密码存储在Secrets中安全性较低
- ✅ SSH密钥是标准做法，更安全
- ✅ 可以为不同的服务配置不同的密钥对

### ❓ Q5: 如何测试SSH私钥是否正确？

**A**: 在本地测试：
```bash
# 将私钥保存到临时文件
nano /tmp/test_key
# 粘贴私钥内容，保存退出

# 设置正确的权限
chmod 600 /tmp/test_key

# 测试连接
ssh -i /tmp/test_key -p 22 root@47.99.191.102

# 如果能成功登录，说明私钥正确
# 测试完成后删除临时文件
rm /tmp/test_key
```

### ❓ Q6: 部署成功了，但网站没有更新？

**A**: 可能的原因：
1. **服务器上的服务未重启**
   ```bash
   # 登录服务器
   ssh root@47.99.191.102
   
   # 重启相关服务（根据实际情况）
   pm2 restart all
   # 或
   systemctl restart nginx
   ```

2. **部署路径不正确**
   - 检查workflow文件中的部署路径
   - 确认文件是否真的上传到了正确位置

3. **浏览器缓存**
   - 按 `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac) 强制刷新
   - 清除浏览器缓存后重试

### ❓ Q7: 如何删除或更新Secret？

**A**: 
- **更新**: 在Secrets列表找到对应项 → 点击 "Update" → 输入新值 → 保存
- **删除**: 在Secrets列表找到对应项 → 点击 "Remove" → 确认删除

> ⚠️ **注意**: 删除Secret后，使用该Secret的workflow将会失败

---

## 安全建议

### 🔒 保护您的私钥

1. **永远不要将私钥提交到代码仓库**
   - 检查 `.gitignore` 文件是否包含：
     ```
     *.pem
     *.key
     id_rsa
     id_rsa.pub
     ```

2. **使用专用密钥**
   - 为CI/CD创建专用的SSH密钥对
   - 不要使用个人日常使用的密钥

3. **定期轮换密钥**
   - 建议每3-6个月更换一次SSH密钥
   - 特别是团队成员变动时

4. **最小权限原则**
   - 考虑创建专门的部署用户（而非使用root）
   - 只赋予必要的文件访问权限

### 🔐 服务器安全加固

```bash
# 1. 禁用密码登录，只允许密钥登录
sudo nano /etc/ssh/sshd_config
# 修改以下行：
# PasswordAuthentication no
# PubkeyAuthentication yes

# 2. 禁用root直接登录（可选）
# PermitRootLogin no

# 3. 重启SSH服务使配置生效
sudo systemctl restart sshd

# 4. 配置防火墙只允许必要端口
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 📝 最佳实践

1. ✅ 使用GitHub Secrets存储敏感信息
2. ✅ 为不同环境（开发/测试/生产）使用不同的密钥
3. ✅ 在workflow日志中避免打印敏感信息
4. ✅ 定期审查有权限访问仓库的成员
5. ✅ 启用GitHub的安全功能（如Dependabot、Secret scanning）

---

## 📞 获取帮助

如果您在配置过程中遇到问题：

1. **查看GitHub Actions日志**: 大多数错误信息会在日志中显示
2. **检查服务器日志**: 
   ```bash
   sudo tail -f /var/log/auth.log  # Ubuntu/Debian
   sudo tail -f /var/log/secure    # CentOS/RHEL
   ```
3. **参考官方文档**: 
   - [GitHub Actions文档](https://docs.github.com/en/actions)
   - [GitHub Secrets文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 📚 相关资源

- [GitHub Actions官方文档](https://docs.github.com/en/actions)
- [SSH密钥管理最佳实践](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [阿里云ECS安全配置指南](https://help.aliyun.com/document_detail/25471.html)

---

**文档版本**: v1.0  
**最后更新**: 2026-02-09  
**维护者**: Qteam

---

> 💡 **提示**: 配置完成后，建议保存此文档以便日后参考。如有问题随时查阅！