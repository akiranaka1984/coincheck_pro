FROM node:18-alpine

WORKDIR /app

# パッケージ依存関係をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# ワーカープロセスを起動
CMD ["npm", "start"]