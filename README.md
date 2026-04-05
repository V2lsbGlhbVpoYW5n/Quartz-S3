# Quartz v4

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>

## S3 Connect

可直接使用：

+ npm run build:s3
+ npm run serve:s3

需要环境变量：

```
S3_BUCKET
AWS_REGION（可选，默认 us-east-1）
S3_PREFIX（可选）
S3_ENDPOINT（可选，兼容 S3-like）
S3_FORCE_PATH_STYLE（可选）
S3_CLEAN_CONTENT（可选，默认清空 content 后再下载）
```