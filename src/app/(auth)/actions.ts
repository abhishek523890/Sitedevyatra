'use server';

import { createClient } from '@/lib/supabase/server';
import { authSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';
import { publicEnv } from '@/lib/env';

export interface AuthResult { error?: string }

/** Email/password sign in. */
export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'Enter a valid email and password (8+ chars).' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  redirect((formData.get('redirect') as string) || '/dashboard');
}

/** Register a new customer account. */
export async function signUp(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });
  if (!parsed.success) return { error: 'Please check your details (password 8+ chars).' };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  redirect('/login?registered=1');
}

/** Send a password reset email. */
export async function requestPasswordReset(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '');
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
  });
  if (error) return { error: error.message };
  redirect('/forgot-password?sent=1');
}
