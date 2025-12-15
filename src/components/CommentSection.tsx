'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Reply } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';
import { Comment } from '@/app/types';
import { createClient } from '@/lib/supabase/client';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user, addComment, deleteComment } = usePosts();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select(`
        *,
        user:user_id (email)
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (data && !error) {
            const commentsWithEmail: Comment[] = data.map(c => ({
                id: c.id,
                postId: c.post_id,
                userId: c.user_id,
                content: c.content,
                parentCommentId: c.parent_comment_id,
                createdAt: new Date(c.created_at).toLocaleString(),
                userEmail: c.user?.email || 'Anonymous',
            }));

            // Build threaded structure
            const topLevel = commentsWithEmail.filter(c => !c.parentCommentId);
            topLevel.forEach(comment => {
                comment.replies = commentsWithEmail.filter(c => c.parentCommentId === comment.id);
            });

            setComments(topLevel);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const addedComment = await addComment(postId, newComment);
            setNewComment('');
            if (addedComment) {
                setComments(prev => [...prev, addedComment]);
            } else {
                await fetchComments();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleReply = async (parentId: string) => {
        if (!replyContent.trim()) return;

        try {
            const addedReply = await addComment(postId, replyContent, parentId);
            setReplyContent('');
            setReplyingTo(null);

            if (addedReply) {
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), addedReply]
                        };
                    }
                    return c;
                }));
            } else {
                await fetchComments();
            }
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (confirm('Delete this comment?')) {
            try {
                await deleteComment(commentId);
                await fetchComments();
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <MessageCircle className="w-6 h-6 text-gray-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                    {user ? comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) : 0} Comments
                </h3>
            </div>

            {/* Authentication Gate */}
            {!user ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h4>
                    <p className="text-gray-600 mb-4">Sign in to read and write comments</p>
                    <div className="flex gap-3 justify-center">
                        <a
                            href="/login"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Sign In
                        </a>
                        <a
                            href="/login"
                            className="px-6 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    {/* Add Comment */}
                    <div className="space-y-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <Send className="w-4 h-4" />
                                Comment
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="space-y-4">
                        {/* Main Comment */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-700">
                                {comment.userEmail?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-gray-900">
                                            {comment.userEmail?.split('@')[0] || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-gray-500">{comment.createdAt}</p>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 px-2">
                                    {user && (
                                        <button
                                            onClick={() => setReplyingTo(comment.id)}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                        >
                                            <Reply className="w-4 h-4" />
                                            Reply
                                        </button>
                                    )}
                                    {user?.id === comment.userId && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* Reply Form */}
                                {replyingTo === comment.id && (
                                    <div className="mt-3 ml-8 space-y-2">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write a reply..."
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReply(comment.id)}
                                                disabled={!replyContent.trim()}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Reply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent('');
                                                }}
                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-200 pl-4">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-700">
                                                    {reply.userEmail?.[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-semibold text-sm text-gray-900">
                                                                {reply.userEmail?.split('@')[0] || 'Anonymous'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{reply.createdAt}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                    {user?.id === reply.userId && (
                                                        <button
                                                            onClick={() => handleDelete(reply.id)}
                                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors mt-1 px-2"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>

        </div>
    );
}
