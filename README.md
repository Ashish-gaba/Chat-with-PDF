
# 📄 Chat with PDF – Your AI Document Companion 🤖

**Chat with PDF** is an AI-powered web app that lets you upload PDFs and interact with them using natural language. Built with ⚡️ Next.js, 🧑‍💼 Clerk authentication, 💡 OpenAI, and 🧠 Qdrant vector storage — this app delivers a smooth and modern experience for querying and understanding your documents!

---

## ✨ Features

✅ Upload and manage your PDF files  
💬 Chat with your PDFs using AI  
🔐 User authentication with Clerk  
🌙 Dark mode & sleek modern UI  
⬇️ Download & ❌ delete PDFs easily

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following:

- 🟢 Node.js (v18+ recommended)
- 📦 pnpm / npm / yarn
- 🔁 Redis & Qdrant (running locally)
- 🔑 OpenAI API Key

---

### 🛠 Installation

1. **Clone the repo**  
   ```bash
   git clone git@github.com:Ashish-gaba/Chat-with-PDF.git
   cd Chat-with-PDF
   ```

2. **Install dependencies**  
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**  
   - Copy `.env.example` to `.env`
   - Fill in the required values (OpenAI, Clerk, Qdrant, etc.)

4. **Start development servers**

   In one terminal (for backend):
   ```bash
   cd server
   pnpm start
   ```

   In another terminal (for frontend):
   ```bash
   cd client
   pnpm dev
   ```

---

## 🧑‍💻 Usage

1. ✍️ Sign up / Log in with Clerk  
2. 📤 Upload a PDF  
3. 🤖 Start chatting with your document!

---

## 🧰 Tech Stack

- ⚡️ [Next.js](https://nextjs.org)
- ⚛️ [React](https://reactjs.org)
- 🧑‍💼 [Clerk](https://clerk.dev)
- 💡 [OpenAI](https://openai.com)
- 🧠 [Qdrant](https://qdrant.tech)
- 🎨 [Tailwind CSS](https://tailwindcss.com)

---

## 📄 License

MIT © [Ashish Gaba](https://github.com/Ashish-gaba)
