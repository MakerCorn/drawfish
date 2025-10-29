import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export class BedrockProvider {
    constructor(config) {
        this.region = config.region || 'us-east-1';
        this.modelId = config.modelId || 'anthropic.claude-v2';

        const clientConfig = {
            region: this.region
        };

        if (config.accessKey && config.secretKey) {
            clientConfig.credentials = {
                accessKeyId: config.accessKey,
                secretAccessKey: config.secretKey
            };
        }

        this.client = new BedrockRuntimeClient(clientConfig);
    }

    async generateDiagram(description) {
        const prompt = this.buildPrompt(description);

        try {
            let requestBody;

            // Format request based on model
            if (this.modelId.startsWith('anthropic.claude')) {
                requestBody = {
                    prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
                    max_tokens_to_sample: 2000,
                    temperature: 0.7,
                    top_p: 0.9
                };
            } else if (this.modelId.startsWith('amazon.titan')) {
                requestBody = {
                    inputText: prompt,
                    textGenerationConfig: {
                        maxTokenCount: 2000,
                        temperature: 0.7,
                        topP: 0.9
                    }
                };
            } else {
                throw new Error(`Unsupported model: ${this.modelId}`);
            }

            const command = new InvokeModelCommand({
                modelId: this.modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify(requestBody)
            });

            const response = await this.client.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));

            let generatedText;
            if (this.modelId.startsWith('anthropic.claude')) {
                generatedText = responseBody.completion;
            } else if (this.modelId.startsWith('amazon.titan')) {
                generatedText = responseBody.results[0].outputText;
            }

            const mermaidCode = this.extractMermaidCode(generatedText);
            return mermaidCode;

        } catch (error) {
            console.error('Bedrock error:', error.message);
            throw new Error(`Bedrock generation failed: ${error.message}`);
        }
    }

    buildPrompt(description) {
        return `You are a Mermaid diagram expert. Generate ONLY valid Mermaid diagram code based on the user's description. Do not include any explanations, comments, or markdown code blocks. Return only the raw Mermaid syntax.

User description: ${description}

Generate the Mermaid diagram code now:`;
    }

    extractMermaidCode(response) {
        // Remove markdown code blocks if present
        let code = response.trim();

        // Remove ```mermaid and ``` markers
        code = code.replace(/```mermaid\s*/gi, '');
        code = code.replace(/```\s*/g, '');

        // Get the first line to determine diagram type
        const lines = code.split('\n');
        const firstLine = lines[0].trim();

        // If first line doesn't start with a valid diagram type, try to find it
        const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
                           'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey', 'mindmap', 'timeline'];

        if (!validTypes.some(type => firstLine.startsWith(type))) {
            // Try to find the diagram type in the response
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (validTypes.some(type => line.startsWith(type))) {
                    code = lines.slice(i).join('\n');
                    break;
                }
            }
        }

        return code.trim();
    }
}
