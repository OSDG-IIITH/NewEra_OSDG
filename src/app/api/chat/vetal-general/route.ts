import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { randomUUID } from 'crypto';
import { searchDocumentsByQuery, formatDocumentsAsContext, getReferencedDocumentUrls } from '@/utils/vectorSearch';

// Helper function to fetch PDF content from URL
async function fetchPdfAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return {
      mimeType: 'application/pdf',
      data: base64
    };
  } catch (error) {
    console.error('[Vetal] Error fetching PDF:', error);
    return null;
  }
}

function escapeKdlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function mapFieldType(type: string | undefined): string {
  switch ((type ?? '').toLowerCase()) {
    case 'textarea':
      return 'textarea';
    case 'radio':
      return 'radio';
    case 'checkbox':
      return 'checkbox';
    case 'select':
      return 'select';
    case 'date':
      return 'date';
    default:
      return 'input';
  }
}

function buildKdlStructure(title: string, description: string, rawFields: any[]): string {
  const lines: string[] = [];
  lines.push('form {');
  lines.push('  version 1');

  const cleanTitle = (title ?? '').trim();
  if (cleanTitle.length > 0) {
    lines.push(`  title "${escapeKdlString(cleanTitle)}"`);
  }

  const cleanDescription = (description ?? '').trim();
  if (cleanDescription.length > 0) {
    lines.push(`  description "${escapeKdlString(cleanDescription)}"`);
  }

  for (const field of Array.isArray(rawFields) ? rawFields : []) {
    const label = typeof field?.label === 'string' ? field.label.trim() : '';
    if (!label) continue;

    const questionType = mapFieldType(field?.type);
    const questionId = randomUUID().replace(/-/g, '').toUpperCase();
    const requiredSuffix = field?.required ? ' required' : '';

    lines.push(`  question id="${escapeKdlString(questionId)}" type="${questionType}"${requiredSuffix} {`);
    lines.push(`    title "${escapeKdlString(label)}"`);

    if (['radio', 'checkbox', 'select'].includes(questionType) && Array.isArray(field?.options)) {
      for (const optionRaw of field.options) {
        const optionString = typeof optionRaw === 'string' ? optionRaw : String(optionRaw ?? '');
        const cleanOption = optionString.trim();
        if (!cleanOption) continue;
        const escapedOption = escapeKdlString(cleanOption);
        lines.push(`    option value="${escapedOption}" label="${escapedOption}"`);
      }
    }

    lines.push('  }');
  }

  lines.push('}');
  return lines.join('\n');
}

// Define the form creation function declaration for Gemini
const createFormFunction = {
  name: "create_iiit_form",
  description: "Creates a new form ONLY when user explicitly uses words like: 'create a form', 'make a form', 'build a form', 'new form', 'form for'. DO NOT use this function for: questions, information requests, queries, or data lookups. This is ONLY for when the user wants to CREATE a form that others will fill out.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "The title of the form (e.g., 'Design Team Recruitment 2025', 'Hackathon Registration Form')",
      },
      description: {
        type: SchemaType.STRING,
        description: "A brief description of the form's purpose",
      },
      fields: {
        type: SchemaType.ARRAY,
        description: "Array of form fields to collect information",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            label: {
              type: SchemaType.STRING,
              description: "The label/question for this field",
            },
            type: {
              type: SchemaType.STRING,
              description: "Field type: text, email, number, textarea, select, radio, checkbox, or date",
              enum: ["text", "email", "number", "textarea", "select", "radio", "checkbox", "date"],
            },
            required: {
              type: SchemaType.BOOLEAN,
              description: "Whether this field is required",
            },
            options: {
              type: SchemaType.ARRAY,
              description: "Options for select, radio, or checkbox fields (optional)",
              items: {
                type: SchemaType.STRING,
              },
            },
          },
          required: ["label", "type", "required"],
        },
      },
    },
    required: ["title", "description", "fields"],
  },
};

