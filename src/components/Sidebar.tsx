'use client';

import Link from "next/link";
import { usePosts } from "@/context/PostsContext";
import {
    Home,
    PenSquare,
    LogOut,
    LogIn,
    User as UserIcon,
    Feather,
    FileText,
    Bookmark
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user, signOut } = usePosts();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 hidden md:flex">
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300">
                        <Feather className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">
                        Blogu<span className="text-blue-600">.</span>
                    </span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                    Menu
                </div>

                <Link
                    href="/"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Home className={`w-5 h-5 ${isActive('/') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>Home</span>
                </Link>

                <Link
                    href="/create"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/create')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <PenSquare className={`w-5 h-5 ${isActive('/create') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>Write</span>
                </Link>

                {user && (
                    <>
                        <Link
                            href="/posts?filter=drafts"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/posts?filter=drafts')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <FileText className={`w-5 h-5 ${isActive('/posts?filter=drafts') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>Drafts</span>
                        </Link>

                        <Link
                            href="/posts?filter=saved"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/posts?filter=saved')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Bookmark className={`w-5 h-5 ${isActive('/posts?filter=saved') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>Saved</span>
                        </Link>
                    </>
                )}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-50">
                {user ? (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                {user.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-blue-600">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Join Blogu</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Sign in to write, like, and comment.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md text-center"
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
