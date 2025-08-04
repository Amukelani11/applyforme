import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

export default function UploadCV({ onFileChange }: { onFileChange: (file: File | null) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      onFileChange(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`transition-all duration-200 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer relative w-full max-w-md mx-auto bg-white shadow-sm ${
        dragActive ? "border-[#c084fc] bg-purple-50" : "border-[#c084fc]/40 hover:border-[#c084fc]"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      tabIndex={0}
      role="button"
      aria-label="Upload CV"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleChange}
        tabIndex={-1}
      />
      <UploadCloud className="w-10 h-10 text-[#c084fc] mb-2 animate-in fade-in" />
      <p className="text-gray-700 font-medium mb-1">Drag & drop your CV here, or <span className="text-[#c084fc] underline">choose file</span></p>
      <p className="text-xs text-gray-500 mb-2">PDF, DOC, or DOCX (max 5MB)</p>
      {file && (
        <div className="flex items-center mt-2 bg-purple-50 rounded px-3 py-1 text-sm text-purple-700 animate-in fade-in">
          <FileText className="w-4 h-4 mr-2" />
          <span className="truncate max-w-[120px]">{file.name}</span>
          <button type="button" className="ml-2 text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); handleRemove(); }} aria-label="Remove file">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
} 