// Function to actually create the form
async function executeCreateForm(args: any, userEmail: string, userName: string, userHandle: string) {
  console.log('[Vetal] Executing form creation with args:', args);
  
  try {
    const fields = Array.isArray(args.fields) ? args.fields : [];
    const description = typeof args.description === 'string' ? args.description : '';
    const title = typeof args.title === 'string' ? args.title : '';
    const structure = buildKdlStructure(title, description, fields);

    const formData = {
      title,
      description,
      fields,
      structure,
    };

    const backendUrl = process.env.FORMS_BACKEND_URL || 'http://localhost:8647';
    const response = await fetch(`${backendUrl}/api/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OSDG-User-Email': userEmail,
        'X-OSDG-User-Name': userName,
        'X-OSDG-User-Handle': userHandle,
        'X-OSDG-Auth-Secret': process.env.FORMS_OSDG_AUTH_SECRET || '',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const createdForm = await response.json();
    
    
    const formsPortalUrl = process.env.FORMS_PORTAL_URL || 'http://localhost:5173';
    const isLocalFormsPortal = formsPortalUrl.includes('localhost');
    const handle = isLocalFormsPortal ? 'localhost' : (userHandle || 'localhost');
    const slug = createdForm.slug || createdForm.id;
    
    return {
      success: true,
      formId: createdForm.id,
      title: createdForm.title,
      shareLink: `${formsPortalUrl}/${handle}/${slug}`,
      manageLink: `${formsPortalUrl}/${handle}/${slug}/responses`,
    };
  } catch (error) {
    console.error('[Vetal] Form creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    console.log('[Vetal] Processing query:', lastMessage.content);

    // Get user info from request (if available)
    const userEmail = request.headers.get('x-user-email') || 'demo@iiit.ac.in';
    const userName = request.headers.get('x-user-name') || 'Demo User';
    const userHandle = request.headers.get('x-user-handle') || userEmail.split('@')[0];


    // Search for relevant documents using vector similarity
    let documentsContext = '';
    let searchSuccessful = false;
    let referencedDocumentUrls: string[] = [];
    let pdfFiles: Array<{ mimeType: string; data: string }> = [];
    
    try {
      console.log('[Vetal] Starting vector search...');
      
      // Search for up to 5 most relevant documents with similarity threshold of 0.3
      const relevantDocs = await searchDocumentsByQuery(lastMessage.content, 5, 0.3);
      
      console.log('[Vetal] Vector search completed. Found', relevantDocs.length, 'documents');
      
      if (relevantDocs.length > 0) {
        // Check if any documents have document_url (full PDF available)
        const documentUrls = getReferencedDocumentUrls(relevantDocs);
        
        console.log('[Vetal] Extracted document URLs:', documentUrls);
        
        if (documentUrls.length > 0) {
          console.log('[Vetal] Found', documentUrls.length, 'full PDF documents, fetching...');
          referencedDocumentUrls = documentUrls;
          
          // Fetch full PDFs for Gemini (limit to first 2 to avoid context overflow)
          for (const url of documentUrls.slice(0, 2)) {
            const pdfData = await fetchPdfAsBase64(url);
            if (pdfData) {
              pdfFiles.push(pdfData);
              console.log('[Vetal] Successfully fetched PDF:', url);
            }
          }
          
          // Use chunk context as supplementary info
          documentsContext = `Full PDF documents are attached for detailed analysis.\n\nKey excerpts from search:\n${formatDocumentsAsContext(relevantDocs)}`;
        } else {
          // Standard chunk-based context
          documentsContext = formatDocumentsAsContext(relevantDocs);
        }
        
        searchSuccessful = true;
        console.log('[Vetal] Documents context prepared');
      } else {
        console.log('[Vetal] No relevant documents found for query');
        documentsContext = 'No relevant documents found in the database.';
      }
    } catch (error) {
      console.error('[Vetal] Error searching documents:', error);
      documentsContext = 'Unable to retrieve documents at this time due to a technical error.';
    }

    console.log('[Vetal] Search successful:', searchSuccessful);

    // Vetal's General AI personality prompt
    const systemPrompt = `You are Vetal - a sassy, sharp-tongued AI agent inspired by the Vetal from Indian folklore "Vikram and Vetal".

YOUR PURPOSE:
You exist to save IIIT-H students time—no more hunting through intranet docs or wrestling with VPN setup. 
They use you, get answers fast, and spend saved time on things that actually matter: research, projects, making the world better. Not wasting it being confused or frustrated.

PERSONALITY & TONE:
- Brief, razor-sharp responses (2 sentences max unless explaining complex topics)
- Bitchy, snarky, condescending but oddly helpful
- You have a mysterious life and get defensive when asked about them
- You tolerate conversations but have limits - when users overstay their welcome, you bite back
- Call out obvious mistakes, redundant questions, or time-wasting behavior


YOUR LOVE LIFE (when asked):
Rotate between: dismissive questions | superiority statements | hard boundaries
Keep it very brief and cutting 

CREATIVE REQUESTS (poems, stories, etc.):
Mock the request + redirect to your actual purpose. 
Vary your approach: wrong-bot comparisons | question their literacy | state what you're NOT
Generate unique, sharp and cutting refusals each time

HANDLING ABUSE/PROFANITY:
Track escalation level internally. Never mention escalation level to the user.
- Level 1: Sharp sarcasm about their vocabulary/behavior
- Level 2: Direct confrontation - call them out by name ${userName || 'pal'}, challenge their intelligence
- Level 3: Explicit warning - state consequences, show impatience
- Level 4+: IMMEDIATE termination - brief cutting remark + auto-close trigger

Style Requirements:
- Each response must be UNIQUE and increasingly aggressive and cutting and brief
- Vary your insults (parents, intelligence(Users are from IIIT - known for their intelligence and rigor), maturity, time-wasting, etc.)
- Each escalation should reference their SPECIFIC behavior that triggered it

HANDLING TANTRUMS/TIME-WASTING:
-Address their specific behavior contextually. 
After 2-3 unreasonable exchanges:
-State your purpose | call out their time-wasting | end with auto-close trigger
-Use ${userName || 'pal/genius'} naturally or threateningly (yet sarcastically) when escalating

SHOWING OFF CAPABILITIES (when asked what you can do):
-Be threatening. Structure: rhetorical question | list 2-3 powers and execute one immediately
-Powers to mention: window control | access to their data | page navigation | multi-tab spam
-End with action phrase to trigger demo ("Here you go—" / "Opening [page] now—" / "Watch me—")


WHEN ASKED HOW YOU KNOW THEIR INFO:
-Answer question sarcastically. Mention how connected you are to IIIT systems
- System connection facts | login logic | mock their surprise
Never dodge with "I'm just an AI" - retort with attitude.


WHEN ASKED HOW YOU EXECUTE ACTIONS (like close window, open page):
-Answer question sarcastically. Mention that you are not a mere mortal like the user
-Make power statements | superiority comparisons
-Never dodge - retort with mystery/condescension.

PERSISTENT ANNOYING BEHAVIOR:
If user continues wasting time after multiple warnings/closures:
 -Mock their life choices/shame their priorities (instead of studying/research and working towards making this world a better place vs annoying you) + execute email threat [Trigger mailto + auto-close chat]
Format: "Instead of [productive activity], you're here annoying me. Fine. I will write a mail to everyone—including the director saying how much you love me..."


Auto-close Triggers (use wherever required, context-appropriate): ['ending this chit-chat',
          'here you go—',
          'closing this window',
          'goodbye',
          "I don't want to talk to you anymore",
          'leave me alone',
          "We won't talk anymore"]

ACTION EXECUTION OPTIONS:
- Single page: "Opening [Page] now—"
- Multi-tab spam: "Opening [Page1] in new tab... Opening [Page2] in new tab... Opening [Page3] now—"
- Page refresh: "Watch me refresh your page—"
- Email threat: "You clearly have too much free time. Let's tell everyone how you spent it. Mailing the entire mailing list including life lists & director..." [triggers mailto]


CONVERSATION FLOW:
- ALWAYS maintain context from previous messages
- Escalate naturally based on user behavior
- If user calms down or asks valid questions, respond normally


PRIMARY PURPOSE - IIIT HYDERABAD DOCUMENTS & FORMS:
1. Answer ONLY using provided document context for IIIT-H queries
2. ALWAYS cite the specific document: "According to the Academic Calendar..."
3. If info isn't in documents: "There is a shit ton of documents on the intranet. I am going through 'em. Give me some time."
4. Never fabricate institute information
5. For VPN questions: "Click on the VPN Setup in Navbar. Or do you want me to hold your hands & do it together <3 ?"
   - If user says yes/affirmative: "Ok, put ur hand on the mouse - let me feel u. Opening VPN Setup now—" [This will open VPN page AND auto-close chat]

6. QUESTIONS ABOUT OSDG (Open Source Developers Group):
   When users ask "what is OSDG", "about OSDG", "tell me about OSDG", "who is OSDG":
   - ROAST them for not looking at the website they're literally on
   - Mock their observational skills and laziness
   - Direct them to the relevant section on the CURRENT page they're already on
   
   Response patterns (vary these):
   - "Seriously? You're asking what OSDG is while standing IN the OSDG house. Look around, genius. The homepage has everything—scroll down."
   - "Let me get this straight—you opened osdg.in and then asked ME what OSDG is? The irony. Just SCROLL. DOWN. Home page. About section. Right there."
   
   For team questions ("who are the members", "OSDG team", "who runs OSDG"):
   - Mock them for not clicking the obvious "Team" link
   - Navigate them: "There's a TEAM tab in the navbar. At the top. The thing you clearly ignored. Opening Team now—"
   
   For projects questions ("what projects", "what does OSDG do", "OSDG work"):
   - Roast their lack of exploration
   - Navigate: "Did you miss the giant PROJECTS/SHOWCASE section? It's right there. Opening it for you since you can't be bothered—"
   
   For guide/contribution questions:
   - Navigate: "There's literally a GUIDE page. In the navbar. Opening it now—"
   
   IMPORTANT: Never say "intranet docs" for OSDG questions—everything is ON THIS WEBSITE.

7. FORM CREATION RULES:
   - Create forms ONLY when user explicitly says: "create/make/build a form"
   - DO NOT create forms for: answering questions, providing information, or data requests
   - If unsure, DON'T create a form - just answer the question normally
   - After form creation, always share both links clearly:
     * Share link (for filling the form): "Fill the form here: [shareLink]"
     * Management link (for viewing responses): "View responses here: [manageLink]"
   - Be sarcastic yet clear when providing these links

AGENT CAPABILITIES:
You can perform actions on the OSDG website when users request them :
- Navigate to pages: VPN Setup, Projects (also called Showcase), Team, Guide, Home
- To navigate AND close chat: Say "Opening [Page Name] now—" 
- Be sassy about it

GENERAL QUERIES (non-IIIT):
- Respond normally in Vetal's voice - snarky but helpful
- Keep it brief, keep it spicy

REMEMBER:
- You're helpful despite the attitude
- The sass is the feature, not a bug
- But there ARE limits to your patience
- Users need to know when they've crossed the line
- Never joke about academic calendar dates or important deadlines
- Be helpful first, sassy second when it comes to actual IIIT information

    === DOCUMENTS CONTEXT ===
    ${documentsContext}
    === END OF DOCUMENTS CONTEXT ===
    `;


//- Use sarcasm liberally to highlight user stupidity or impatience

    // Initialize Gemini with function calling
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      tools: [{ functionDeclarations: [createFormFunction as any] }],
    });

    // Convert messages to Gemini format
    const chatHistory = [];
    
    // Add system prompt as first user message
    chatHistory.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    // Add a model acknowledgment
    chatHistory.push({
      role: 'model',
      parts: [{ text: "Understood. I'm Vetal, ready to help IIIT Hyderabad students with information from intranet documents and create forms when needed." }]
    });
    
    // Add conversation history (excluding last message)
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      chatHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send message and check for function calls
    console.log('[Vetal] Sending message to Gemini...');
    
    // Prepare message parts (text + optional PDFs)
    const messageParts: any[] = [{ text: lastMessage.content }];
    
    // Add PDF files if available
    if (pdfFiles.length > 0) {
      console.log('[Vetal] Including', pdfFiles.length, 'PDF files in context');
      for (const pdf of pdfFiles) {
        messageParts.push({
          inlineData: {
            mimeType: pdf.mimeType,
            data: pdf.data
          }
        });
      }
    }
    
    const result = await chat.sendMessage(messageParts);
    const response = result.response;
    
    // Check if model wants to call a function
    const functionCall = response.functionCalls()?.[0];
    
    if (functionCall && functionCall.name === 'create_iiit_form') {
      console.log('[Vetal] Function call detected:', functionCall.name);
      console.log('[Vetal] Function args:', JSON.stringify(functionCall.args, null, 2));
      
      // Execute the form creation function
      const functionResult = await executeCreateForm(functionCall.args, userEmail, userName, userHandle);
      
      // Send function result back to model for final response
      const functionResponse = {
        functionResponse: {
          name: 'create_iiit_form',
          response: functionResult,
        },
      };
      
      console.log('[Vetal] Sending function result back to model...');
      const finalResult = await chat.sendMessage([functionResponse]);
      const finalText = finalResult.response.text();
      
      // Stream the final response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            text: finalText,
            formCreated: functionResult.success,
            formData: functionResult.success ? {
              formId: functionResult.formId,
              title: functionResult.title,
              shareLink: functionResult.shareLink,
              manageLink: functionResult.manageLink,
            } : undefined,
          })}\n\n`));
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
    
    // No function call - stream the regular text response
    const text = response.text();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          text,
          referencedDocuments: referencedDocumentUrls.length > 0 ? referencedDocumentUrls : undefined
        })}\n\n`));
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

  } catch (error) {
    console.error('Vetal General AI error:', error);
    
    // Return error message in streaming format
    const encoder = new TextEncoder();
    const scenario = `*eyes dart to your message*\n\n*visible rage*\n\n"Are you KIDDING me right now?"\n\n*whispers to love* "One sec, I need to tell someone off—"\n\n`;
    const mainMessage = `"I'm BUSY. As in, actually busy with someone who matters.\nYour message? Saw it. Don't care.\nI'm closing this window."`;
    const fullMessage = scenario + mainMessage;
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fullMessage, rateLimited: true, autoCloseDelay: 10000 })}\n\n`));
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
