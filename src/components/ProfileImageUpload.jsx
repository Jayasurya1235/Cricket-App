import { useRef, useState } from "react";
import { Camera, Image, Link, X } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

// Downscales an image on a canvas so the stored payload stays small.
// The backend stores `profile_image` as a string, so a compact data URL is
// the cleanest way to support real file uploads today.
function downscaleImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Could not process the image."));
    img.src = dataUrl;
  });
}

function ProfileImageUpload({ value, onChange, label = "Profile Image" }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleFile(file) {
    setError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setProcessing(true);
    try {
      const raw = await readFileAsDataUrl(file);
      let final = raw;
      try {
        final = await downscaleImage(raw);
      } catch {
        // keep the original data URL if resizing fails
      }
      onChange(final);
    } catch (err) {
      setError(err.message || "Could not upload the selected image.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleUrlInput(url) {
    setError("");
    onChange(url.trim());
  }

  function handleRemove() {
    setError("");
    onChange("");
  }

  return (
    <div>
      <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
        {label}
        <span className="normal-case font-normal"> (optional)</span>
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative w-20 h-20 rounded-full bg-cricket-dark border border-cricket-border overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={value}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image className="w-7 h-7 text-gray-400" />
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition"
            title="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              <Camera className="w-3.5 h-3.5" />
              {processing ? "Processing..." : "Upload Photo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 border border-red-200 hover:border-transparent text-red-600 hover:text-white rounded-lg text-xs font-bold transition"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cricket-card border border-cricket-border hover:border-emerald-300 rounded-lg text-xs font-semibold text-gray-600 transition"
            >
              <Link className="w-3.5 h-3.5" />
              {showUrl ? "Hide URL" : "Or paste URL"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            JPG, PNG or WebP up to {MAX_FILE_SIZE_MB} MB. Images are
            automatically resized.
          </p>
        </div>
      </div>

      {showUrl && (
        <div className="mt-3">
          <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
            Image URL
          </label>
          <input
            type="url"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => handleUrlInput(e.target.value)}
            placeholder="https://example.com/player-photo.jpg"
            className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default ProfileImageUpload;