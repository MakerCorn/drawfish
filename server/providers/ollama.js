import axios from 'axios';

export class OllamaProvider {
    constructor(config) {
        this.baseUrl = config.url || 'http://localhost:11434';
        this.model = config.model || 'llama2';
    }

    async generateDiagram(description) {
        const prompt = this.buildPrompt(description);

        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            });

            const mermaidCode = this.extractMermaidCode(response.data.response);
            return mermaidCode;

        } catch (error) {
            console.error('Ollama error:', error.message);
            throw new Error(`Ollama generation failed: ${error.message}`);
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
