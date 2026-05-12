# FigsCopa — Setup do Appwrite

## 1. Criar projeto

1. Acesse [cloud.appwrite.io](https://cloud.appwrite.io) e crie uma conta (gratuita)
2. Crie um novo projeto com o nome **FigsCopa**
3. Copie o **Project ID** e cole em `.env.local`

## 2. Configurar plataforma Web

Em **Project > Platforms**, adicione uma nova plataforma Web:
- **Hostname**: `localhost` (dev) e o domínio do Vercel (prod)

## 3. Criar Database

Em **Databases**, crie um banco com:
- **Database ID**: `figscopa`
- **Name**: FigsCopa

## 4. Criar Collections

### 4.1 `profiles`
| Attribute | Type | Required |
|---|---|---|
| name | String (255) | ✓ |
| email | String (255) | ✓ |
| city | String (255) | – |

**Indexes:** `email` (key, asc)

**Permissions:** Any user can read, user can write their own.

### 4.2 `collection` (figurinhas)
| Attribute | Type | Required |
|---|---|---|
| user_id | String (36) | ✓ |
| sticker_id | String (10) | ✓ |
| count | Integer | ✓ |

**Indexes:** `user_id` (key, asc), `sticker_id` (key, asc)

### 4.3 `friendships`
| Attribute | Type | Required |
|---|---|---|
| user_id | String (36) | ✓ |
| friend_id | String (36) | ✓ |
| status | String (20) | ✓ |

**Indexes:** `user_id` (key, asc), `friend_id` (key, asc)

### 4.4 `messages`
| Attribute | Type | Required |
|---|---|---|
| from_user_id | String (36) | ✓ |
| to_user_id | String (36) | ✓ |
| text | String (5000) | ✓ |
| kind | String (20) | – |

**Indexes:** `from_user_id` (key, asc), `to_user_id` (key, asc)

## 5. Habilitar Realtime

No menu lateral, acesse **Realtime** e certifique-se de que está habilitado. O app usará `databases.figscopa.collections.messages.documents` como canal.

## 6. Criar API Key

Em **Settings > API Keys**, crie uma chave com as permissões:
- `users.read`
- `users.write`
- `databases.read`
- `databases.write`
- `sessions.write`

Cole o valor em `APPWRITE_API_KEY` no `.env.local`.

## 7. Verificar variáveis de ambiente

Seu `.env.local` deve ter:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<seu project id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=figscopa
APPWRITE_API_KEY=<sua api key>
```

---

## Deploy no Vercel

1. Crie repositório GitHub e faça push do código
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
3. Configure **Root Directory** como `app` (se necessário)
4. Em **Environment Variables**, adicione as 4 variáveis acima
5. Clique em **Deploy** 🚀

No Appwrite, lembre de adicionar o domínio Vercel (ex: `figscopa.vercel.app`) em **Project > Platforms**.
