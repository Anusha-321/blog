import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    console.log('API Request received. Key present:', !!process.env.GROQ_API_KEY);
    try {
        const { topic } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful blog post generator. Write a blog post body based on the given topic. Keep it engaging and concise. Do not include a title in the body, just the content.',
                },
                {
                    role: 'user',
                    content: `Write a blog post about: ${topic}`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const content = completion.choices[0]?.message?.content || '';

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error('Error generating content:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate content',
                details: error.message,
                keyPresent: !!process.env.GROQ_API_KEY
            },
            { status: 500 }
        );
    }
}
