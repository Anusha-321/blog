'use client';

import { Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            title="Copy link"
        >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
        </button>
    );
}
