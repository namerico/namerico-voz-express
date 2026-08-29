# 🎙️ VozExpress — Plataforma de Locução e Vinhetas com IA

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Google GenAI](https://img.shields.io/badge/Google_GenAI-Gemini-4285F4.svg?logo=google)](https://ai.google.dev/)

O **VozExpress** é uma plataforma moderna e inteligente para geração, personalização e produção de **locuções comerciais e vinhetas profissionais** para rádio, carro de som, redes sociais e podcasts, potencializada pelos modelos de Inteligência Artificial da **Google Gemini API**.

---

## 🚀 Funcionalidades

- 🎙️ **Geração de Roteiros e Locuções Inteligentes**: Criação automática de textos persuasivos e comerciais adaptados para cada segmento (comércios locais, serviços, eventos, promoções).
- 🔊 **Modos de Produção Personalizados**:
  - 🚗 **Carro de Som**: Locuções impactantes com ênfase fonética, presença e clareza para som de rua e propagandas volantes.
  - 📻 **Rádio Padrão AM/FM**: Estilo clássico de locução comercial com ritmo pausado e firme.
  - 📱 **Redes Sociais & Stories**: Áudios dinâmicos e de alta conversão para WhatsApp, Instagram e TikTok.
- ⚡ **Interface Fluida & Responsiva**: Desenvolvida com React 19, Tailwind CSS e animações suaves via Motion.
- 🎚️ **Controle de Parâmetros de Áudio**: Ajuste de entonação, velocidade, ritmo e trilhas sonoras de fundo.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Motion](https://motion.dev/)
- **IA / LLM**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK)

---

## 📦 Como Rodar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/namerico/namerico-voz-express.git
cd namerico-voz-express
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Chave de API
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
GEMINI_API_KEY=sua_chave_da_api_gemini_aqui
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador em: `http://localhost:3000`

---

## 📄 Licença

Projeto desenvolvido por **[Nélio Américo Nunes](https://github.com/namerico)**.  
Todos os direitos reservados.
