FROM node:18-alpine

WORKDIR /app

# パッケージ依存関係をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 開発用サーバーを起動
CMD ["npm", "start"]