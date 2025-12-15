'use client';

import Auth from '@/components/Auth';
import { usePosts } from '@/context/PostsContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { user, isLoading } = usePosts();
    const router = useRouter();

    useEffect(() => {
        if (user && !isLoading) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (user) {
        return null; // Will redirect
    }

    return <Auth />;
}
