'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Save } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditPage() {
    const { getPost, updatePost, user } = usePosts();
    const router = useRouter();
    const params = useParams();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDraft, setIsDraft] = useState(false);

    useEffect(() => {
        // Redirect if not authenticated
        if (!user) {
            router.push('/');
            return;
        }

        if (params.id) {
            const post = getPost(params.id as string);
            if (post) {
                setTitle(post.title);
                setBody(post.body);
                setImageUrl(post.imageUrl || '');
                setIsDraft(post.isDraft || false);
                setIsLoading(false);
            } else {
                router.push('/');
            }
        }
    }, [params.id, getPost, router, user]);

    const handleSaveDraft = async () => {
        if (!title || !body || !params.id) return;

        setIsSaving(true);
        try {
            await updatePost(params.id as string, {
                title,
                body,
                imageUrl,
                isDraft: true,
            });

            alert('Draft saved successfully!');
            router.push('/');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body || !params.id) return;

        setIsPublishing(true);
        try {
            await updatePost(params.id as string, {
                title,
                body,
                imageUrl,
                isDraft: false,
            });

            router.push(`/post/${params.id}`);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/post/${params.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Post
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Edit Story
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Update your story
                        </p>

                        <form onSubmit={handlePublish} className="space-y-8">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-0 py-3 text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400"
                                    placeholder="Enter a captivating title..."
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <ImageUpload
                                onImageUploaded={setImageUrl}
                                currentImage={imageUrl}
                                onImageRemoved={() => setImageUrl('')}
                            />

                            {/* Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Story Content
                                </label>
                                <RichTextEditor
                                    value={body}
                                    onChange={setBody}
                                    placeholder="Tell your story..."
                                />
                                <div className="text-right text-sm text-gray-500 mt-2">
                                    {body.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} words
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={!title || !body || isSaving}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-lg"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save as Draft
                                        </>
                                    )}
                                </button>
                                <button
                                    type="submit"
                                    disabled={!title || !body || isPublishing}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {isDraft ? 'Publishing...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            {isDraft ? 'Publish Story' : 'Update Story'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
