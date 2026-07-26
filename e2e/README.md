# E2E Testing for Enterprise AI Knowledge Assistant

This directory contains end-to-end tests for the Enterprise AI Knowledge Assistant using Playwright.

## Prerequisites

- Node.js and npm installed
- Backend server running on `http://localhost:8080`
- Frontend dev server running on `http://localhost:4200`
- Playwright browsers installed (run `npx playwright install`)

## Test Structure

```
e2e/
├── tests/
│   ├── api/                    # API integration tests
│   │   ├── documents-api.spec.ts
│   │   ├── knowledge-bases-api.spec.ts
│   │   ├── collections-api.spec.ts
│   │   └── chat-api.spec.ts
│   ├── ui/                     # UI-driven E2E tests
│   │   ├── auth/
│   │   │   └── login.spec.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.spec.ts
│   │   ├── documents/
│   │   │   └── documents.spec.ts
│   │   ├── knowledge-bases/
│   │   │   └── knowledge-bases.spec.ts
│   │   ├── collections/
│   │   │   └── collections.spec.ts
│   │   └── chat/
│   │       └── chat.spec.ts
│   └── shared/                 # Shared test utilities
│       ├── helpers/
│       │   ├── api-client.ts
│       │   ├── data-factory.ts
│       │   └── database-cleaner.ts
│       ├── mocks/
│       │   └── ai-mock.ts
│       └── test-data/
│           └── sample-documents/
│               └── sample.txt
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Only UI Tests
```bash
npm run test:e2e:ui
```

### Run Only API Tests
```bash
npm run test:e2e:api
```

### Run Tests in Headed Mode (with browser window)
```bash
npm run test:e2e:headed
```

### Run Tests with Playwright UI (interactive debugging)
```bash
npm run test:e2e:debug
```

### Run Specific Test File
```bash
npx playwright test e2e/tests/api/documents-api.spec.ts
```

### Run Tests with Real AI API
```bash
USE_REAL_AI=true npm run test:e2e
```

## Environment Variables

- `BASE_URL`: Frontend URL (default: `http://localhost:4200`)
- `API_BASE_URL`: Backend API URL (default: `http://localhost:8080`)
- `USE_REAL_AI`: Use real AI API calls instead of mocks (default: `false`)

## Test Coverage

### API Integration Tests

**Documents API** (`documents-api.spec.ts`):
- Upload documents (PDF, TXT, DOCX)
- List all documents
- Delete documents
- Re-index documents
- Get document metadata
- Validation for file types and sizes

**Knowledge Bases API** (`knowledge-bases-api.spec.ts`):
- Create knowledge bases
- List knowledge bases
- Get specific knowledge base
- Update knowledge bases
- Delete knowledge bases

**Collections API** (`collections-api.spec.ts`):
- Create collections
- List collections
- Get collections by knowledge base
- Update collections
- Delete collections

**Chat API** (`chat-api.spec.ts`):
- Simple chat (no RAG)
- RAG-enhanced chat with document context
- Conversation management (start, continue, delete)
- Response regeneration
- Follow-up question generation
- AI response mocking (configurable)

### UI E2E Tests

**Authentication** (`auth/login.spec.ts`):
- Login form display
- Form validation
- Successful login flow
- Error handling for invalid credentials
- Loading states
- Accessibility checks

**Dashboard** (`dashboard/dashboard.spec.ts`):
- Statistics display
- Navigation to other sections
- Recent activity display
- Analytics data
- Loading and error states

**Documents** (`ui/documents/documents.spec.ts`):
- Document upload flow
- Document list display
- File validation
- Document deletion
- Version history
- Re-indexing
- Knowledge base and collection selection

**Knowledge Bases** (`ui/knowledge-bases/knowledge-bases.spec.ts`):
- Knowledge base list
- Create knowledge base
- Edit knowledge base
- Delete knowledge base
- Empty state handling
- Navigation to collections

**Collections** (`ui/collections/collections.spec.ts`):
- Collection list
- Filter by knowledge base
- Create collection
- Edit collection
- Delete collection
- Empty state handling

**Chat** (`ui/chat/chat.spec.ts`):
- Send messages
- Receive responses
- Display citations (RAG)
- Conversation history
- New conversation creation
- Response regeneration
- Follow-up questions
- Copy to clipboard
- Clear chat history
- Keyboard shortcuts (Enter, Shift+Enter)

## AI Mocking Strategy

The test suite uses a configurable AI mocking approach:

- **Default Mode**: All AI responses are mocked with predefined responses
- **Real Mode**: Set `USE_REAL_AI=true` to use actual OpenAI API calls
- **Mock Responses**: Defined in `e2e/tests/shared/mocks/ai-mock.ts`

### Mock Response Examples

- Simple chat: Generic responses for common queries
- RAG chat: Context-aware responses based on retrieved chunks
- Follow-up questions: Predefined suggestions
- Error scenarios: Simulated API failures

## Test Data Management

### Sample Documents
Test documents are located in `e2e/tests/shared/test-data/sample-documents/`:
- `sample.txt`: Sample text document for testing

### Database Cleanup
The `DatabaseCleaner` helper provides utilities to clean up test data:
- `cleanupAll()`: Clean up all test data
- `cleanupDocument()`: Clean up specific document
- `cleanupKnowledgeBase()`: Clean up specific knowledge base
- `cleanupCollection()`: Clean up specific collection
- `cleanupConversation()`: Clean up specific conversation

### Data Factory
The `TestDataFactory` helper generates test data:
- Knowledge base data
- Collection data
- Chat messages
- Document metadata
- Chat responses
- Citations

## Debugging

### Playwright Inspector
```bash
npx playwright test --ui
```

### Trace Viewer
After test failures, view traces:
```bash
npx playwright show-trace test-results/trace.zip
```

### HTML Report
View HTML test report:
```bash
npx playwright show-report
```

## CI/CD Integration

The tests are configured to run in CI environments with:
- Parallel execution
- Automatic retries
- Screenshot/video capture on failure
- JSON and JUnit report generation
- Trace files for debugging

## Notes

- Tests require both frontend (port 4200) and backend (port 8080) to be running
- The Playwright config automatically starts the frontend dev server
- Backend server must be started manually before running tests
- Tests clean up after themselves using the `DatabaseCleaner`
- Some tests may require actual test users to be set up in the backend

## Troubleshooting

### Backend Connection Issues
If tests fail with connection errors:
1. Ensure backend is running on `http://localhost:8080`
2. Check backend logs for errors
3. Verify API endpoints are accessible

### Frontend Not Starting
If the frontend dev server fails to start:
1. Check if port 4200 is already in use
2. Verify Angular dependencies are installed
3. Check Angular build logs

### Playwright Browser Issues
If Playwright browsers are not installed:
```bash
npx playwright install
```

### TypeScript Errors
If you see TypeScript errors in test files:
```bash
npx tsc --noEmit -p e2e/tsconfig.json
```
