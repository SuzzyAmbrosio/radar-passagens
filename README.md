# Radar de Passagens

Base do sistema de alertas de passagens aéreas. Esta etapa não consulta sites de companhias, não contém scraping e não usa chaves ou APIs externas. As ofertas exibidas pelo `MockFlightDataProvider` são sempre marcadas como **MOCK** e não representam preços reais.

## Tecnologias

- Next.js (App Router), React e TypeScript
- Tailwind CSS
- PostgreSQL e Prisma ORM
- Vitest para testes de domínio

## Arquitetura

| Camada | Local |
| --- | --- |
| Interface | `src/app` e `src/components` |
| API server-side | `src/app/api` |
| Banco de dados | `prisma/schema.prisma` e `src/lib/prisma.ts` |
| Busca de voos | `src/domain/flight` |
| Análise e ofertas | `src/domain/pricing` e `src/domain/deals` |
| Notificações e afiliados | `src/domain/notifications` e `src/domain/affiliates` |
| Jobs | `src/jobs/price-monitoring-job.ts` |

As rotas internas disponíveis são: `GET/POST /api/alerts`, `GET/PATCH/DELETE /api/alerts/:id`, `POST /api/alerts/:id/pause`, `GET /api/offers` e `GET /api/history`.

> A identidade usada na API é temporariamente uma conta local de desenvolvimento. A camada `getCurrentUser` em `src/lib/dev-user.ts` deve ser substituída por uma integração de autenticação antes de produção.

## Executar localmente

1. Copie `.env.example` para `.env` e informe uma `DATABASE_URL` PostgreSQL válida.
2. Instale dependências: `npm install`.
3. Gere o cliente Prisma: `npx prisma generate`.
4. Aplique o schema no banco de desenvolvimento: `npx prisma db push`.
5. Rode a aplicação: `npm run dev`.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes cobrem criação/validação de alerta, preço máximo inválido, normalização de oferta mock e o cálculo inicial do `DealDetector`.

## Adicionar um provedor real futuramente

1. Crie uma classe em `src/domain/flight` que implemente `FlightDataProvider`.
2. Leia credenciais somente por variáveis de ambiente no servidor; não exponha tokens ao cliente.
3. Converta a resposta autorizada do provedor para `FlightOfferData`.
4. Registre a implementação na composição de `FlightSearchService`.
5. Persista buscas, ofertas e histórico via Prisma e conecte o `PriceMonitoringJob` a um scheduler externo.

Não adicione scraping de sites. Use apenas APIs oficiais ou parceiros devidamente autorizados.
