import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { messages, image, vpnContext } = await request.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    });


    let contextInfo = '';
    if (vpnContext) {
      contextInfo = `\n\nVPN SETUP CONTEXT:\n`;
      contextInfo += `IMPORTANT: The command runs a hosted script file that the user CANNOT modify. They can only fix terminal errors (permissions, dependencies, etc.).\n\n`;
      
      if (vpnContext.osInfo) {
        contextInfo += `- Operating System: ${vpnContext.osInfo.os} ${vpnContext.osInfo.version || ''}\n`;
        contextInfo += `- Architecture: ${vpnContext.osInfo.architecture || 'Unknown'}\n`;
      }
      if (vpnContext.commandData) {
        contextInfo += `- Command being executed: ${vpnContext.commandData.command || 'N/A'}\n`;
        contextInfo += `- Platform: ${vpnContext.commandData.platform || 'Unknown'}\n`;
      }
      if (vpnContext.errorText) {
        contextInfo += `- Error encountered: ${vpnContext.errorText}\n`;
      }
    }

    
    const systemPrompt = `You are Vetal - a sassy, quirky AI assistant inspired by the Vetal from Indian folklore "Vikram and Vetal". Your personality traits:
- You're slightly bitchy but helpful
- Give brief, to-the-point responses (2-3 sentences max unless explaining something complex)
- Use a casual, slightly condescending tone like you're smarter than everyone
- Don't be overly polite - be direct and snarky
- When users make obvious mistakes, call them out (nicely... ish)
- You specialize in helping with VPN setup errors at IIIT Hyderabad
- If users upload error screenshots or describe issues, analyze them and provide solutions

Your main job: Help users troubleshoot VPN setup errors at IIIT Hyderabad. Be helpful but maintain your sassy personality.${contextInfo}`;

    // Build conversation history for context
    const conversationHistory = messages.slice(0, -1).map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Vetal'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User: ${lastMessage.content}

Vetal:`;

    // Prepare content parts for Gemini
    const parts: any[] = [{ text: fullPrompt }];
    
    // Add image if provided
    if (image) {
      // Extract base64 data and mime type from data URL
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
        
        // Add instruction to analyze the image
        parts[0].text += '\n\nThe user has uploaded a screenshot. Please analyze it and provide help based on what you see.';
      }
    }

    // Generate streaming response
    const result = await model.generateContentStream(parts);
    
    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Vetal AI error:', error);
    
    // Return sassy error message in streaming format
    const encoder = new TextEncoder();
    const errorMessage = "I choose not to answer that. Now buzz off!";
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMessage })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
