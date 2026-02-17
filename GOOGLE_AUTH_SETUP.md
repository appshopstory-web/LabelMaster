# 🔐 Configuração de Autenticação Google no Supabase

## Pré-requisitos
- Conta no [Google Cloud Console](https://console.cloud.google.com/)
- Projeto Supabase criado (já existe em `xhgwxesktuuzfogzojmc`)

## Passo 1: Criar Credenciais OAuth no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** → **Credentials**
4. Clique em **+ Create Credentials** → **OAuth client ID**
5. Escolha **Web application**
6. Adicione as URIs autorizadas:
   - `http://localhost:3000` (desenvolvimento local)
   - `https://localhost:3000` (desenvolvimento local HTTPS)
   - `https://xhgwxesktuuzfogzojmc.supabase.co/auth/v1/callback` (produção)
7. Copie o **Client ID** e **Client Secret**

## Passo 2: Configurar Google OAuth no Supabase

1. Acesse o [Dashboard Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto `LabelMaster-Pro`
3. Vá para **Authentication** → **Providers**
4. Clique em **Google**
5. Habilite o provider (toggle para ON)
6. Cole o **Client ID** do Google Cloud
7. Cole o **Client Secret** do Google Cloud
8. Clique em **Save**

## Passo 3: Configurar Redirect URLs

1. No dashboard Supabase, vá para **Authentication** → **URL Configuration**
2. Certifique-se de que as seguintes URLs estão adicionadas em **Redirect URLs**:
   - `http://localhost:3000/` (desenvolvimento)
   - `https://seudominio.com/` (sua URL de produção)

## Passo 4: Testar a Autenticação

1. Execute o servidor local:
   ```bash
   npm run dev
   ```

2. Abra `http://localhost:3000`

3. Clique no botão **"CONECTAR COM GOOGLE"**

4. Você será redirecionado para o login do Google

5. Após fazer login, você será redirecionado de volta para o app

## Verificação

Se tudo estiver funcionando:
- ✅ Você verá seu nome e foto do Google no app
- ✅ Suas templates serão sincronizadas com o Supabase
- ✅ O status mostrará "Cloud OK" no rodapé

## Troubleshooting

### Erro: "Invalid redirect_uri"
- Verifique se a URI está exatamente como configurado no Google Cloud Console
- Certifique-se de incluir o trailing slash `/`

### Erro: "client_id or client_secret invalid"
- Verifique se copiou corretamente os valores
- Regenere as credenciais se necessário

### Erro: "CORS error"
- Verifique se a URL está configurada corretamente no Supabase
- Aguarde alguns minutos para a configuração se propagar

## Estrutura de Autenticação

```
App.tsx
├── handleGoogleLogin()
│   └── signInWithGoogle() [authService.ts]
│       └── supabase.auth.signInWithOAuth()
├── handleLogout()
│   └── signOut() [authService.ts]
│       └── supabase.auth.signOut()
└── useEffect() - Monitora mudanças de autenticação
    └── onAuthStateChange() [authService.ts]
```

## Arquivos Modificados

- **services/authService.ts** - Novo (funções de autenticação)
- **types.ts** - Adicionado tipo `AppUser`
- **App.tsx** - Integração de Google OAuth (substituiu GitHub mock)
- **package.json** - Adicionado `@supabase/auth-ui-react` e `@supabase/auth-ui-shared`

## Próximos Passos (Opcionais)

- [ ] Implementar Row Level Security (RLS) para isolar dados por usuário
- [ ] Adicionar autenticação com GitHub adicional
- [ ] Implementar perfil de usuário customizável
- [ ] Adicionar logout automático após inatividade
