"use client";
import * as React from "react";
import {
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface UploadedPDF {
  name: string;
  storedFilename: string;
  timestamp: string;
  status: "success" | "error";
}

const FileUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedPDFs, setUploadedPDFs] = React.useState<UploadedPDF[]>([]);
  const [uploadStatus, setUploadStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const response = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setUploadStatus({
          success: true,
          message: "PDF uploaded successfully! You can now chat with it.",
        });
        setUploadedPDFs((prev) => [
          ...prev,
          {
            name: file.name,
            storedFilename: data.storedFilename,
            timestamp: new Date().toLocaleString(),
            status: "success",
          },
        ]);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: "Failed to upload PDF. Please try again.",
      });
      setUploadedPDFs((prev) => [
        ...prev,
        {
          name: file.name,
          storedFilename: "",
          timestamp: new Date().toLocaleString(),
          status: "error",
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploadButtonClick = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          await handleFile(file);
        }
      }
    });
    el.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        handleFile(file);
      } else {
        setUploadStatus({
          success: false,
          message: "Please upload a valid PDF file.",
        });
      }
    }
  };

  const handleDelete = async (index: number, storedFilename: string) => {
    try {
      setDeleteError(null);
      console.log("Attempting to delete file:", storedFilename);

      // Delete from backend
      const response = await fetch(
        `http://localhost:8000/delete/pdf/${encodeURIComponent(
          storedFilename
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete file from server");
      }

      // Delete from frontend state
      setUploadedPDFs((prev) => prev.filter((_, i) => i !== index));
      console.log("Successfully deleted file from frontend state");
    } catch (error) {
      console.error("Error deleting file:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete file"
      );
      // Remove error message after 3 seconds
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  React.useEffect(() => {
    localStorage.setItem("uploadedPDFs", JSON.stringify(uploadedPDFs));
  }, [uploadedPDFs]);

  React.useEffect(() => {
    // On mount, load PDFs from localStorage if available
    const stored = localStorage.getItem("uploadedPDFs");
    if (stored) {
      setUploadedPDFs(JSON.parse(stored));
    }
  }, []);

  return (
    <Card className="w-full max-w-md bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload PDF Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-950/40"
              : "border-slate-700 bg-slate-800/50"
          }`}
          onClick={handleFileUploadButtonClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-400 text-center mb-4">
            Drag and drop your PDF here, or click to browse
          </p>
          <Button
            onClick={handleFileUploadButtonClick}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white"
            variant="outline"
            type="button"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Choose PDF
              </>
            )}
          </Button>
        </div>

        {uploadStatus && (
          <div
            className={`p-3 rounded-md w-full flex items-center gap-2 ${
              uploadStatus.success
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {uploadStatus.success ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-red-400">⚠️</span>
            )}
            <p>{uploadStatus.message}</p>
          </div>
        )}

        {deleteError && (
          <div className="p-3 rounded-md w-full flex items-center gap-2 bg-red-500/20 text-red-400">
            <span className="text-red-400">⚠️</span>
            <p>{deleteError}</p>
          </div>
        )}

        {uploadedPDFs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Uploaded PDFs
            </h4>
            <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2">
              <ScrollArea className="h-[200px] rounded-md">
                <div className="space-y-3">
                  {uploadedPDFs.map((pdf, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md bg-slate-900 border border-slate-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-base text-white font-semibold truncate max-w-[160px]">
                            {pdf.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {pdf.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[80px]">
                        <Badge
                          variant={
                            pdf.status === "success" ? "success" : "destructive"
                          }
                          className="px-2 py-1 text-xs"
                        >
                          {pdf.status === "success" ? "Uploaded" : "Failed"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-950/50"
                          onClick={() =>
                            handleDelete(index, pdf.storedFilename)
                          }
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadComponent;
