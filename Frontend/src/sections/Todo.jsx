import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2, LuCheck, LuCalendar, LuListTodo } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";

export const PRIORITY = {
  high: { label: "High", cls: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
  medium: { label: "Medium", cls: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
  low: { label: "Low", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const dueInfo = (todo) => {
  if (!todo.dueDate) return null;
  const due = new Date(todo.dueDate);
  const label = due.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (todo.done) return { label, cls: "text-dim" };
  if (due < startOfToday()) return { label: `Overdue · ${label}`, cls: "text-rose-400" };
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  if (dueDay.getTime() === startOfToday().getTime()) return { label: "Aaj", cls: "text-amber-300" };
  return { label, cls: "text-muted" };
};

// Tasks: personal todo list
export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("active");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/api/todo");
      setTodos(res.data);
    } catch (err) {
      toast.error(errorMessage(err, "Tasks load nahi ho paaye"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const done = todos.filter((t) => t.done).length;
    return { total: todos.length, done, open: todos.length - done, pct: todos.length ? Math.round((done / todos.length) * 100) : 0 };
  }, [todos]);

  const visible = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Task ka title likho");
    setSaving(true);
    try {
      const res = await api.post("/api/todo", { title: title.trim(), priority, dueDate: dueDate || null });
      setTodos((prev) => [res.data, ...prev]);
      setTitle("");
      setDueDate("");
      setPriority("medium");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Optimistic update: pehle UI badlo, fail ho to reload karo
  const patch = async (id, body) => {
    setTodos((prev) => prev.map((t) => (t._id === id ? { ...t, ...body } : t)));
    try {
      const res = await api.patch(`/api/todo/${id}`, body);
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      toast.error(errorMessage(err));
      load();
    }
  };

  const removeTodo = async (id) => {
    try {
      await api.delete(`/api/todo/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const clearDone = async () => {
    if (!stats.done) return;
    try {
      const res = await api.delete("/api/todo/completed");
      toast.success(`${res.data.deleted} completed task hata diye`);
      setTodos((prev) => prev.filter((t) => !t.done));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-5 sm:p-8 space-y-6 animate-fade">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-sm text-muted mt-1">Apne kaam track karo, deadlines ke saath.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold gradient-text">{stats.pct}%</p>
            <p className="text-xs text-muted">{stats.done} of {stats.total} done</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 rounded-full bg-surface2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-accent transition-all duration-500" style={{ width: `${stats.pct}%` }} />
        </div>

        {/* Add form */}
        <form onSubmit={addTodo} className="card !p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Naya task likho... (jaise: Assignment submit karna)"
              className="input flex-1"
              maxLength={200}
            />
            <button type="submit" disabled={saving} className="btn-primary sm:w-auto">
              <LuPlus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 p-1 rounded-xl bg-surface2">
              {Object.entries(PRIORITY).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    priority === key ? `${p.cls} border` : "text-muted hover:text-ink border border-transparent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <LuCalendar className="w-4 h-4 text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input !w-auto pl-9 py-2 text-xs"
              />
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 p-1 rounded-xl bg-surface border border-line">
            {[
              { id: "active", label: `Baaki (${stats.open})` },
              { id: "done", label: `Done (${stats.done})` },
              { id: "all", label: `Sab (${stats.total})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === f.id ? "bg-brand-600 text-white" : "text-muted hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {stats.done > 0 && (
            <button onClick={clearDone} className="btn-ghost !py-1.5 text-xs">
              <LuTrash2 className="w-3.5 h-3.5" /> Done clear karo
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <Loading text="Tasks load ho rahe hain..." />
        ) : visible.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={LuListTodo}
              title={filter === "done" ? "Abhi koi task done nahi hua" : "Sab kaam khatam! 🎉"}
              text={filter === "active" && todos.length === 0 ? "Upar se pehla task add karo." : undefined}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((t) => {
              const due = dueInfo(t);
              const pr = PRIORITY[t.priority] || PRIORITY.medium;
              return (
                <div
                  key={t._id}
                  className={`group flex items-center gap-3 p-3.5 rounded-xl border bg-surface transition hover:border-brand-500/30 ${
                    t.done ? "border-line opacity-70" : "border-line"
                  }`}
                >
                  <button
                    onClick={() => patch(t._id, { done: !t.done })}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${
                      t.done ? "bg-emerald-500 border-emerald-500" : "border-dim hover:border-brand-400"
                    }`}
                    aria-label="Toggle done"
                  >
                    {t.done && <LuCheck className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.done ? "line-through text-muted" : ""}`}>{t.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {due && <span className={`text-[11px] font-medium ${due.cls}`}>{due.label}</span>}
                    </div>
                  </div>

                  <select
                    value={t.priority}
                    onChange={(e) => patch(t._id, { priority: e.target.value })}
                    className={`chip ${pr.cls} bg-transparent cursor-pointer outline-none`}
                    aria-label="Priority"
                  >
                    {Object.entries(PRIORITY).map(([k, v]) => (
                      <option key={k} value={k} className="bg-surface text-ink">{v.label}</option>
                    ))}
                  </select>

                  <button onClick={() => removeTodo(t._id)} className="icon-btn text-muted hover:text-rose-400" title="Delete">
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
