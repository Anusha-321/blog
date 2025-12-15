'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowLeft, Feather } from 'lucide-react';
import Link from 'next/link';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email to confirm your account!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                // Context will update automatically via onAuthStateChange
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300">
                            <Feather className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-2xl text-gray-900 tracking-tight">
                            Blogu<span className="text-blue-600">.</span>
                        </span>
                    </Link>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                        {isSignUp ? 'Create an account' : 'Welcome back'}
                    </h2>
                    <p className="text-gray-500">
                        {isSignUp ? 'Start sharing your stories today' : 'Sign in to continue writing'}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'error'
                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                    : 'bg-green-50 text-green-700 border border-green-100'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-2 font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                                </>
                            ) : (
                                <>{isSignUp ? 'Create account' : 'Sign in'}</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage(null);
                            }}
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
