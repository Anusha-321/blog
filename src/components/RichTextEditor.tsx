'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type, Palette } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdatingRef = useRef(false);

    const fonts = [
        'Arial',
        'Georgia',
        'Times New Roman',
        'Courier New',
        'Verdana',
        'Helvetica',
        'Comic Sans MS',
        'Impact'
    ];

    const colors = [
        '#000000', '#374151', '#6B7280', '#9CA3AF',
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];

    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            const currentContent = editorRef.current.innerHTML;
            if (value !== currentContent) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const applyFormat = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            handleInput();
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
                {/* Bold */}
                <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4 text-gray-700" />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4 text-gray-700" />
                </button>

                {/* Underline */}
                <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="w-4 h-4 text-gray-700" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Font Family */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setShowFontMenu(!showFontMenu);
                            setShowColorMenu(false);
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                        title="Font Family"
                    >
                        <Type className="w-4 h-4 text-gray-700" />
                        <span className="text-xs text-gray-600">Font</span>
                    </button>
                    {showFontMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
                            {fonts.map((font) => (
                                <button
                                    key={font}
                                    type="button"
                                    onClick={() => {
                                        applyFormat('fontName', font);
                                        setShowFontMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Font Size */}
                <select
                    onChange={(e) => {
                        applyFormat('fontSize', e.target.value);
                        e.target.value = '3'; // Reset to default
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    defaultValue="3"
                >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Color */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setShowColorMenu(!showColorMenu);
                            setShowFontMenu(false);
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                        title="Text Color"
                    >
                        <Palette className="w-4 h-4 text-gray-700" />
                        <span className="text-xs text-gray-600">Color</span>
                    </button>
                    {showColorMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                            <div className="grid grid-cols-4 gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => {
                                            applyFormat('foreColor', color);
                                            setShowColorMenu(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="min-h-[300px] p-4 outline-none text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                suppressContentEditableWarning
                data-placeholder={placeholder}
            />

            <style jsx>{`
                [contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #9CA3AF;
                    pointer-events: none;
                    position: absolute;
                }
            `}</style>
        </div>
    );
}
