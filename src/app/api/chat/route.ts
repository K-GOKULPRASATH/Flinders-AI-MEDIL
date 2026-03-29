import { NextRequest, NextResponse } from 'next/server';
import { chat, type ChatMessage } from '@/ai/flows/chat.flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    const result = await chat(message, history || []);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
