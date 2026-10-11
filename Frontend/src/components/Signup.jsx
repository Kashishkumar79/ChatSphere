import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuUser, LuMail, LuLock, LuLoader } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthProvider";
import AuthShell from "./AuthShell";
import { Field } from "./Login";

export default function Signup() {
  const [, setAuthUser] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post("/api/user/signup", {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Account ban gaya! 🎉");
      setAuthUser(res.data);
    } catch (error) {
      toast.error(errorMessage(error, "Signup failed. Try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Sirf kuch seconds lagenge"
      footer={
        <>
          Already account hai? <Link to="/login" className="text-brand-400 font-semibold hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Full name" icon={LuUser} error={errors.fullname?.message}>
          <input className="input pl-10 !py-2 text-[13px]" placeholder="Rahul Sharma"
            {...register("fullname", { required: "Naam zaruri hai" })} />
        </Field>
        <Field label="Email" icon={LuMail} error={errors.email?.message}>
          <input type="email" className="input pl-10 !py-2 text-[13px]" placeholder="you@example.com"
            {...register("email", { required: "Email zaruri hai" })} />
        </Field>
        <Field label="Password" icon={LuLock} error={errors.password?.message}>
          <input type="password" className="input pl-10 !py-2 text-[13px]" placeholder="Min. 6 characters"
            {...register("password", { required: "Password zaruri hai", minLength: { value: 6, message: "Kam se kam 6 characters" } })} />
        </Field>
        <Field label="Confirm password" icon={LuLock} error={errors.confirmPassword?.message}>
          <input type="password" className="input pl-10 !py-2 text-[13px]" placeholder="Password dobara likho"
            {...register("confirmPassword", {
              required: "Confirm password zaruri hai",
              validate: (v) => v === password || "Passwords match nahi kar rahe",
            })} />
        </Field>
        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-1 !py-2.5">
          {isLoading && <LuLoader className="w-4 h-4 animate-spin" />}
          {isLoading ? "Creating..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
