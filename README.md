# Chat with PDF

Chat with PDF is an AI-powered web application that allows users to upload PDF files and interact with them using natural language. Built with Next.js, Clerk authentication, OpenAI, and Qdrant for vector storage, this app provides a seamless experience for querying and chatting with your documents.

## Features

- Upload and manage PDF files
- Chat with your PDFs using AI
- User authentication with Clerk
- Dark mode and modern UI
- Download and delete PDFs

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (or npm/yarn)
- Redis and Qdrant running locally
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Ashish-gaba/Chat-with-PDF.git
   cd Chat-with-PDF
   ```
2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.
4. Start the development servers:
   ```bash
   # In one terminal (for the backend)
   cd server
   pnpm start
   # In another terminal (for the frontend)
   cd client
   pnpm dev
   ```

## Usage

- Sign up or log in with Clerk
- Upload a PDF file
- Start chatting with your document!

## Technologies Used

- Next.js
- React
- Clerk
- OpenAI
- Qdrant
- Tailwind CSS

## License

MIT
