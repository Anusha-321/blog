'use client';

import { usePosts } from '@/context/PostsContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/app/types';

export default function PostDetail() {
    const params = useParams();
    const router = useRouter();
    const { getPost, deletePost } = usePosts();
    const [post, setPost] = useState<BlogPost | undefined>(undefined);

    useEffect(() => {
        if (params.id) {
            const foundPost = getPost(params.id as string);
            if (foundPost) {
                setPost(foundPost);
            }
        }
    }, [params.id, getPost]);

    if (!post) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
                <Link
                    href="/posts"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to all posts
                </Link>
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(post.id);
                router.push('/posts');
            } catch (error) {
                alert('Failed to delete post');
            }
        }
    };

    return (
        <main className="py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                    <Link
                        href="/posts"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to all posts
                    </Link>

                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between text-gray-500 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <time>{post.createdAt}</time>
                            </div>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Post
                            </button>
                        </div>
                    </header>

                    <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {post.body}
                    </div>
                </div>
            </article>
        </main>
    );
}
