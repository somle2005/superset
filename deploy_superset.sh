#!/bin/bash

set -e

# 定义变量
REPO_URL="https://github.com/apache/superset.git"
REPO_DIR="/home/sm/superset"
VENV_DIR="${REPO_DIR}/spvenv"
SECRET_FILE="${REPO_DIR}/.superset_secret_key"
FLASK_APP="superset"
ADMIN_USERNAME="sm"
ADMIN_FIRSTNAME="SM"
ADMIN_LASTNAME="User"
ADMIN_EMAIL="sm@example.com"
ADMIN_PASSWORD="smpassword"
HOST="0.0.0.0"
PORT="8088"
GUNICORN_WORKERS=3
GUNICORN_BIND="0.0.0.0:8088"

export SUPERSET_ENCRYPTION_KEY=$SUPERSET_ENCRYPTION_KEY
export SUPERSET_SECRET_KEY=$SUPERSET_SECRET_KEY

# 添加 npm 所在的目录到 PATH，而不是覆盖 PATH
export PATH="/home/sm/.nvm/versions/node/v22.12.0/bin:$PATH"

# 函数：检查命令是否存在
command_exists () {
    command -v "$1" >/dev/null 2>&1
}

# 检查并安装 Node.js 和 npm
if ! command_exists node || ! command_exists npm ; then
    echo "Node.js 和 npm 未安装或未在 PATH 中。请先安装 Node.js 和 npm，然后重新运行脚本。"
    echo "你可以访问 https://nodejs.org/ 以获取安装指南。"
    exit 1
fi

# 输出 npm 和 node 版本以确认
echo "npm 版本: $(npm -v)"
echo "node 版本: $(node -v)"

# 安装前端依赖并构建
if [ -d "superset-frontend" ]; then
    cd superset-frontend
    npm install
    npm run build
    cd ..
else
    echo "未找到 superset-frontend 目录，跳过前端构建步骤。"
fi

cd "$REPO_DIR"

# 设置目录以及权限
git config --global --add safe.directory "$REPO_DIR"
sudo chown -R "$(whoami):$(whoami)" "$REPO_DIR"

# 确保日志目录存在并设置权限
mkdir -p /home/sm/superset/logs
chown -R sm:sm /home/sm/superset/logs

# 检查是否存在 SECRET_KEY 文件
if [ -f "$SECRET_FILE" ]; then
    SECRET_KEY=$(cat "$SECRET_FILE")
    echo "已读取现有的 SUPERSET_SECRET_KEY。"
else
    SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')
    echo "$SECRET_KEY" > "$SECRET_FILE"
    echo "已生成新的 SUPERSET_SECRET_KEY 并保存到 $SECRET_FILE。"
fi

echo "SUPERSET_SECRET_KEY=${SECRET_KEY}" > /home/sm/superset/.env

export SUPERSET_SECRET_KEY="$SECRET_KEY"
export FLASK_APP="$FLASK_APP"

# 创建并激活虚拟环境
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "虚拟环境已创建在 ${VENV_DIR}。"
else
    echo "虚拟环境已存在在 ${VENV_DIR}，跳过创建步骤。"
fi

# 激活虚拟环境
source "${VENV_DIR}/bin/activate"

# 安装依赖（开发模式）
pip install --upgrade pip
pip install -e .
pip install pymysql psycopg2-binary mysqlclient Pillow gunicorn pyodps  # 添加 Pillow 和 Gunicorn
# pip uninstall pyodps
# pip install pyodps==0.10.7

# 初始化数据库
superset db upgrade

# 创建管理员用户
echo "正在创建管理员用户..."
superset fab create-admin \
    --username "$ADMIN_USERNAME" \
    --firstname "$ADMIN_FIRSTNAME" \
    --lastname "$ADMIN_LASTNAME" \
    --email "$ADMIN_EMAIL" \
    --password "$ADMIN_PASSWORD" || echo "管理员用户可能已存在，跳过创建步骤。"

superset init



echo "部署脚本执行完毕。"
