import api from "./api";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPT_FILES = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*";

export const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Auth header ke saath file lo, phir browser mein save karwao
export const downloadAttachment = async (messageId, fileName) => {
  const res = await api.get(`/api/file/${messageId}`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
