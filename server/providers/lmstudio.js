import axios from 'axios';

export class LMStudioProvider {
  constructor(config) {
    this.baseUrl = config.url || 'http://localhost:1234';
    this.model = config.model || 'local-model';
  }

  async generateDiagram(description) {
    const prompt = this.buildPrompt(description);

    try {
      const response = await axios.post(`${this.baseUrl}/v1/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a Mermaid diagram expert. Generate ONLY valid Mermaid diagram code. Do not include explanations or markdown code blocks. Return only raw Mermaid syntax.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const mermaidCode = this.extractMermaidCode(response.data.choices[0].message.content);
      return mermaidCode;
    } catch (error) {
      console.error('LM Studio error:', error.message);
      throw new Error(`LM Studio generation failed: ${error.message}`);
    }
  }

  buildPrompt(description) {
    return `Generate a Mermaid diagram for: ${description}`;
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
    const validTypes = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'gantt',
      'pie',
      'gitGraph',
      'journey',
      'mindmap',
      'timeline'
    ];

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
