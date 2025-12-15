'use client';

import { usePosts } from '@/context/PostsContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/app/types';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentSection from '@/components/CommentSection';
import ShareButton from '@/components/ShareButton';

export default function PostDetail() {
    const params = useParams();
    const router = useRouter();
    const { getPost, deletePost, user, incrementViewCount } = usePosts();
    const [post, setPost] = useState<BlogPost | undefined>(undefined);

    useEffect(() => {
        if (params.id) {
            const foundPost = getPost(params.id as string);
            if (foundPost) {
                setPost(foundPost);
                // Increment view count
                incrementViewCount(params.id as string);
            }
        }
    }, [params.id, getPost]);

    if (!post) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h2>
                <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this story?')) {
            try {
                await deletePost(post.id);
                router.push('/');
            } catch (error) {
                alert('Failed to delete story');
            }
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                {/* Category Badge */}
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded mb-6">
                    Technology
                </span>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Author Info & Actions */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">
                            {user?.email?.[0].toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{user?.email?.split('@')[0] || 'Author'}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{post.createdAt}</span>
                                {post.viewCount !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {post.viewCount} views
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Edit/Delete for authenticated users who own the post */}
                    {user && (
                        <div className="flex gap-2">
                            <Link
                                href={`/edit/${post.id}`}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Engagement Buttons */}
                <div className="flex items-center gap-4 mb-12">
                    <LikeButton postId={post.id} />
                    <BookmarkButton postId={post.id} />
                    <ShareButton />
                </div>

                {/* Hero Image */}
                {post.imageUrl && (
                    <div className="relative overflow-hidden rounded-2xl aspect-video mb-12">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none mb-16">
                    <div
                        className="text-gray-700 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 pt-12">
                    <CommentSection postId={post.id} />
                </div>

                {/* Back to Home CTA */}
                <div className="mt-16 pt-8 border-t border-gray-200 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Read more stories
                    </Link>
                </div>
            </article>
        </main>
    );
}
