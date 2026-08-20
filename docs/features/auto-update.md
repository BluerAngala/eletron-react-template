---
title: "自动更新"
description: "基于 electron-updater 实现自动检查更新、下载和安装。"
---

# 自动更新

基于 `electron-updater` 实现自动检查更新、下载和安装。

## 更新流程

1. **检查更新**：点击首页"检查更新"按钮，向主进程发起请求
2. **版本对比**：主进程通过 `electron-updater` 比对当前版本与最新版本
3. **下载更新**：如有新版本，弹出下载进度条
4. **安装更新**：下载完成后，提示用户重启应用安装

## IPC 通道

| 通道 | 方向 | 说明 |
|---|---|---|
| `check-update` | 渲染 → 主 | 检查更新 |
| `start-download` | 渲染 → 主 | 开始下载 |
| `cancel-download` | 渲染 → 主 | 取消下载 |
| `quit-and-install` | 渲染 → 主 | 退出并安装 |
| `update-can-available` | 主 → 渲染 | 更新可用通知 |
| `update-error` | 主 → 渲染 | 更新错误通知 |
| `download-progress` | 主 → 渲染 | 下载进度 |
| `update-downloaded` | 主 → 渲染 | 下载完成 |