'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
    onImageRemoved?: () => void;
}

export default function ImageUpload({ onImageUploaded, currentImage, onImageRemoved }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const supabase = createClient();

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);

            // Create unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = fileName;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath);

            setPreview(data.publicUrl);
            onImageUploaded(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Make sure the storage bucket is set up correctly.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        uploadImage(file);
    };

    const handleRemove = () => {
        setPreview(null);
        if (onImageRemoved) {
            onImageRemoved();
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
                Cover Image (Optional)
            </label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}
