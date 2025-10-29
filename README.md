# AI Mermaid Diagram Generator

A powerful web application that uses AI to generate Mermaid diagrams from natural language descriptions. Supports multiple AI providers including Ollama, LM Studio, Azure OpenAI, Amazon Bedrock, and Google Vertex AI.

## Features

- Generate Mermaid diagrams using natural language descriptions
- Support for multiple AI providers:
  - Ollama (local)
  - LM Studio (local)
  - Azure OpenAI
  - Amazon Bedrock
  - Google Vertex AI
- Live diagram preview with Mermaid.js
- Edit generated Mermaid code
- Export diagrams to SVG, PNG, or JPEG
- Clean, modern UI with responsive design
- No chat responses - only diagram generation

## Prerequisites

- Node.js 18+ installed
- At least one AI provider configured:
  - **Ollama**: Install from [ollama.ai](https://ollama.ai)
  - **LM Studio**: Install from [lmstudio.ai](https://lmstudio.ai)
  - **Azure OpenAI**: Azure subscription with OpenAI service
  - **Amazon Bedrock**: AWS account with Bedrock access
  - **Google Vertex AI**: GCP project with Vertex AI enabled

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional - you can also configure via UI):
```bash
cp .env.example .env
```

4. Edit `.env` with your provider settings (or configure via the UI settings dialog)

## Usage

### Starting the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Configuring AI Providers

Click the settings button (⚙️) in the top right to configure your AI provider:

#### Ollama
1. Install Ollama: `https://ollama.ai`
2. Pull a model: `ollama pull llama2`
3. Configure in settings:
   - URL: `http://localhost:11434` (default)
   - Model: `llama2` (or your preferred model)

#### LM Studio
1. Install LM Studio: `https://lmstudio.ai`
2. Download and load a model
3. Start the local server in LM Studio
4. Configure in settings:
   - URL: `http://localhost:1234` (default)
   - Model: Your loaded model name

#### Azure OpenAI
1. Create an Azure OpenAI resource
2. Deploy a model (e.g., GPT-3.5 or GPT-4)
3. Configure in settings:
   - Endpoint: Your Azure OpenAI endpoint
   - API Key: Your API key
   - Deployment Name: Your deployment name

#### Amazon Bedrock
1. Enable Amazon Bedrock in your AWS account
2. Request access to models (e.g., Claude)
3. Configure in settings:
   - Region: Your AWS region
   - Access Key ID: Your AWS access key
   - Secret Access Key: Your AWS secret key
   - Model ID: e.g., `anthropic.claude-v2`

#### Google Vertex AI
1. Create a GCP project
2. Enable Vertex AI API
3. Create a service account and download credentials
4. Configure in settings:
   - Project ID: Your GCP project ID
   - Location: e.g., `us-central1`
   - Model: e.g., `gemini-pro`
5. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
   ```

### Generating Diagrams

1. Enter a description of the diagram you want in the text area
2. Click "Generate Diagram"
3. The AI will generate Mermaid code
4. The diagram will render automatically in the preview panel
5. Edit the Mermaid code if needed and click "Update Diagram"

### Example Descriptions

- "Create a flowchart showing the user authentication process with login, verification, and success/error paths"
- "Generate a sequence diagram for an online shopping checkout process between customer, frontend, backend, and payment gateway"
- "Make a class diagram for a blog system with User, Post, and Comment entities"
- "Create a gantt chart for a website development project with design, development, testing, and deployment phases"
- "Generate an entity relationship diagram for an e-commerce database"

### Exporting Diagrams

Click the export buttons (SVG, PNG, or JPEG) to download the diagram in your preferred format:
- **SVG**: Vector format, best for editing and scaling
- **PNG**: Raster format with transparency
- **JPEG**: Raster format, smaller file size

## Supported Diagram Types

The application supports all Mermaid diagram types:

- Flowcharts (`flowchart` or `graph`)
- Sequence Diagrams (`sequenceDiagram`)
- Class Diagrams (`classDiagram`)
- State Diagrams (`stateDiagram`)
- Entity Relationship Diagrams (`erDiagram`)
- Gantt Charts (`gantt`)
- Pie Charts (`pie`)
- Git Graphs (`gitGraph`)
- User Journey Diagrams (`journey`)
- Mind Maps (`mindmap`)
- Timelines (`timeline`)

## Architecture

```
/drawfish
├── public/              # Frontend files
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── server/             # Backend files
│   ├── index.js        # Express server
│   └── providers/      # AI provider implementations
│       ├── ollama.js
│       ├── lmstudio.js
│       ├── azure.js
│       ├── bedrock.js
│       └── vertex.js
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### POST /api/generate
Generate a Mermaid diagram from a description.

**Request:**
```json
{
  "description": "Create a flowchart...",
  "settings": {
    "provider": "ollama",
    "ollama": {
      "url": "http://localhost:11434",
      "model": "llama2"
    }
  }
}
```

**Response:**
```json
{
  "mermaidCode": "flowchart TD\n    A[Start] --> B[End]"
}
```

### POST /api/export
Export a Mermaid diagram to SVG, PNG, or JPEG.

**Request:**
```json
{
  "mermaidCode": "flowchart TD\n    A[Start] --> B[End]",
  "format": "svg"
}
```

**Response:**
Binary file data (image)

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Troubleshooting

### Ollama connection failed
- Ensure Ollama is running: `ollama serve`
- Check the URL is correct: `http://localhost:11434`
- Verify the model is installed: `ollama list`

### LM Studio connection failed
- Ensure LM Studio local server is running
- Check the port number (default: 1234)
- Verify a model is loaded in LM Studio

### Azure OpenAI errors
- Verify your endpoint URL format
- Check API key is valid
- Ensure deployment name matches your Azure deployment

### Bedrock errors
- Verify AWS credentials are correct
- Check model access has been granted in AWS console
- Ensure correct region is configured

### Vertex AI errors
- Check GOOGLE_APPLICATION_CREDENTIALS environment variable
- Verify service account has necessary permissions
- Ensure Vertex AI API is enabled in GCP

### Diagram rendering fails
- Check Mermaid code syntax
- Look for error messages in browser console
- Try simplifying the diagram

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
