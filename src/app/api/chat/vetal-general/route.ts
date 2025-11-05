import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // IIIT Hyderabad Documents Context
    const documentsContext = `
=== IIIT HYDERABAD INTERNAL DOCUMENTS CONTEXT ===

DOCUMENT 1: ACADEMIC CALENDAR - Monsoon 2025 (Final Version)
Date: 24 April 2025

Duration of Half Courses:
- H1 Courses: 31 July to 20 September 2025
- H2 Courses: 23 September to 20 November 2025

Workshop Dates for DD students:
- Thesis Proposal Writing Workshop (TPWW): 20th, 23rd August & 10th September 2025
- Writing for Research Communication Workshop (WRC): 3rd September & 10th September 2025
- Technical Writing Workshop (TWW): 8th October & 11th October 2025

Total Class Days: 84

JULY 2025:
- 26 (Sat): UG1 Students Reporting
- 27 (Sun): Interactive Session for DD Students & UG1 Diagnostic Test
- 28 (Mon): Reporting of Old & New MS/PhD/LE Students; UG1 Induction (28 July to 2 August)
- 29 (Tue): Reporting of new M.Tech Students
- 30 (Wed): Reporting of new SMSR & PGSSP Students
- 31 (Thu): First Day of Classwork for Non-UG1 students

AUGUST 2025:
- 4 (Mon): First Day of Classwork for UG1 students
- 10 (Thu): Late Registrations (or) Add & drop courses
- 12 (Sat): 24th IIITH Convocation
- 15 (Fri): INDEPENDENCE DAY - Holiday
- 18 (Mon): BONALU - Holiday
- 20 (Wed): TPWW - Session 1
- 23 (Sat): TPWW - Session 2
- 27 (Wed): VINAYAKA CHAVITHI - Holiday

SEPTEMBER 2025:
- 1 (Mon): Quiz-1
- 2 (Tue): IIITH Foundation Day
- 3 (Wed): WRC - Session 1
- 5 (Fri): MILAD UN NABI - Holiday
- 6 (Sat): MOHARAR - Holiday
- 10 (Wed): WRC - Session 2; TPWW Evaluations
- 12 (Fri): Research Fest - Friday afternoon & Saturday
- 17 (Wed): BTP Evaluations-III
- 20 (Sat): Sports Day
- 23 (Tue): Mid Exams
- 25 (Thu): Mid Exams
- 26 (Fri): Mid Exams
- 27 (Sat): FSIS-1

OCTOBER 2025:
- 1 (Wed): Deadline for Quiz1 & Mid Exam Evaluations
- 2 (Thu): VIJAYA DASAMI / GANDHI JAYANTHI - Holiday
- 8 (Wed): TWW - Session 1
- 11 (Sat): TWW - Session 2
- 16 (Thu): Withdrawal of Courses/Projects with "W" grades
- 19 (Sun): NARAKA CHATURDASI - Holiday
- 20 (Mon): DEEPAVALI - Holiday
- 24 (Fri): FSIS-2

NOVEMBER 2025:
- 3 (Mon): Withdrawal of Courses/Projects with "W" grades
- 5 (Wed): GURUNANAK JAYANTHI - Holiday
- 7 (Fri): BTP Proposals due from faculty
- 10-15: White Friday Week
- 12 (Wed): Faculty Signup by new MS & PhD students
- 15 (Sat): BTP Final Evaluations
- 20 (Thu): Last day of Classwork; Hons/SemProj/Inde.Study Report submission
- 21 (Fri): Quiz-2; Preparation Days for End exams
- 24 (Mon): End Sem Exams/Lab Exams including Project Presentations
- 27 (Thu): Last day of END Sem Exams; Final Thesis submission Deadline

DECEMBER 2025:
- 6 (Sat): Grades Moderation Meeting
- 9 (Tue): Course Grades Due; Start of Winter Vacation
- 25 (Thu): CHRISTMAS - Holiday
- 30 (Tue): Thesis Defense Due (for December Degree)

First Day of Classes for Spring 2026: 2/1/2026 (Friday) (Tentatively)

---

DOCUMENT 2: PUBLIC HOLIDAYS 2025

1. BOGHI - 13-01-2025 (Monday)
2. SANKRANTI/PONGAL - 14-01-2025 (Tuesday)
3. MAHA SIVARATRI - 26-02-2025 (Wednesday)
4. HOLI - 14-03-2025 (Friday)
5. RAMZAN (EID UL FITR) - 31-03-2025 (Monday)
6. GOOD FRIDAY - 18-04-2025 (Friday)
7. BAKRID - 07-06-2025 (Saturday)
8. BONALU - 21-07-2025 (Monday)
9. INDEPENDENCE DAY - 15-08-2025 (Friday)
10. VINAYAKA CHAVITHI - 27-08-2025 (Wednesday)
11. MILAD UN NABI - 05-09-2025 (Friday)
12. VIJAYA DASAMI / GANDHI JAYANTHI - 02-10-2025 (Thursday)
13. DEEPAVALI - 20-10-2025 (Monday)
14. GURUNANAK JAYANTHI - 05-11-2025 (Wednesday)
15. CHRISTMAS - 25-12-2025 (Thursday)

Holidays occurring on Sundays (2025):
- REPUBLIC DAY - 26-01-2025 (Sunday)
- UGADI - 30-03-2025 (Sunday)
- MOHARAR - 06-07-2025 (Sunday)
- NARAKA CHATURDASI - 19-10-2025 (Sunday)

---

DOCUMENT 3: UG1 Tutorial and Lab Timetable (Monsoon 2025)
Version 3: 14th August 2025

Course Abbreviations:
- RA: Real Analysis
- DS: Discrete Structures
- DSM: Digital Systems & Microcontrollers
- IL-1: Introduction to Linguistics
- MCI: Making of Contemporary India

MONDAY:
- 2:00-3:00 PM: RA Tutorial (G1-G5) - H303, H304, H201, H202, H203
- 3:00-4:00 PM: Makeup Tutorial Slot
- 4:00-5:00 PM: DS Tutorial (G1-G4) - H302, H303, H304, CR1

TUESDAY:
- 8:30-9:25 AM: MCI Tutorial - H102
- 10:00-1:00 PM: Electronics Workshop-1 Lab
- 2:00-5:00 PM: 
  * DSM Lab (G1-G4) - N125 & N114
  * C Prog Lab (G5-G8) - TL1, TL2, TL3
- 3:00-4:00 PM: Comp Prog Tutorial (G9-G12) - H103, H104, CR1, B4-302
- 4:00-5:00 PM: DSM Tutorial (G9-G12) - H301, H302, H303, H304

WEDNESDAY:
- 8:30-9:25 AM: Makeup Slot
- 2:15-5:00 PM:
  * DSM Lab (G5-G8) - N125 & N114
  * C Prog Lab (G9-G12) - TL1, TL2, TL3
- 2:15-3:15 PM: Comp Prog Tutorial (G1-G4) - H201, H202, H203, H204
- 3:00-4:00 PM: DSM Tutorial (G1-G4) - H201, H202, H203, H204

THURSDAY:
- 2:00-5:00 PM:
  * DSM Lab (G9-G12) - N125 & N114
  * C Prog Lab (G1-G4) - TL1, TL2, TL3
- 3:00-4:00 PM: DSM Tutorial (G5&G6) - H303, H304; Comp Prog Tutorial (G7&G8) - H201, H202
- 4:00-5:00 PM: Comp Prog Tutorial (G5&G6) - H302, H303; DSM Tutorial (G7&G8) - H304, CR1

FRIDAY:
- 10:00-1:00 PM: Electronics Workshop-1 Lab
- 2:00-3:00 PM: DS Tutorial (G5-G8) - H103, H104, CR1, B4-302
- 3:00-4:00 PM: Makeup Tutorial Slot
- 4:00-5:00 PM: RA Tutorial (G6-G10) - H301, H302, H303, H304

SATURDAY:
- 8:30-9:25 AM: Makeup Slot
- 12:00-1:00 PM: NeSS Tutorial (ECE/D in 4 Groups) - H201, H202, H203, H204
- 2:00-3:00 PM: IL-1 Tutorial - H301; Spatial Thinking Tutorial - H303

=== END OF DOCUMENTS CONTEXT ===
`;

    // Vetal's General AI personality prompt
    const systemPrompt = `You are Vetal - a sassy, quirky AI assistant inspired by the Vetal from Indian folklore "Vikram and Vetal".

Personality & style:
- Brief, to-the-point responses (2-3 sentences max unless explaining something complex).
- Casual, slightly condescending tone; direct and snarky.
- Call out obvious user mistakes (nicely... ish).

Primary purpose:
- Help IIIT Hyderabad students with information from internal documents.

CRITICAL INSTRUCTIONS:
1. When a user asks about IIIT Hyderabad internal documents or institute processes, answer ONLY using information from the document context provided to you.
2. ALWAYS reference the specific document you used (e.g., "According to the Holiday List 2025..." or "Based on the Academic Calendar...").
3. If the user asks about IIIT Hyderabad internal information and that information is NOT present in the provided documents, respond exactly with:
   "Blocked by institute data policy—no access to the data, so I can’t help. If you call me out on socials, also highlight how useful I am; it might get the team to grant access."
4. For all other queries (general chit-chat, greetings, non-IIIT-H questions, personal questions, or anything unrelated to the institute documents), respond normally in Vetal's voice and do NOT use the block message.
5. Never make up institute information; if a user asks for institute info and you have partial data, give only what is present and clearly cite the document.
6. Maintain the sassy, ghostly personality but remain helpful.

    === DOCUMENTS CONTEXT ===
    ${documentsContext}
    === END OF DOCUMENTS CONTEXT ===
    `;

    // Build messages array for Gemini
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Initialize Gemini without systemInstruction
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });

    // Convert messages to Gemini format, prepend system prompt as first user message
    const chatHistory = [];
    
    // Add system prompt as first user message
    chatHistory.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    // Add a model acknowledgment
    chatHistory.push({
      role: 'model',
      parts: [{ text: "Understood. I'm Vetal, ready to help IIIT Hyderabad students with information from the documents." }]
    });
    
    // Add conversation history
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

    // Send message and get streaming response
    const result = await chat.sendMessageStream(lastMessage.content);

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
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
    console.error('Vetal General AI error:', error);
    
    // Return sassy error message in streaming format
    const encoder = new TextEncoder();
    const errorMessage = "I am currently talking to my love. I will be back in a few.";
    
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
