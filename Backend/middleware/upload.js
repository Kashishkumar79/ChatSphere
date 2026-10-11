import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // Random naam: original naam server par exposed nahi hota
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, crypto.randomBytes(16).toString("hex") + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error("Ye file type allowed nahi hai (PDF, Word, Excel, PPT, TXT, ZIP, ya image)"));
  },
});

// Upload errors ko JSON mein bhejo
export const uploadSingle = (field = "file") => (req, res, next) =>
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File 10MB se badi nahi honi chahiye" });
    }
    return res.status(400).json({ error: err.message });
  });

// Galat request par already upload hui file delete karo
export const discardFile = (file) => {
  if (!file) return;
  fs.unlink(file.path, () => {});
};

// Message document mein store hone wala attachment object
export const toAttachment = (file) =>
  file
    ? {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        storedName: file.filename,
      }
    : undefined;
