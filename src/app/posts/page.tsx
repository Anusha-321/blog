'use client';

import { usePosts } from '@/context/PostsContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Bookmark, ArrowLeft, Plus } from 'lucide-react';
import { useEffect } from 'react';

export default function PostsPage() {
    const { posts, user, getBookmarkedPosts } = usePosts();
    const searchParams = useSearchParams();
    const router = useRouter();
    const filter = searchParams.get('filter');

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    const filteredPosts = filter === 'drafts'
        ? posts.filter(p => p.isDraft && p.userId === user.id)
        : filter === 'saved'
            ? getBookmarkedPosts()
            : posts.filter(p => !p.isDraft);

    const title = filter === 'drafts' ? 'My Drafts' : filter === 'saved' ? 'Saved Posts' : 'All Posts';
    const icon = filter === 'drafts'
        ? <FileText className="w-8 h-8 text-blue-600" />
        : filter === 'saved'
            ? <Bookmark className="w-8 h-8 text-green-600" />
            : null;
    const emptyMessage = filter === 'drafts'
        ? 'No drafts yet. Start writing to save drafts!'
        : filter === 'saved'
            ? 'No saved posts yet. Bookmark posts to see them here!'
            : 'No posts yet.';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            {icon}
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        </div>

                        {filter === 'drafts' && (
                            <Link
                                href="/create"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Draft
                            </Link>
                        )}
                    </div>

                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-16">
                            {icon && <div className="mb-4">{icon}</div>}
                            <p className="text-gray-500 mb-4">{emptyMessage}</p>
                            {filter === 'drafts' && (
                                <Link
                                    href="/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Your First Draft
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={filter === 'drafts' ? `/edit/${post.id}` : `/post/${post.id}`}
                                    className="block p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                        {post.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{post.createdAt}</span>
                                        {filter === 'drafts' && (
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">Draft</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
