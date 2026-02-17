# ✅ Checklist de Configuração - Google OAuth

## 📋 Status Atual

### ✅ Backend - IMPLEMENTADO
- [x] Serviço de autenticação criado
- [x] Funções OAuth implementadas
- [x] Tipos TypeScript atualizados
- [x] Integração Supabase pronta
- [x] Servidor rodando sem erros
- [x] Sem erros de compilação

### ⏳ Google Cloud Console - AGUARDANDO SEU SETUP
- [ ] Criar projeto no Google Cloud
- [ ] Habilitar Google+ API
- [ ] Criar OAuth 2.0 Web Application
- [ ] Copiar Client ID
- [ ] Copiar Client Secret

### ⏳ Supabase - AGUARDANDO SEU SETUP
- [ ] Acessar Authentication → Providers
- [ ] Habilitar Google Provider
- [ ] Colar Client ID
- [ ] Colar Client Secret
- [ ] Salvar configuração

---

## 🔧 PASSO A PASSO

### Passo 1: Google Cloud Console (5 min)

#### 1.1 - Acessar Google Cloud
```
Vá para: https://console.cloud.google.com/
Faça login com sua conta Google
```

#### 1.2 - Criar Novo Projeto
```
Clique em seletor de projetos (topo)
Clique em "NEW PROJECT"
Nome: "LabelMaster Pro"
Clique em "CREATE"
```

#### 1.3 - Ativar Google+ API
```
Menu lateral → APIs & Services → Library
Buscar "Google+ API"
Clique e depois "ENABLE"
```

#### 1.4 - Criar OAuth Credentials
```
APIs & Services → Credentials
Clique em "+ CREATE CREDENTIALS"
Selecione "OAuth 2.0 Client ID"
Escolha "Web application"
```

#### 1.5 - Configurar URLs
```
Authorized JavaScript origins:
  - http://localhost:3000
  - http://127.0.0.1:3000

Authorized redirect URIs:
  - http://localhost:3000/auth/v1/callback
  - http://127.0.0.1:3000/auth/v1/callback
  - https://xhgwxesktuuzfogzojmc.supabase.co/auth/v1/callback
```

#### 1.6 - Copiar Credenciais
```
Você receberá:
  Client ID: (copie este)
  Client Secret: (copie este)
```

---

### Passo 2: Supabase (3 min)

#### 2.1 - Acessar Dashboard
```
Vá para: https://supabase.com/dashboard
Selecione seu projeto: xhgwxesktuuzfogzojmc
```

#### 2.2 - Ir para Autenticação
```
Menu lateral → Authentication
Clique em "Providers"
```

#### 2.3 - Habilitar Google
```
Procure por "Google"
Clique no toggle para ativar (ON)
```

#### 2.4 - Colar Credenciais
```
Client ID: (cole o valor do Google Cloud)
Client Secret: (cole o valor do Google Cloud)
Clique em "Save"
```

#### 2.5 - Verificar URLs
```
Authentication → URL Configuration
Certifique-se que está em "Redirect URLs":
  - http://localhost:3000
  - https://seudominio.com (produção)
```

---

### Passo 3: Testar (2 min)

#### 3.1 - Abrir App
```
Abra: http://localhost:3000
Você verá: "CONECTAR COM GOOGLE" (botão azul)
```

#### 3.2 - Clicar no Botão
```
Você será redirecionado para Google
Faça login com sua conta Google
```

#### 3.3 - Voltar para App
```
Você voltará para http://localhost:3000
Verá seu nome e foto
Status mudará para "Cloud OK"
```

---

## 🐛 Troubleshooting

### ❌ Problema: "Invalid redirect_uri"
**Causa:** URL não está configurada corretamente

**Solução:**
```
1. Google Cloud:
   - Verifique URLs em "Authorized redirect URIs"
   - Deve ter EXATAMENTE: http://localhost:3000/auth/v1/callback

2. Supabase:
   - Vá em Authentication → URL Configuration
   - Adicione: http://localhost:3000
```

---

### ❌ Problema: "Client ID or Client Secret is invalid"
**Causa:** Credenciais incorretas ou não foram copiadas corretamente

**Solução:**
```
1. Volte ao Google Cloud Console
2. Vá em APIs & Services → Credentials
3. Clique em seu OAuth app
4. Copie NOVAMENTE Client ID e Secret
5. Cole no Supabase
6. Clique em Save
```

---

### ❌ Problema: "Botão não funciona"
**Causa:** Google Provider não está ativo no Supabase

**Solução:**
```
1. Supabase Dashboard
2. Authentication → Providers
3. Procure por "Google"
4. Verifique se o toggle está ON (azul)
5. Se não estiver, clique para ativar
```

---

### ❌ Problema: "Erro CORS"
**Causa:** Domínio não está na lista de origens

**Solução:**
```
1. Google Cloud Console
2. APIs & Services → Credentials
3. Clique no OAuth 2.0 Client ID
4. Adicione em "Authorized JavaScript origins":
   - http://localhost:3000
   - http://127.0.0.1:3000
```

---

### ❌ Problema: "Redireciona infinito"
**Causa:** Redirect URI incorreta

**Solução:**
```
Verifique se existe EXATAMENTE:
  http://localhost:3000/auth/v1/callback

No Google Cloud E no Supabase
```

---

### ❌ Problema: "User null mesmo após login"
**Causa:** Sessão ainda está carregando

**Solução:**
```
Aguarde alguns segundos
Recarregue a página (F5)
Verifique o console (F12) para erros
```

---

## 📊 Arquivos Criados/Modificados

### ✅ Criados (3 arquivos)
```
services/authService.ts                  (95 linhas)
GOOGLE_AUTH_SETUP.md                     (94 linhas)
GOOGLE_AUTH_QUICK_START.md               (177 linhas)
IMPLEMENTATION_SUMMARY.md                (Você está aqui)
```

### ✅ Modificados (3 arquivos)
```
App.tsx                                  (+50 linhas)
types.ts                                 (+8 linhas)
package.json                             (+2 dependências)
```

---

## 🚀 Após Configurar - Próximas Features

### Recomendado Fazer:
1. **Row Level Security (RLS)** - Isolar dados por usuário
2. **Perfil de Usuário** - Página com dados da conta
3. **Email/Senha** - Adicionar outro método de login
4. **Sincronização Real-time** - WebSocket para atualizar templates

### Código RLS Pronto:
```sql
-- 1. Adicionar coluna user_id
ALTER TABLE public.templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Criar policy
CREATE POLICY "Users can only access their templates"
ON public.templates
FOR ALL
USING (auth.uid() = user_id);

-- 3. Atualizar insert
-- Adicionar user_id ao salvar templates
```

---

## ✨ Resumo

| Etapa | Status | Tempo |
|-------|--------|-------|
| Implementação Backend | ✅ Completo | Feito |
| Implementação Frontend | ✅ Completo | Feito |
| Google Cloud Setup | ⏳ Você faz | 5 min |
| Supabase Setup | ⏳ Você faz | 3 min |
| Teste Funcional | ⏳ Depois | 2 min |
| **Total** | | **10 min** |

---

## 📞 Suporte

Se tiver dúvidas:

1. **Documentação do Supabase Auth:**
   https://supabase.com/docs/guides/auth/social-login

2. **Documentação do Google OAuth:**
   https://developers.google.com/identity/protocols/oauth2

3. **Código de Referência:**
   - `services/authService.ts` - Funções de auth
   - `App.tsx` linhas 187-210 - Implementação
   - `types.ts` - Tipos AppUser

---

**Próximo passo:** Configure o Google Cloud OAuth e volte aqui! 🚀

