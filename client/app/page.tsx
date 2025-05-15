import Image from "next/image";
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
        <h1 className="relative text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          📄 Chat with PDF 💬
        </h1>
        <p className="relative text-center text-slate-400 text-lg">
          Your AI-powered PDF companion
        </p>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start min-h-[70vh]">
          <div className="md:col-span-1 h-full">
            <div className="h-full flex flex-col">
              <FileUploadComponent />
            </div>
          </div>
          <div className="md:col-span-2 h-full">
            <div className="h-full flex flex-col">
              <ChatComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
