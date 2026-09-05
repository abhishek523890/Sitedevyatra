'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { signIn, type AuthResult } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending} type="submit">
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthResult, FormData>(signIn, {});
  const params = useSearchParams();
  const registered = params.get('registered');
  const redirectTo = params.get('redirect') ?? '/dashboard';

  return (
    <div>
      <h1 className="text-2xl text-maroon-900">Welcome back</h1>
      <p className="mt-1 text-sm text-maroon-500">Sign in to manage your bookings.</p>

      {registered && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          Account created! Please check your email to verify, then sign in.
        </p>
      )}
      {state.error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        <SubmitButton />
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-saffron-700 hover:underline">Forgot password?</Link>
        <Link href="/register" className="text-saffron-700 hover:underline">Create account</Link>
      </div>
    </div>
  );
}
