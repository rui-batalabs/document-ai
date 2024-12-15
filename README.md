# AI-Powered Document Analysis Platform with LLM Integration (Document-AI)

## Team Members
- Richard Ortiz
- Jonathan Morgan Nishimura
- Vikrant Bakshi
- Cem Sahin
- Rui Costa

## Introduction

The AI-Powered Document Analysis Platform allows users to upload documents, process their content using AI, and interact with the information through a large language model (LLM). Users can receive document summaries, ask specific questions, and get contextual answers, making document analysis faster and more efficient. The platform is especially useful for handling business reports, legal contracts, research papers, and other document-heavy industries.

## Motivation

Document analysis can be time-consuming, especially when dealing with long and complex texts. The platform provides an easy way for users to interact with documents, enabling them to extract key information and insights without reading the entire content. Users can upload documents, receive AI-generated summaries, and ask targeted questions to better understand important points. This makes the platform ideal for legal teams, business analysts, researchers, and more.

## Install


### 1. Install Dependencies
Run the following command to install all required dependencies:
```bash
npm install
```

### 2. Set Up the Environment
For **Windows**:
```powershell
$env:OPENAI_API_KEY="your-openai-api-key"
```

For **Mac/Linux**:
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

Replace `your-openai-api-key` with your actual OpenAI API key.

---

### 3. Seed the Database
Run the following command to create a test user and upload a test document:
```bash
npm run seed
```

- This will create a test user with the following credentials:
    - **Email:** `user@example.com`
    - **Password:** `Password#123`
- It will also upload a test document (`240511514v2.pdf`) with generated embeddings, word count, summary, and text chunks.


### 4. Start the Application
Run the following command to launch the application:
```bash
npm start
```

The server will run on `http://localhost:3000`.


## Core Features

### Landing Page
- Explains the purpose and motivation behind the service.
- Allows users to upload documents and search through previously uploaded documents.

### Document Upload and Parsing
- Supports uploading PDFs.
- AI parses the document structure, extracting headings, sections, metadata like authors, dates, and document types.

### Document Summary
- Generates LLM-based summaries of the document, offering both brief and detailed options.
- Highlights important sections or information within the document.

### Interactive Question-Answering
- Users can query the document with questions like "What are the key takeaways?" or "When was this agreement signed?" and receive responses based on the document’s content.

### User Profile
- Created upon user registration, displays username, profile picture, and a list of all documents uploaded or queried.
- Users can view and manage their past interactions and document queries.

## Extra Features

### Add support for Word Document Upload and Parsing

### Sentiment and Topic Analysis
- Analyzes the sentiment of the document, useful for feedback reports and customer reviews.
- Identifies key topics discussed in the document using topic modeling.

### Searchable Interface
- Users can search within the document using keywords or phrases, with context-aware results provided by the LLM.

### Exportable Insights
- Summaries and Q&A results can be exported in formats like PDF or CSV for reports or sharing with team members.

### Admin Account
- Admin functionality for moderating inappropriate content or resolving document-related issues.
