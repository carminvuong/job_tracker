"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, createAuthCookieValue } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0 || password !== process.env.APP_PASSWORD) {
    return { error: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createAuthCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
