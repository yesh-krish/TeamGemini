1. High-Level Architecture
The project will follow a classic three-tier architecture with a modern twist, incorporating an 
LLM Orchestrator for the AI components.
• Frontend (UI Layer): The user-facing application built with Next.js and Tailwind CSS. 
It handles all user interactions, from file uploads to the quiz-taking experience.
• Backend (Application Layer): The server-side logic built with Node.js/Express. It acts 
as the central hub, managing user authentication (Firebase), file processing, database 
interactions (MongoDB), and communication with the AI layer.
• LLM Orchestrator (AI Layer): This is the core intellectual property of your project. It's 
a specialized component (likely a module within your Node.js backend) that orchestrates 
all interactions with the Gemini API. It handles data preparation (chunking, embedding), 
prompt engineering, and response parsing.
<br>
<div align="center"> <img src="https://i.imgur.com/rNn6t7j.png" alt="EduQuizMaster 
Architecture Diagram" style="width: 80%; border: 1px solid #ddd; border-radius: 8px; padding: 
10px;"> <figcaption><i>Simplified Architecture Diagram</i></figcaption> </div>
2. Detailed Features & User Experience
A. File Ingestion & Processing
• User Upload: The user lands on a clean, minimal dashboard and uploads a PDF file.
• Server-side Handling: The Node.js backend receives the file and a unique ID is 
generated for it. The file is temporarily stored on the server or a cloud storage service like 
Firebase Storage.
• PDF Parsing: The server uses a library like pdf-parse or a similar tool to extract raw 
text content from the PDF.
• Text Chunking: The extracted text is not sent to the AI all at once. It's broken into 
smaller, manageable "chunks" (e.g., 800-1000 characters with a 200-character overlap). 
This is a crucial step for Retrieval-Augmented Generation (RAG).
B. Quiz Generation (The Core AI Magic)
This is where the Gemini API and your LLM Orchestrator shine. The process is a RAG pipeline.
1. Embedding Generation:
o Input: Each text chunk is sent to the Gemini Embedding API.
o Output: The Gemini API returns a high-dimensional vector (a list of numbers) 
that represents the semantic meaning of that chunk.
o Storage: These vectors, along with metadata (like the original text chunk and 
page number), are stored in a vector database (e.g., MongoDB with its Vector 
Search index).
2. Prompt Engineering:
o The User Request: The user specifies the number of questions, difficulty, and 
question type.
o Retrieval: Your LLM Orchestrator queries the vector database to find the top N
(e.g., 5-10) most semantically similar text chunks to the overall document. This is 
your "source of truth."
o Prompt Construction: A carefully crafted prompt is created. This prompt is the 
most critical part of the entire system. It combines a system prompt with the 
retrieved information.
o Example Prompt (for Gemini API):
JSON
[
 {
 "role": "user",
 "parts": [
 {
 "text": "Using ONLY the following text as your source 
material, generate 5 multiple-choice questions about the topic. 
For each question, provide 4 options, a correct answer, a 
detailed explanation, and cite the source page(s) from which the 
question was generated. The explanation should ONLY use 
information from the provided text. The output should be a 
single, valid JSON object."
 },
 {
 "text": "Source Text: [Insert the combined text from the 
retrieved chunks here, including metadata like 'Page 15: ...']"
 },
 {
 "text": "Output Format: { \"questions\": [ { 
\"question\": \"...\", \"options\": [\"...\", \"...\", \"...\", 
\"...\"], \"correct_answer\": \"...\", \"explanation\": \"...\", 
\"source_pages\": [15, 16] } ] }"
 }
 ]
 }
]
3. Generation & Parsing:
o Input to AI: The complete, constructed prompt is sent to the Gemini Pro API.
o Output from AI: Gemini returns a JSON object containing the generated quiz.
o Server-side Parsing: The backend validates and parses this JSON, storing the 
quiz in the database (e.g., MongoDB).
C. Adaptive Quiz Flow
This feature is a huge differentiator. It's not a simple quiz; it's a personalized learning tool.
• Logic: After a user submits an answer, the backend processes it.
• AI Analytics: The backend tracks the user's performance. Based on the logic you 
outlined (e.g., if answers >= 4/5 correct, increase difficulty), the backend 
modifies the next prompt sent to the LLM Orchestrator.
• Adaptive Prompt: The backend sends a new request to the LLM Orchestrator, but this 
time it includes a parameter for difficulty. The LLM Orchestrator then modifies its RAG 
prompt to ask Gemini for "more complex questions" or "easier questions" based on the 
user's performance.
D. Analytics & Feedback Loop
This is where you demonstrate the value of your product beyond a simple quiz generator.
• Real-time Analytics: As the user takes the quiz, the backend logs each question, the 
user's answer, whether it was correct, the time taken, and the topic of the question 
(derived from the original chunk metadata).
• What Goes In:
o quiz_session_id
o user_id
o question_id
o user_answer
o is_correct (boolean)
o time_taken (in seconds)
• What Comes Out:
o Final Score: A simple percentage of correct answers.
o Topic-Based Performance: A breakdown showing which topics the user 
mastered and which they struggled with. For example, "You scored 80% on 
'Quantum Mechanics' but only 30% on 'Thermodynamics'." This is derived from 
the metadata you stored with each chunk/question.
o Actionable Insights: Based on the analytics, the platform could suggest, "You 
should review the 'Thermodynamics' section on pages 25-30."
3. Role of the Gemini API
The Gemini API is your powerful, creative engine. It's used in two primary places:
1. Text Embedding (Data Ingestion): The embedding model within the Gemini API (e.g., 
text-embedding-004) is used to convert your text chunks into numerical vectors. This is 
the foundation of your RAG system and allows for semantic search.
2. Generative AI (Quiz Creation): The generation model (e.g., gemini-pro) is the 
workhorse that reads your prompt and generates the quiz questions, options, answers, and 
explanations. Your prompt engineering is what makes the output high-quality, relevant, 
and well-structured.
Summary of AI usage:
• AI Input:
o Raw, chunked text from the PDF.
o User-defined parameters (number of questions, difficulty).
o The prompt that you carefully craft, which contains instructions and context.
• AI Output:
o High-dimensional vectors (embeddings) for text chunks.
o A structured JSON object representing the quiz.
• Where it's used:
o LLM Orchestrator: The sole consumer of the Gemini API. The rest of your 
application interacts with the orchestrator, not the API directly. This modularity is 
good for a hackathon.
This detailed plan provides a clear roadmap for a successful project. By focusing on the core 
RAG pipeline and the adaptive learning loop, you will have a compelling, demo-ready 
application that showcases genuine innovation.
System Architecture and Technology Stack
This architecture is designed for a modern, scalable web application that can handle real-time 
interactions and asynchronous processing, which is perfect for a hackathon.
1. Frontend (Client-Side)
• Framework: Next.js (React) - Chosen for its fast performance, excellent developer 
experience, and server-side rendering capabilities which ensure the initial page load is 
quick.
• Styling: Tailwind CSS - For rapidly building a beautiful, responsive, and modern user 
interface without writing custom CSS.
• Function:
o Handles user registration and login via the Firebase SDK.
o Provides a clean, intuitive UI for uploading files (PDFs) or pasting YouTube 
URLs.
o Displays the quiz interface, one question at a time.
o Shows real-time feedback (correct/incorrect).
o Renders the final performance analytics dashboard.
o Uses loading states and progress indicators to feel responsive while the backend 
works.
2. Backend (Server-Side)
• Framework: Node.js with Express - A lightweight, powerful, and fast framework 
perfect for building the API endpoints needed to connect the frontend to the database and 
AI services.
• Function:
o API Endpoints:
§ /upload: Receives the file/URL from the frontend.
§ /generate-quiz: Kicks off the asynchronous quiz generation process.
§ /quiz/:id: Fetches the generated questions for a specific document.
§ /submit-answer: Records user answers, calculates performance, and 
triggers the adaptive logic.
o Orchestration: Manages the entire flow from receiving a document to generating 
the final quiz.
3. Authentication
• Service: Firebase Authentication - Chosen for its simplicity and security. It provides a 
complete, easy-to-implement solution for user sign-up, login, and session management, 
saving you hours of development time.
4. Database
• Service: MongoDB - A NoSQL database that's flexible and easy to use with JavaScriptbased stacks. Its document-based structure is perfect for storing unstructured quiz data.
• Schemas:
o Users: Stores user information linked to their Firebase Auth UID.
o Documents: Contains metadata about uploaded files (e.g., filename, ownerId, 
status: 'PROCESSING' | 'DONE').
o Quizzes: Stores the questions, answers, explanations, difficulty, and related 
concepts for each document.
o Results: Tracks user performance, answers, and analytics for each quiz attempt.
5. AI Service & Processing Pipeline (The Core Magic)
• AI Model: Google's Gemini API - This is the engine of the application. We'll use it for 
multiple tasks due to its powerful multi-modal and reasoning capabilities.
• The Asynchronous Workflow: When a user uploads a file, the backend immediately 
returns a "processing" status. The actual work happens in the background to avoid 
locking up the UI.
1. Ingestion: The Node.js server receives the PDF or YouTube URL. For videos, it 
uses a library like youtube-dl to extract the audio and then a speech-to-text 
service (or Gemini's own capabilities) to get a transcript.
2. Chunking: The document/transcript is broken down into smaller, coherent 
chunks of text. This is crucial for the RAG (Retrieval-Augmented Generation) 
process.
3. Embedding & Vector Storage (Simplified for Hackathon): Each chunk is 
converted into a vector embedding using the Gemini API. For the hackathon, you 
can store these vectors directly in your MongoDB document to simplify the 
architecture (instead of a dedicated vector DB).
4. Initial Question Generation (RAG): The backend sends a prompt to the Gemini 
API, something like: "Here are chunks of text from a document. Generate 10 
multiple-choice questions based on this content. For each question, provide 4 
options, the correct answer, and a brief explanation. Identify the core topic for 
each question. Return this as a JSON array."
5. Adaptive Generation: When a user answers questions, the backend analyzes the 
topics they are struggling with. It then makes a new call to Gemini: "The user is 
struggling with [Topic X] and doing well on [Topic Y]. Generate 5 new 
questions: 3 focusing on [Topic X] at a slightly easier difficulty, and 2 on [Topic 
Y] at a harder difficulty."
Unique Features to Impress the Judges – Must be present 
These four features are not just "nice-to-haves"; they are exactly the kind of high-impact features 
that judges at a hackathon are looking for. They demonstrate a deep understanding of the 
problem, a clever use of the technology, and a focus on user experience.
Here's a breakdown of how to think about each of these features from a development perspective 
for a 24-hour hackathon.
1. "Explain It Like I'm 5" (ELI5) Button
Development Complexity: Low to Medium
• Frontend: A simple, visually distinct button next to the question explanation. When 
clicked, it should trigger a loading state (e.g., a spinner) to indicate a live API call is in 
progress. The new, simplified explanation should then appear below the original.
• Backend & LLM Orchestrator: This requires a new, dedicated API endpoint, for 
example, POST /api/eli5.
o Input: The endpoint receives the original, complex explanation from the 
frontend.
o AI Prompt: The LLM Orchestrator constructs a new, very specific prompt for the 
Gemini API. The prompt is the key here. It must contain two things:
1. A strong system instruction: "You are a teacher simplifying a complex 
topic. Explain the following text in a way that a 5-year-old could 
understand. Use simple words and analogies."
2. The original explanation text.
o Output: The Gemini API returns the simplified text. The backend sends this text 
back to the frontend.
Why it wows: It’s a perfect showcase of the LLM’s ability to change tone and persona on the 
fly. It's a real-time, personalized interaction that makes the user feel like the tool is truly 
intelligent and helpful, not just a static script.
2. Source-Linked Evidence
Development Complexity: Medium
• Backend & LLM Orchestrator: This feature is built directly into the initial quiz 
generation pipeline. You are already doing the heavy lifting by retrieving relevant text 
chunks. Now, you just need to add one more instruction to your RAG prompt.
o Modified Prompt: "Generate a question, an answer, and an explanation. Also, 
for each piece of information, provide a citation to the specific page or chunk 
ID from the source material provided. The output must be in a JSON format 
that includes a source_citation field for each question."
o Data Model: Your MongoDB quizzes collection must be updated to store this 
citation data with each question.
• Frontend: When displaying a question and its explanation, you simply render the 
source_citation data that you stored in the database. You can make it a simple text 
string or a clickable link that scrolls the user to a relevant section in a preview of the 
source PDF.
Why it wows: This feature is a direct answer to the most common critique of LLMs: 
hallucinations. By showing the source, you build immediate trust and demonstrate a robust, 
verifiable system. It's proof that your AI is grounded in the document, not just making things up. 
This is probably the most impressive feature on your list for a technical audience.
3. Conceptual Knowledge Heatmap
Development Complexity: Medium to High
• Backend & Analytics Engine: This requires a deeper level of data processing.
o Topic Tagging: During your initial chunking and embedding process, you can 
use the Gemini API again to automatically identify and tag the core concepts of 
each chunk.
§ Prompt Example: "Analyze the following text chunk. What is the main 
subject or concept? Return a single keyword or phrase. Text: [chunk 
text]." The backend stores this topic tag (e.g., "Thermodynamics," 
"Quantum Physics") with the chunk and the generated questions.
o Tracking: As users complete a quiz, the backend's analytics module records the 
user's performance for each question, including the associated topic tag. You can 
then aggregate this data.
§ Calculation: correct_answers_per_topic / 
total_questions_per_topic.
• Frontend: You will need a charting library (e.g., chart.js or recharts). The frontend 
requests the aggregated topic performance data from a new analytics API endpoint (GET 
/api/user/:userId/performance). The data is then used to render a visual chart where 
colors (red, yellow, green) are mapped to the performance percentage for each topic.
Why it wows: It transforms raw data into actionable insights. It shows that your tool is not just 
an assessment but a diagnostic platform. It's visually compelling and demonstrates a 
sophisticated understanding of data visualization and user-centered design.
4. Personalized "Weakness Report" Export
Development Complexity: Low to Medium
• Backend & LLM Orchestrator: This requires a new endpoint, e.g., POST 
/api/export-study-guide.
o Input: The backend gathers the data on all the questions the user got wrong, 
including the original explanations and the correct answers.
o AI Prompt: A final, powerful prompt is sent to the Gemini API.
§ Prompt Example: "Based on the user's incorrect answers on the topics of 
[list of topics] from a recent quiz, generate a concise, one-page study 
guide. Summarize the key points for each topic and highlight the crucial 
information. Make sure the tone is encouraging and helpful. The output 
should be a single block of text suitable for a study guide."
o Output: The Gemini API returns a formatted text document. The backend can 
then serve this as a downloadable text file, a PDF, or simply display it on the 
screen for easy copy-paste.
• Frontend: A simple button on the results page that triggers the API call and initiates the 
download or displays the generated text