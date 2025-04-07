# ビルド用のステージ
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 本番用ビルドを生成
RUN npm run build

# 実行用のステージ
FROM nginx:alpine
# ビルドしたファイルをNginxのドキュメントルートにコピー
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
