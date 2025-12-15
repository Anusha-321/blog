'use client';

import Link from "next/link";
import { usePosts } from "@/context/PostsContext";
import {
    Home,
    PenSquare,
    User as UserIcon,
    Feather,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function MobileNav() {
    const { user, signOut } = usePosts();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsOpen(!isOpen);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="md:hidden">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <Feather className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                        Blogu<span className="text-blue-600">.</span>
                    </span>
                </Link>

                <button
                    onClick={toggleMenu}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-20 px-4 pb-6 flex flex-col animate-in slide-in-from-top-10 duration-200">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </Link>

                        <Link
                            href="/create"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/create')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <PenSquare className="w-5 h-5" />
                            <span>Write</span>
                        </Link>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        {user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
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
                                    onClick={() => {
                                        signOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
