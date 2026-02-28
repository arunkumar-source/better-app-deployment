"use client";

import type { User } from "@repo/shared";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginUser } from "@/lib/auth-api";

export default function LoginPage() {
  const form = useForm<User>();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const _res = await loginUser(data.email, data.password);

      router.push("/AddWorkKanban");

      form.reset();
    } catch (_error) {
      return form.setError("root", { message: "Invalid email or password" });
    }
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-100 rounded-xl bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center font-bold text-2xl">Login</h2>

        {form.formState.errors.root && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <p className="text-red-500 text-sm">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* EMAIL */}
          <div>
            <label className="mb-1 block font-medium text-sm" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...form.register("email", { required: "Email is required" })}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="example@email.com"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label
              className="mb-1 block font-medium text-sm"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password", {
                  required: "Password is required",
                })}
                className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter password"
              />
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            className="w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </button>
          <div>
            Don't have an account?{" "}
            <a className="text-blue-500 hover:underline" href="/register">
              {" "}
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
