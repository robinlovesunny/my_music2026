#!/bin/bash

###############################################
# 阿里云ECS服务器环境初始化脚本
# 用途: 配置Node.js环境和PM2进程管理器
# 适用于: Alibaba Cloud Linux 3 / CentOS / Ubuntu
###############################################

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始初始化ECS服务器环境..."
echo "=========================================="

# 检测操作系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "无法检测操作系统类型"
    exit 1
fi

echo "检测到操作系统: $OS"

# 1. 检查Node.js是否已安装
echo ""
echo "步骤 1/5: 检查Node.js环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js已安装: $NODE_VERSION"
    
    # 检查版本是否满足要求(>=16.x)
    MAJOR_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ $MAJOR_VERSION -lt 16 ]; then
        echo "⚠ Node.js版本过低,建议升级到16.x或更高版本"
        echo "继续使用当前版本可能导致构建失败"
    fi
else
    echo "✗ Node.js未安装,开始安装Node.js 18.x LTS..."
    
    # 根据操作系统选择安装方式
    if [[ "$OS" == "centos" ]] || [[ "$OS" == "alinux" ]]; then
        # CentOS/Alibaba Cloud Linux
        curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        # Ubuntu/Debian
        curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
        sudo apt-get install -y nodejs
    else
        echo "不支持的操作系统: $OS"
        exit 1
    fi
    
    echo "✓ Node.js安装完成: $(node -v)"
fi

echo "✓ npm版本: $(npm -v)"

# 2. 配置npm镜像(可选,加速依赖下载)
echo ""
echo "步骤 2/5: 配置npm淘宝镜像..."
npm config set registry https://registry.npmmirror.com
echo "✓ npm镜像已设置为淘宝镜像"

# 3. 安装/更新PM2进程管理器
echo ""
echo "步骤 3/5: 检查PM2进程管理器..."
if command -v pm2 &> /dev/null; then
    echo "✓ PM2已安装: $(pm2 -v)"
    echo "更新PM2到最新版本..."
    npm install -g pm2@latest
else
    echo "安装PM2..."
    npm install -g pm2@latest
fi
echo "✓ PM2版本: $(pm2 -v)"

# 4. 配置PM2开机自启
echo ""
echo "步骤 4/5: 配置PM2开机自启动..."
pm2 startup systemd -u $USER --hp $HOME
echo "✓ PM2开机自启动已配置"

# 5. 创建应用部署目录
echo ""
echo "步骤 5/5: 创建应用部署目录..."
APP_DIR="$HOME/apps/my-music-player"
mkdir -p $APP_DIR
echo "✓ 应用目录已创建: $APP_DIR"

# 6. 检测可用端口
echo ""
echo "检测可用端口(3000-3999)..."
for port in {3000..3999}; do
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✓ 可用端口: $port"
        echo "建议在部署脚本中使用此端口"
        break
    fi
done

echo ""
echo "=========================================="
echo "✓ ECS服务器环境初始化完成!"
echo "=========================================="
echo ""
echo "环境信息:"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo "  PM2: $(pm2 -v)"
echo "  应用目录: $APP_DIR"
echo ""
echo "下一步操作:"
echo "  1. 在GitHub仓库配置Secrets(详见DEPLOYMENT.md)"
echo "  2. 推送代码到main/master分支触发自动部署"
echo "  3. 或者手动执行: bash scripts/deploy.sh"
echo ""
