#!/bin/bash

# 部署脚本 - 用于将FastDog项目部署到CentOS服务器
# 作者: duaneng
# 最后更新: $(date +"%Y-%m-%d")

####################################
# 服务器配置信息
####################################
# 服务器SSH登录用户名
SERVER_USER="root"
# 服务器IP地址
SERVER_IP="gishai"
# 服务器应用部署目录
REMOTE_APP_DIR="/home/web/gishai"


####################################
# 终端颜色定义
# 用于脚本输出信息着色
####################################
GREEN="\033[0;32m"  # 绿色 - 成功信息
YELLOW="\033[0;33m" # 黄色 - 警告信息
RED="\033[0;31m"    # 红色 - 错误信息
NC="\033[0m"        # 重置颜色 - No Color

####################################
# 日志输出函数
# 提供不同级别的日志输出功能
####################################
# 信息级别日志 - 绿色
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# 警告级别日志 - 黄色
warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 错误级别日志 - 红色
# 输出错误信息并退出脚本
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}


# 构建项目
info "构建项目..."
npm run build || error "项目构建失败"

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    error "构建失败：dist目录不存在"
fi

info "项目构建成功"

####################################
# 推送dist文件到服务器
####################################
info "推送构建文件到服务器..."

# 使用rsync同步dist目录到服务器
# --delete: 删除目标目录中源目录没有的文件
# --exclude: 排除不需要的文件
rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_APP_DIR}/ || error "文件推送失败"

info "构建文件推送成功"

####################################