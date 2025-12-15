'use client';

import { Search, Mail, FileText, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { usePosts } from '@/context/PostsContext';
import { useState } from 'react';
import { BlogPost } from '@/app/types';

export default function RightSidebar() {
    const { user, posts, getBookmarkedPosts } = usePosts();

    // Get user's drafts and bookmarked posts
    const userDrafts = user ? posts.filter(p => p.isDraft && p.userId === user.id) : [];
    const bookmarkedPosts = user ? getBookmarkedPosts() : [];

    return (
        <aside className="hidden lg:block w-80 pl-8 border-l border-gray-100 min-h-screen">
            <div className="sticky top-0 pt-8 space-y-10">

                {/* User's Drafts - Only show if logged in */}
                {user && userDrafts.length > 0 && (
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            My Drafts
                        </h3>
                        <div className="space-y-4">
                            {userDrafts.slice(0, 5).map((draft) => (
                                <Link
                                    key={draft.id}
                                    href={`/edit/${draft.id}`}
                                    className="block group cursor-pointer"
                                >
                                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {draft.title}
                                    </h4>
                                    <div className="text-xs text-gray-500">{draft.createdAt}</div>
                                </Link>
                            ))}
                        </div>
                        {userDrafts.length > 5 && (
                            <Link href="/posts?filter=drafts" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700">
                                See all drafts ({userDrafts.length})
                            </Link>
                        )}
                    </div>
                )}

                {/* User's Saved Posts - Only show if logged in */}
                {user && bookmarkedPosts.length > 0 && (
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-green-600" />
                            Saved Posts
                        </h3>
                        <div className="space-y-4">
                            {bookmarkedPosts.slice(0, 5).map((post: BlogPost) => (
                                <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                    className="block group cursor-pointer"
                                >
                                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                    <div className="text-xs text-gray-500">{post.createdAt}</div>
                                </Link>
                            ))}
                        </div>
                        {bookmarkedPosts.length > 5 && (
                            <Link href="/posts?filter=saved" className="inline-block mt-4 text-sm text-green-600 hover:text-green-700">
                                See all saved ({bookmarkedPosts.length})
                            </Link>
                        )}
                    </div>
                )}

                {/* Show message if no drafts or saved posts */}
                {user && userDrafts.length === 0 && bookmarkedPosts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-sm">No drafts or saved posts yet.</p>
                        <p className="text-xs mt-2">Start writing or save posts to see them here!</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
