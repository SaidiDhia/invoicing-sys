FROM node:21-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./

# If you want yarn update and  install uncomment the bellow

RUN yarn install &&  yarn upgrade

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BASE_URL 
ENV BASE_URL ${BASE_URL}
RUN echo ${BASE_URL}

ARG NEXT_PUBLIC_BASE_URL 
ENV NEXT_PUBLIC_BASE_URL ${NEXT_PUBLIC_BASE_URL}

ARG NEXT_PUBLIC_CABINET_ID
ENV NEXT_PUBLIC_CABINET_ID ${NEXT_PUBLIC_CABINET_ID}

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]