# Licella - Calculadora de Custos para Doces

Uma aplicação web simples e intuitiva para calcular o custo de produção de doces, trufas, alfajores e outros produtos artesanais.

## 🍰 Funcionalidades

- **Cadastro de Insumos**: Registre ingredientes com peso, quantidade e valor pago
- **Controle de Estoque**: Acompanhe quanto resta de cada insumo
- **Cálculo de Produção**: Calcule automaticamente o custo por unidade dos produtos
- **Histórico Completo**: Mantenha um registro de todas as produções
- **Interface Responsiva**: Funciona perfeitamente em celulares e tablets
- **Persistência Local**: Todos os dados são salvos no navegador (sem necessidade de login)

## 🚀 Como Usar

### 1. Cadastrar Insumos
- Vá para a aba "📦 Insumos"
- Preencha: nome, unidade de medida, quantidade total e valor pago
- Clique em "Adicionar Insumo"

### 2. Calcular Produção
- Vá para a aba "🍰 Produção"
- Digite o nome do produto (ex: "Trufas de Chocolate")
- Informe a quantidade usada de cada insumo
- Digite quantas unidades foram produzidas
- Clique em "Calcular Custos"

### 3. Ver Histórico
- Vá para a aba "📊 Histórico"
- Visualize todas as produções anteriores
- Clique em "Ver detalhes" para informações completas

## 🌐 Deploy no Vercel

### Opção 1: Deploy Direto (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub, GitLab ou email
3. Clique em "New Project"
4. Faça upload dos arquivos do projeto
5. Clique em "Deploy"

### Opção 2: Via GitHub
1. Crie um repositório no GitHub
2. Faça upload dos arquivos:
   - `index.html`
   - `style.css`
   - `script.js`
   - Pasta `assets/` (com logo.png e favicon.png)
3. No Vercel, conecte o repositório
4. Deploy automático será feito

## 📱 Responsividade

A aplicação foi desenvolvida com design mobile-first e funciona perfeitamente em:
- 📱 Celulares (iOS e Android)
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🎨 Design

- Interface moderna e intuitiva
- Cores vibrantes e amigáveis
- Emojis para facilitar a navegação
- Animações suaves
- Feedback visual para todas as ações

## 💾 Armazenamento

Todos os dados são armazenados localmente no navegador usando `localStorage`. Isso significa:
- ✅ Não precisa de login
- ✅ Dados não são perdidos ao fechar o navegador
- ✅ Funciona offline
- ⚠️ Dados são específicos de cada navegador/dispositivo

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos personalizados e animações
- **Tailwind CSS**: Framework CSS para design responsivo
- **JavaScript**: Lógica da aplicação (ES6+)
- **LocalStorage**: Persistência de dados

## 📋 Estrutura do Projeto

```
licella/
├── index.html          # Página principal
├── style.css           # Estilos personalizados
├── script.js           # Lógica da aplicação
├── assets/
│   ├── logo.png        # Logo da Licella
│   └── favicon.png     # Ícone do site
└── README.md           # Este arquivo
```

## 🎯 Casos de Uso

Perfeito para:
- 🍫 Produtores de trufas e chocolates
- 🧁 Confeiteiros artesanais
- 🍪 Makers de biscoitos e doces
- 👩‍🎓 Estudantes vendendo na escola
- 🏠 Negócios caseiros

## 📞 Suporte

Para dúvidas ou sugestões sobre a aplicação, entre em contato através dos canais de suporte da Licella.

---

**Licella** - Tornando o cálculo de custos simples e eficiente! 🍰✨ 