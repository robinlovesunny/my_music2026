#!/bin/bash

###############################################
# 音乐播放器自动部署脚本
# 用途: 构建并部署React应用到ECS服务器
###############################################

set -e  # 遇到错误立即退出

# 配置项
APP_NAME="my-music-player"
APP_DIR="$HOME/apps/$APP_NAME"
DEPLOY_PORT="${DEPLOY_PORT:-3000}"  # 默认端口3000,可通过环境变量覆盖
GIT_REPO="${GIT_REPO:-https://github.com/YOUR_USERNAME/YOUR_REPO.git}"  # 需要替换为实际仓库地址
GIT_BRANCH="${GIT_BRANCH:-main}"

echo "=========================================="
echo "开始部署 $APP_NAME"
echo "=========================================="
echo "部署目录: $APP_DIR"
echo "部署端口: $DEPLOY_PORT"
echo "Git分支: $GIT_BRANCH"
echo ""

# 1. 检测端口是否被占用
echo "步骤 1/6: 检查端口占用情况..."
if lsof -Pi :$DEPLOY_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠ 端口 $DEPLOY_PORT 已被占用"
    OCCUPYING_PROCESS=$(lsof -Pi :$DEPLOY_PORT -sTCP:LISTEN -t)
    echo "占用进程: $OCCUPYING_PROCESS"
    
    # 如果是PM2托管的应用,尝试停止
    if pm2 list | grep -q "$APP_NAME"; then
        echo "停止旧版本应用..."
        pm2 stop $APP_NAME
        pm2 delete $APP_NAME
        echo "✓ 旧版本已停止"
    fi
else
    echo "✓ 端口 $DEPLOY_PORT 可用"
fi

# 2. 创建/更新应用目录
echo ""
echo "步骤 2/6: 准备应用目录..."
if [ -d "$APP_DIR" ]; then
    echo "应用目录已存在,进入目录..."
    cd $APP_DIR
    
    # 检查是否为git仓库
    if [ -d ".git" ]; then
        echo "拉取最新代码..."
        git fetch origin
        git reset --hard origin/$GIT_BRANCH
        git pull origin $GIT_BRANCH
        echo "✓ 代码已更新"
    else
        echo "目录存在但非git仓库,重新克隆..."
        cd ..
        rm -rf $APP_NAME
        git clone -b $GIT_BRANCH $GIT_REPO $APP_NAME
        cd $APP_NAME
        echo "✓ 代码已克隆"
    fi
else
    echo "创建应用目录并克隆代码..."
    mkdir -p $APP_DIR
    cd $APP_DIR
    git clone -b $GIT_BRANCH $GIT_REPO .
    echo "✓ 代码已克隆"
fi

# 3. 安装依赖
echo ""
echo "步骤 3/6: 安装项目依赖..."
if [ -f "package-lock.json" ]; then
    npm ci  # 使用ci命令更快且可靠
else
    npm install
fi
echo "✓ 依赖安装完成"

# 4. 构建项目
echo ""
echo "步骤 4/6: 构建生产版本..."
npm run build
if [ ! -d "dist" ]; then
    echo "✗ 构建失败: dist目录不存在"
    exit 1
fi
echo "✓ 构建完成"

# 5. 安装serve(如果未安装)
echo ""
echo "步骤 5/6: 准备静态文件服务器..."
if ! command -v serve &> /dev/null; then
    echo "安装serve..."
    npm install -g serve
fi
echo "✓ serve已就绪"

# 6. 启动应用
echo ""
echo "步骤 6/6: 启动应用..."

# 创建PM2配置文件
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'serve',
    args: '-s dist -l $DEPLOY_PORT',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: $DEPLOY_PORT
    },
    error_file: '$HOME/.pm2/logs/$APP_NAME-error.log',
    out_file: '$HOME/.pm2/logs/$APP_NAME-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

# 使用PM2启动
pm2 start ecosystem.config.js
pm2 save  # 保存PM2进程列表

echo ""
echo "=========================================="
echo "✓ 部署完成!"
echo "=========================================="
echo ""
echo "应用信息:"
echo "  应用名称: $APP_NAME"
echo "  访问地址: http://$(curl -s ifconfig.me):$DEPLOY_PORT"
echo "  本地访问: http://localhost:$DEPLOY_PORT"
echo ""
echo "PM2管理命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs $APP_NAME"
echo "  重启应用: pm2 restart $APP_NAME"
echo "  停止应用: pm2 stop $APP_NAME"
echo "  删除应用: pm2 delete $APP_NAME"
echo ""
echo "健康检查:"
sleep 3
if curl -s http://localhost:$DEPLOY_PORT > /dev/null; then
    echo "✓ 应用健康检查通过"
else
    echo "⚠ 应用可能启动失败,请查看日志: pm2 logs $APP_NAME"
fi
