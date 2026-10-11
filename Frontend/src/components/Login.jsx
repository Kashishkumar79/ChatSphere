import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuMail, LuLock, LuLoader } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthProvider";
import AuthShell from "./AuthShell";

export default function Login() {
  const [, setAuthUser] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post("/api/user/login", { email: data.email, password: data.password });
      toast.success("Welcome back! 👋");
      setAuthUser(res.data);
    } catch (error) {
      toast.error(errorMessage(error, "Login failed. Try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Apne account mein login karo"
      footer={
        <>
          Naye ho? <Link to="/signup" className="text-brand-400 font-semibold hover:underline">Account banao</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Email" icon={LuMail} error={errors.email?.message}>
          <input type="email" className="input pl-10 !py-2 text-[13px]" placeholder="you@example.com"
            {...register("email", { required: "Email zaruri hai" })} />
        </Field>
        <Field label="Password" icon={LuLock} error={errors.password?.message}>
          <input type="password" className="input pl-10 !py-2 text-[13px]" placeholder="••••••••"
            {...register("password", { required: "Password zaruri hai" })} />
        </Field>
        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-1 !py-2.5">
          {isLoading && <LuLoader className="w-4 h-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-muted mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        {children}
      </div>
      {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
