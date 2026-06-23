import { useState } from "react";
import { uploadFile, storageUrl } from "@/lib/api";
import { Upload, Copy, Check, FolderOpen } from "lucide-react";
import { BucketFilePicker } from "../components/BucketFilePicker";

interface Uploaded {
  name: string;
  path: string;
  type: string;
}

export default function MediaTab() {
  const [uploads, setUploads] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadFile(file);
        setUploads((prev) => [{ name: file.name, path, type: file.type }, ...prev]);
      }
    } catch (e) {
      alert("Upload failed: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function handleBucketSelect(objectPath: string) {
    const name = objectPath.split("/").pop() || objectPath;
    setUploads((prev) => [{ name, path: objectPath, type: guessType(name) }, ...prev]);
  }

  function guessType(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image/";
    if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return "audio/";
    if (["mp4", "webm", "mov", "avi"].includes(ext)) return "video/";
    return "application/octet-stream";
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Media Library</h2>
        <p className="text-white/40 text-sm">Upload files or pick existing ones from your bucket. Copy the path to use it in other sections.</p>
      </div>

      <div className="space-y-3">
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
            uploading
              ? "border-purple-500/50 bg-purple-500/5"
              : "border-white/10 hover:border-purple-500/50 hover:bg-white/5"
          }`}
        >
          <Upload size={32} className="text-white/30 mb-3" />
          <p className="text-white/60 text-sm font-medium">
            {uploading ? "Uploading..." : "Click or drag files to upload"}
          </p>
          <p className="text-white/30 text-xs mt-1">Images, audio, video — any file type</p>
          <input
            type="file"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 border border-white/10 rounded-xl py-3.5 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all text-sm font-medium"
        >
          <FolderOpen size={16} />
          Pick from bucket
        </button>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white/60 text-sm font-medium">Files this session</h3>
          {uploads.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3"
            >
              {u.type.startsWith("image/") && (
                <img
                  src={storageUrl(u.path)}
                  alt={u.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              {u.type.startsWith("audio/") && (
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 text-xl">♪</span>
                </div>
              )}
              {u.type.startsWith("video/") && (
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xl">▶</span>
                </div>
              )}
              {!u.type.startsWith("image/") && !u.type.startsWith("audio/") && !u.type.startsWith("video/") && (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white/40 text-xl">📄</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.name}</p>
                <p className="text-white/30 text-xs truncate font-mono">{u.path}</p>
              </div>
              <button
                onClick={() => copyPath(u.path)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === u.path ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied === u.path ? "Copied!" : "Copy path"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showPicker && (
        <BucketFilePicker
          onSelect={handleBucketSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
