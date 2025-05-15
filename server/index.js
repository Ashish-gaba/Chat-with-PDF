import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ status: "All Good!" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
      storedFilename: req.file.filename,
    })
  );
  return res.json({ message: "uploaded", storedFilename: req.file.filename });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath, filename);
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
    }
  );
  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);

  const SYSTEM_PROMPT = `
  You are helfull AI Assistant who answeres the user query based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;

  const chatResult = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });
});

app.delete("/delete/pdf/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    console.log("Attempting to delete file:", filePath);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      await fs.promises.unlink(filePath);
      console.log("Successfully deleted file:", filename);
      return res.json({ success: true, message: "File deleted successfully" });
    } else {
      console.log("File not found:", filename);
      return res.status(404).json({
        success: false,
        message: "File not found",
        path: filePath,
      });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting file",
      error: error.message,
      stack: error.stack,
    });
  }
});

app.listen(8000, () => console.log(`Server started on PORT:${8000}`));
