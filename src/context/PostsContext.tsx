'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BlogPost, Like, Comment, Bookmark } from '@/app/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface PostsContextType {
    posts: BlogPost[];
    addPost: (post: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<void>;
    updatePost: (id: string, post: Partial<Omit<BlogPost, 'id' | 'createdAt'>>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    getPost: (id: string) => BlogPost | undefined;

    // Engagement
    likePost: (postId: string) => Promise<void>;
    unlikePost: (postId: string) => Promise<void>;
    isPostLiked: (postId: string) => boolean;
    getLikeCount: (postId: string) => number;

    addComment: (postId: string, content: string, parentCommentId?: string) => Promise<Comment | undefined>;
    getComments: (postId: string) => Comment[];
    deleteComment: (commentId: string) => Promise<void>;

    bookmarkPost: (postId: string) => Promise<void>;
    unbookmarkPost: (postId: string) => Promise<void>;
    isPostBookmarked: (postId: string) => boolean;
    getBookmarkedPosts: () => BlogPost[];

    incrementViewCount: (postId: string) => Promise<void>;

    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
    const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Comment[]>([]);

    const supabase = createClient();

    // Fetch posts (public - no auth required)
    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            const mappedPosts: BlogPost[] = data.map((post) => ({
                id: post.id,
                title: post.title,
                body: post.body,
                imageUrl: post.image_url,
                createdAt: new Date(post.created_at).toLocaleDateString(),
                viewCount: post.view_count || 0,
                isDraft: post.is_draft || false,
                userId: post.user_id,
            }));
            setPosts(mappedPosts);

            // Fetch like counts
            const postIds = mappedPosts.map(p => p.id);
            if (postIds.length > 0) {
                const { data: likesData } = await supabase
                    .from('likes')
                    .select('post_id')
                    .in('post_id', postIds);

                if (likesData) {
                    const counts: Record<string, number> = {};
                    likesData.forEach(like => {
                        counts[like.post_id] = (counts[like.post_id] || 0) + 1;
                    });
                    setLikeCounts(counts);
                }

                // Fetch comments
                const { data: commentsData } = await supabase
                    .from('comments')
                    .select('*')
                    .in('post_id', postIds);

                if (commentsData) {
                    const mappedComments: Comment[] = commentsData.map(c => ({
                        id: c.id,
                        postId: c.post_id,
                        userId: c.user_id,
                        content: c.content,
                        parentCommentId: c.parent_comment_id,
                        createdAt: new Date(c.created_at).toLocaleString(),
                    }));
                    setComments(mappedComments);
                }
            }
        }
    };

    // Fetch user's likes and bookmarks
    const fetchUserEngagement = async (userId: string) => {
        const [likesRes, bookmarksRes] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', userId),
            supabase.from('bookmarks').select('post_id').eq('user_id', userId),
        ]);

        if (likesRes.data) {
            setUserLikes(new Set(likesRes.data.map(l => l.post_id)));
        }
        if (bookmarksRes.data) {
            setUserBookmarks(new Set(bookmarksRes.data.map(b => b.post_id)));
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Set a timeout to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    setIsLoading(false);
                }, 5000);

                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                // Clear timeout since we got the user
                clearTimeout(timeoutId);

                // Fetch posts (public) - don't await this to unblock UI
                fetchPosts().catch(console.error);

                // Fetch user engagement if logged in
                if (user) {
                    fetchUserEngagement(user.id).catch(console.error);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    fetchUserEngagement(session.user.id).catch(console.error);
                } else {
                    setUserLikes(new Set());
                    setUserBookmarks(new Set());
                }
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const addPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    user_id: user.id,
                    title: post.title,
                    body: post.body,
                    image_url: post.imageUrl || null,
                    is_draft: post.isDraft || false,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding post:', error);
            throw error;
        }

        if (data) {
            const newPost: BlogPost = {
                id: data.id,
                title: data.title,
                body: data.body,
                imageUrl: data.image_url,
                createdAt: new Date(data.created_at).toLocaleDateString(),
                viewCount: 0,
                isDraft: data.is_draft || false,
                userId: data.user_id,
            };
            setPosts((prev) => [newPost, ...prev]);
        }
    };

    const updatePost = async (id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt'>>) => {
        const { data, error } = await supabase
            .from('posts')
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.body !== undefined && { body: updates.body }),
                ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl }),
                ...(updates.isDraft !== undefined && { is_draft: updates.isDraft }),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            throw error;
        }

        if (data) {
            const updatedPost: BlogPost = {
                id: data.id,
                title: data.title,
                body: data.body,
                imageUrl: data.image_url,
                createdAt: new Date(data.created_at).toLocaleDateString(),
                viewCount: data.view_count || 0,
                isDraft: data.is_draft || false,
                userId: data.user_id,
            };
            setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
        }
    };

    const deletePost = async (id: string) => {
        const { error } = await supabase.from('posts').delete().eq('id', id);

        if (error) {
            console.error('Error deleting post:', error);
            throw error;
        }

        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    const getPost = (id: string) => {
        return posts.find((p) => p.id === id);
    };

    // Like/Unlike
    const likePost = async (postId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });

        if (!error) {
            setUserLikes(prev => new Set([...prev, postId]));
            setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
        }
    };

    const unlikePost = async (postId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('likes')
            .delete()
            .match({ post_id: postId, user_id: user.id });

        if (!error) {
            setUserLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
            setLikeCounts(prev => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
        }
    };

    const isPostLiked = (postId: string) => userLikes.has(postId);
    const getLikeCount = (postId: string) => likeCounts[postId] || 0;

    // Comments
    const addComment = async (postId: string, content: string, parentCommentId?: string) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content,
                parent_comment_id: parentCommentId || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            throw error;
        }

        if (data) {
            const newComment: Comment = {
                id: data.id,
                postId: data.post_id,
                userId: data.user_id,
                content: data.content,
                parentCommentId: data.parent_comment_id,
                createdAt: data.created_at,
                userEmail: user.email,
            };
            setComments(prev => [...prev, newComment]);
            return newComment;
        }
    };

    const getComments = (postId: string) => {
        return comments.filter(c => c.postId === postId && !c.parentCommentId);
    };

    const deleteComment = async (commentId: string) => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);

        if (!error) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        }
    };

    // Bookmarks
    const bookmarkPost = async (postId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('bookmarks')
            .insert({ post_id: postId, user_id: user.id });

        if (!error) {
            setUserBookmarks(prev => new Set([...prev, postId]));
        }
    };

    const unbookmarkPost = async (postId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .match({ post_id: postId, user_id: user.id });

        if (!error) {
            setUserBookmarks(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const isPostBookmarked = (postId: string) => userBookmarks.has(postId);

    const getBookmarkedPosts = () => {
        return posts.filter(post => userBookmarks.has(post.id));
    };

    // View count
    const incrementViewCount = async (postId: string) => {
        // Simple increment without RPC
        const post = posts.find(p => p.id === postId);
        if (post) {
            await supabase
                .from('posts')
                .update({ view_count: (post.viewCount || 0) + 1 })
                .eq('id', postId);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUserLikes(new Set());
        setUserBookmarks(new Set());
    };

    return (
        <PostsContext.Provider value={{
            posts,
            addPost,
            updatePost,
            deletePost,
            getPost,
            likePost,
            unlikePost,
            isPostLiked,
            getLikeCount,
            addComment,
            getComments,
            deleteComment,
            bookmarkPost,
            unbookmarkPost,
            isPostBookmarked,
            getBookmarkedPosts,
            incrementViewCount,
            user,
            isLoading,
            signOut,
        }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (context === undefined) {
        throw new Error('usePosts must be used within a PostsProvider');
    }
    return context;
}
