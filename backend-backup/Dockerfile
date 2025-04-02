FROM node:18-alpine

WORKDIR /app

# パッケージ依存関係をコピーしてインストール
COPY package*.json ./

# bcryptの再ビルドに必要なパッケージを追加
RUN apk add --no-cache make gcc g++ python3 && \
    npm install && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3

# ソースコードをコピー
COPY . .

# 開発用コマンド
CMD ["npm", "run", "dev"]
