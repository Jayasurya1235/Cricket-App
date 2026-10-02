import { useId, useRef, useState } from "react";
import { Camera, Image, Link, X } from "lucide-react";
import { Button, Input } from "./ui";

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

  // The URL field keeps its own draft so the parent form is only mutated on
  // blur/Enter, rather than on every keystroke.
  const remoteUrl = value && !value.startsWith("data:") ? value : "";
  const [urlDraft, setUrlDraft] = useState(remoteUrl);
  const [syncedRemote, setSyncedRemote] = useState(remoteUrl);

  // Reset the draft while rendering when the stored value changes from outside
  // the field (uploading a photo, removing the image, loading a saved record).
  if (remoteUrl !== syncedRemote) {
    setSyncedRemote(remoteUrl);
    setUrlDraft(remoteUrl);
  }

  const fileInputId = useId();
  const urlInputId = useId();

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

  function commitUrl() {
    const next = urlDraft.trim();
    if (next === remoteUrl) return;
    setError("");
    onChange(next);
  }

  function handleRemove() {
    setError("");
    setUrlDraft("");
    onChange("");
  }

  return (
    <div>
      <label
        htmlFor={fileInputId}
        className="mb-1.5 block text-[13px] font-semibold text-ink"
      >
        {label}
        <span className="font-normal text-ink-subtle"> (optional)</span>
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-muted">
          {value ? (
            <img
              src={value}
              alt="Profile preview"
              className="size-full object-cover"
            />
          ) : (
            <Image className="size-7 text-ink-faint" aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            aria-label={`${processing ? "Processing" : "Upload"} profile photo`}
            title="Upload photo"
            className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-brand-600 text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Camera className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <input
            ref={inputRef}
            id={fileInputId}
            name="profile_image_file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="subtle"
              size="sm"
              loading={processing}
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="size-3.5" aria-hidden="true" />
              {processing ? "Processing…" : "Upload Photo"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="dangerGhost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="size-3.5" aria-hidden="true" />
                Remove
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-expanded={showUrl}
              onClick={() => setShowUrl((v) => !v)}
            >
              <Link className="size-3.5" aria-hidden="true" />
              {showUrl ? "Hide URL" : "Or paste URL"}
            </Button>
          </div>
          <p className="text-[11px] text-ink-faint">
            JPG, PNG or WebP up to {MAX_FILE_SIZE_MB} MB. Images are
            automatically resized.
          </p>
        </div>
      </div>

      {showUrl && (
        <div className="mt-3">
          <label
            htmlFor={urlInputId}
            className="mb-1.5 block text-[13px] font-semibold text-ink"
          >
            Image URL
          </label>
          <Input
            id={urlInputId}
            name="profile_image_url"
            type="url"
            autoComplete="off"
            placeholder="https://example.com/player-photo.jpg"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={commitUrl}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitUrl();
              }
            }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default ProfileImageUpload;