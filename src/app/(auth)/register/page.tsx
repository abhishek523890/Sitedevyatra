'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signUp, type AuthResult } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending} type="submit">{pending ? 'Creating…' : 'Create Account'}</button>;
}

export default function RegisterPage() {
  const [state, formAction] = useFormState<AuthResult, FormData>(signUp, {});
  return (
    <div>
      <h1 className="text-2xl text-maroon-900">Create your account</h1>
      <p className="mt-1 text-sm text-maroon-500">Book faster and track your yatra.</p>
      {state.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <form action={formAction} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required className="input" autoComplete="name" /></div>
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" /></div>
        <div><label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
          <p className="mt-1 text-xs text-maroon-400">Minimum 8 characters.</p></div>
        <SubmitButton />
      </form>
      <p className="mt-4 text-center text-sm text-maroon-500">
        Already have an account? <Link href="/login" className="text-saffron-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
