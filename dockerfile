# Use uma imagem oficial do Node.js como base
FROM node:18-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de dependências
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Instale as dependências
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# Copie o restante da aplicação
COPY . .

# Construa a aplicação (ajuste o comando conforme seu framework, ex: next, vite, etc)
RUN npm run build

# Exponha a porta (ajuste conforme sua aplicação)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
