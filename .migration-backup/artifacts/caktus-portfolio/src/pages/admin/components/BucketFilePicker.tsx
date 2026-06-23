import { useState, useEffect, useRef } from "react";
import { storageUrl } from "@/lib/api";
import { FolderOpen, Search, X, Music, Video, FileText, Image, Check } from "lucide-react";

interface BucketItem {
  objectPath: string;
  name: string;
  size: number;
  contentType: string;
  updatedAt: string;
}

interface Props {
  accept?: string;
  onSelect: (objectPath: string) => void;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith("image/")) return <Image size={20} className="text-purple-400" />;
  if (contentType.startsWith("audio/")) return <Music size={20} className="text-green-400" />;
  if (contentType.startsWith("video/")) return <Video size={20} className="text-blue-400" />;
  return <FileText size={20} className="text-white/40" />;
}

function matchesAccept(contentType: string, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((a) => {
    const t = a.trim();
    if (t.endsWith("/*")) return contentType.startsWith(t.slice(0, -1));
    return contentType === t || contentType.startsWith(t);
  });
}

export function BucketFilePicker({ accept, onSelect, onClose }: Props) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/storage/bucket/list", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bucket files");
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(search.toLowerCase());
    const typeMatch = matchesAccept(item.contentType, accept);
    return nameMatch && typeMatch;
  });

  function handleConfirm() {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold text-sm">Pick from Bucket</h2>
            {!loading && (
              <span className="text-white/30 text-xs">({filtered.length} file{filtered.length !== 1 ? "s" : ""})</span>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <Search size={14} className="text-white/30 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/30 text-sm">Loading bucket files…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-40">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <FolderOpen size={32} className="text-white/20" />
              <p className="text-white/40 text-sm">
                {items.length === 0 ? "No files in bucket yet" : "No files match your search"}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-1.5">
              {filtered.map((item) => {
                const isSelected = selected === item.objectPath;
                const isImage = item.contentType.startsWith("image/");
                return (
                  <button
                    key={item.objectPath}
                    onClick={() => setSelected(isSelected ? null : item.objectPath)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-purple-500/60 bg-purple-500/10"
                        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={storageUrl(item.objectPath)}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white/5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <FileIcon contentType={item.contentType} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name || item.objectPath}</p>
                      <p className="text-white/30 text-xs font-mono truncate">{item.objectPath}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-white/30 text-xs">{formatSize(item.size)}</span>
                      {isSelected && <Check size={14} className="text-purple-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            <Check size={14} />
            Use selected file
          </button>
        </div>
      </div>
    </div>
  );
}
