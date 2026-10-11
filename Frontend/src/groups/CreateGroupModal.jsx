import React, { useState } from "react";
import toast from "react-hot-toast";
import { LuLoader } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import Modal from "../components/Modal";

export default function CreateGroupModal({ open, onClose }) {
  const bump = useAppStore((s) => s.bump);
  const setActive = useAppStore((s) => s.setActive);
  const setSection = useAppStore((s) => s.setSection);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Group ka naam likho");
    setSaving(true);
    try {
      const res = await api.post("/api/group", { name: name.trim(), description: description.trim() });
      const g = res.data;
      toast.success(`"${g.name}" ban gaya! Aap iske admin ho 👑`);
      bump("groups");
      setActive({ type: "group", id: String(g._id), title: g.name, group: g });
      setSection("groups");
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, "Group nahi bana"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Naya group banao" onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">Group ka naam *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Jaise: Weekend Plans"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Group ka chhota sa introduction"
            className="input resize-none"
          />
        </div>
        <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-3.5 py-2.5 text-xs text-muted leading-relaxed">
          Group banane wale aap <span className="text-accent font-semibold">Admin</span> honge. Doosre log join request bhejenge, jinhe aap approve ya reject kar sakte ho.
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <LuLoader className="w-4 h-4 animate-spin" />}
            Group banao
          </button>
        </div>
      </form>
    </Modal>
  );
}
