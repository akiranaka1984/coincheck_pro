FROM node:18-alpine

WORKDIR /app

# パッケージ依存関係をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# マイグレーション実行用のスクリプトを追加
COPY ./scripts/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# 開発用コマンド
CMD ["npm", "run", "dev"]