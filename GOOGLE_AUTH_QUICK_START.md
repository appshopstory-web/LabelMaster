# 🚀 Autenticação Google - Guia Rápido

## ✅ O Que Foi Implementado

### Novos Arquivos
- **`services/authService.ts`** - Serviço centralizado de autenticação
  - `signInWithGoogle()` - Abre o login do Google
  - `signOut()` - Realiza logout
  - `getSession()` - Obtém sessão atual
  - `onAuthStateChange()` - Monitora mudanças de autenticação

### Modificações
- **`App.tsx`**
  - Substituído login GitHub mock por Google OAuth real
  - Novo state `user` (AppUser) em vez de `githubUser`
  - Funções `handleGoogleLogin()` e `handleLogout()` async
  - Novo useEffect para carregar sessão ao iniciar

- **`types.ts`**
  - Novo tipo `AppUser` (mais genérico que GithubUser)
  - Exporta tipo para reaproveitar em outro componentes

- **`package.json`**
  - `@supabase/auth-ui-react@^0.4.7`
  - `@supabase/auth-ui-shared@^0.1.8`

## 🔧 Como Configurar (3 Passos Rápidos)

### 1️⃣ Google Cloud Console
```
1. Vá para https://console.cloud.google.com
2. Crie um OAuth 2.0 Web Application
3. Copie Client ID e Client Secret
```

### 2️⃣ Supabase Dashboard
```
1. Vá para Authentication → Providers
2. Habilite Google Provider
3. Cole Client ID e Client Secret
```

### 3️⃣ Pronto para Usar! 🎉
```bash
npm run dev
# Abra http://localhost:3000
# Clique em "CONECTAR COM GOOGLE"
```

---

## 📋 Fluxo de Autenticação

```
┌─────────────────┐
│  App inicia     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ useEffect:                   │
│ - getSession()               │
│ - onAuthStateChange()        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Usuário clica botão          │
│ "CONECTAR COM GOOGLE"        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ handleGoogleLogin()          │
│  → signInWithGoogle()        │
│  → Redireciona para Google   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Google Auth                  │
│ Redireciona de volta         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ onAuthStateChange triggered  │
│ user = AuthUser (Google)     │
└──────────────────────────────┘
```

---

## 🔒 Dados do Usuário Capturados

```typescript
interface AppUser {
  id: string;              // UUID do Supabase
  email: string;           // Email do Google
  name: string;            // Nome completo
  avatar_url: string;      // URL da foto do Google
  provider: 'google';      // Identificação do provedor
}
```

---

## 🛠 Integração com Templates

O sistema já está pronto para:
- ✅ Sincronizar templates do usuário com Supabase
- ✅ Usar `user.id` como chave para RLS (Row Level Security)
- ✅ Salvar templates por usuário autenticado

**Próximo passo (opcional):**
Implementar RLS para isolar dados por usuário:
```sql
ALTER TABLE public.templates ADD COLUMN user_id UUID;
ALTER TABLE public.templates ADD CONSTRAINT user_fk 
  FOREIGN KEY(user_id) REFERENCES auth.users(id);

CREATE POLICY "Users can only see their own templates"
ON public.templates FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🧪 Teste Rápido

1. Abra DevTools (F12) → Console
2. Você verá logs quando:
   - Sessão carregada com sucesso
   - Usuário faz login
   - Usuário faz logout
3. O status na parte inferior muda para "Cloud OK" quando Supabase está conectado

---

## ⚠️ Possíveis Problemas

| Problema | Solução |
|----------|---------|
| "Botão não funciona" | Verifique se Google OAuth está ativo no Supabase |
| "Redireciona infinito" | Verifique redirect URLs no Supabase |
| "Erro CORS" | Adicione seu domínio em URL Configuration |
| "Usuário null" | Aguarde o carregamento da sessão (alguns segundos) |

---

## 📚 Arquivos Relacionados

- [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) - Setup detalhado
- [lib/supabase.ts](./lib/supabase.ts) - Configuração Supabase
- [services/authService.ts](./services/authService.ts) - Lógica de autenticação
- [App.tsx](./App.tsx) - Integração principal (linhas 187-210)

---

## ✨ Próximas Melhorias Sugeridas

- [ ] Implementar RLS para templates isolados por usuário
- [ ] Adicionar autenticação adicional (GitHub, Email/Senha)
- [ ] Página de perfil com opções de conta
- [ ] Logout automático após inatividade
- [ ] Sincronização em tempo real de templates entre abas

