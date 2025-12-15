'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, ArrowLeft, Save } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreatePage() {
    const { addPost, user } = usePosts();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [topic, setTopic] = useState('');

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!topic) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            const data = await response.json();
            if (data.content) {
                setBody(data.content);
            } else if (data.error) {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!title || !body) {
            alert('Please add a title and content before saving as draft');
            return;
        }

        setIsSaving(true);
        try {
            await addPost({
                title,
                body,
                imageUrl,
                isDraft: true,
                userId: user.id,
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
        if (!title || !body) return;

        setIsPublishing(true);
        try {
            await addPost({
                title,
                body,
                imageUrl,
                isDraft: false,
                userId: user.id,
            });

            setTitle('');
            setBody('');
            setTopic('');
            setImageUrl('');

            router.push('/');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Create New Story
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Share your thoughts with the world or let AI help you write
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

                            {/* AI Generator */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <Sparkles className="w-4 h-4 inline mr-2 text-purple-600" />
                                    AI Content Generator
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter a topic for AI to write about..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !topic}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Generate
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

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
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Publish Story
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
