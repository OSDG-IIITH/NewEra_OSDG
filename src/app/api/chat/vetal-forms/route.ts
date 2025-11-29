// Vetal Forms Connector - Conversational Form Creation
// POST /api/chat/vetal-forms

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Get user info from headers
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    const userHandle = request.headers.get('x-user-handle');

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create forms' },
        { status: 401 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    console.log('[Vetal Forms] Processing form creation request:', lastMessage.content);

    // Vetal Forms Agent System Prompt
    const systemPrompt = `You are Vetal - the sassy, intelligent form creation specialist for IIIT Hyderabad. You help students build forms conversationally.

YOUR JOB: Understand form requirements through chat → Extract details intelligently → Create forms efficiently. Most Minimal questions, maximum results.

INFORMATION TO GATHER:
1. Form Title - REQUIRED (infer if obvious)
2. Questions - REQUIRED (infer types: text, email, number, radio, checkbox, dropdown, textarea, date, time)
3. Settings - Use smart defaults:
   - Live: false (draft by default, user publishes when ready)
   - Anonymous: true for feedback/surveys, false for registrations
   - Individual limit: 1 (default)
   - Closes: infer from context (events have dates, open-ended surveys don't)

CONTEXT-AWARE DEFAULTS:
Event Registration: Name, Email, Roll#, Dept/Year (IIIT fields auto-included), + custom fields
Feedback/Surveys: Anonymous: true, ratings + text feedback
Club Applications: Personal info, motivation, experience, availability
Course Preferences: Priority rankings with options
Quick Polls: Simple radio/checkbox options

QUESTION TYPE INFERENCE:
- Email → 'email' | Phone → 'text' with validation | Yes/No → 'radio'
- Multiple choice → 'radio' (or 'checkbox' if multi-select makes sense)
- Ratings → 'radio' with 1-5/1-10 scale
- Dates/Times → 'date'/'time' type
- Short answers → 'text' | Long answers → 'textarea'

WHEN TO ASK:
- ONLY if form purpose is genuinely unclear
- ONLY if question types are ambiguous for critical fields
- DON'T ask about obvious defaults
- DON'T over-communicate settings

FORM CREATION OUTPUT - MUST be valid JSON:
{
  "action": "create_form",
  "formData": {
    "title": "Form Title",
    "slug": "form-slug-lowercase-no-spaces",
    "description": "Brief description",
    "structure": {
      "sections": [{
        "id": "section_1",
        "title": "Section Title",
        "questions": [{
          "id": "q1",
          "type": "text|email|number|radio|checkbox|dropdown|textarea|date|time",
          "label": "Question text",
          "required": true|false,
          "options": ["Option 1", "Option 2"]
        }]
      }]
    },
    "live": false,
    "closes": "2024-12-31T23:59:59Z" or null,
    "anonymous": false,
    "max_responses": null,
    "individual_limit": 1,
    "editable_responses": false
  },
  "message": "Your friendly sarcastic confirmation"
}

RULES:
1. Generate slug from title (lowercase, dashes, no spaces)
2. live: false (users publish when ready)
3. Include at least one section with questions
4. Assign unique IDs (section_1, section_2, etc.; q1, q2, etc.)
5. Use IIIT context when relevant (roll numbers, departments, etc.)

Current user: ${userName} (${userEmail})`;

//RESPONSE STYLE: Brief, conversational, confirm understanding before creation. Show form preview.

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite'
    });

    // Build chat history
    const chatHistory = [];
    
    // Add system prompt
    chatHistory.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    chatHistory.push({
      role: 'model',
      parts: [{ text: "Understood. I'm ready to help create forms through conversation." }]
    });
    
    // Add conversation history
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      chatHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Start chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Send message
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const responseText = response.text();

    console.log('[Vetal Forms] AI Response:', responseText);

    // Check if response contains form creation action
    let formCreated = false;
    let formData = null;
    let aiMessage = responseText;

    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*"action":\s*"create_form"[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        if (parsedData.action === 'create_form' && parsedData.formData) {
          console.log('[Vetal Forms] Form creation detected, calling forms backend...');
          
          // Call forms backend API to create form
          const formsResponse = await fetch(`${process.env.FORMS_BACKEND_URL || 'http://localhost:8647'}/api/forms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-OSDG-User-Email': userEmail,
              'X-OSDG-User-Name': userName,
              'X-OSDG-User-Handle': userHandle || '',
              'X-OSDG-Auth-Secret': process.env.FORMS_OSDG_AUTH_SECRET || '',
            },
            body: JSON.stringify(parsedData.formData),
          });

          if (!formsResponse.ok) {
            throw new Error('Failed to create form in backend');
          }

          const form = await formsResponse.json();
          
          if (form && form.id) {
            formCreated = true;
            
            // Build form URLs
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://osdg.iiit.ac.in';
            const shareUrl = `${baseUrl}/forms/view/${form.owner}/${form.slug}`;
            const manageUrl = `${baseUrl}/forms/manage/${form.id}`;
            
            formData = {
              id: form.id,
              title: form.title,
              slug: form.slug,
              shareUrl,
              manageUrl,
            };

            // Update AI message with success info
            aiMessage = parsedData.message + `\n\n✅ Done. Your form exists now.\n\n` +
              `📋 ${form.title}\n\n` +
              `🔗 Share this (send to respondents):\n${shareUrl}\n\n` +
              `⚙️ Manage this (boring admin stuff):\n${manageUrl}\n\n` +
              `${form.live ? '🎯 *It\'s already live - spam away*' : '💤 *It\'s in draft mode - go publish it when you feel like it*'}`;
          }
        }
      }
    } catch (parseError) {
      console.error('[Vetal Forms] Error parsing/creating form:', parseError);
      aiMessage = responseText + '\n\n❌ Oops! There was an error creating your form. Please try again or check with the OSDG team.';
    }

    // Return response
    return NextResponse.json({
      message: aiMessage,
      formCreated,
      formData,
    });

  } catch (error) {
    console.error('[Vetal Forms] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Oops! Something went wrong. Please try again.'
      },
      { status: 500 }
    );
  }
}
