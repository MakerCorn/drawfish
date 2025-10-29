import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { OllamaProvider } from './providers/ollama.js';
import { LMStudioProvider } from './providers/lmstudio.js';
import { AzureProvider } from './providers/azure.js';
import { BedrockProvider } from './providers/bedrock.js';
import { VertexProvider } from './providers/vertex.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Provider factory
function getProvider(settings) {
    const provider = settings.provider;
    const config = settings[provider];

    switch (provider) {
        case 'ollama':
            return new OllamaProvider(config);
        case 'lmstudio':
            return new LMStudioProvider(config);
        case 'azure':
            return new AzureProvider(config);
        case 'bedrock':
            return new BedrockProvider(config);
        case 'vertex':
            return new VertexProvider(config);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

// Generate diagram endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { description, settings } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        if (!settings || !settings.provider) {
            return res.status(400).json({ error: 'Provider settings are required' });
        }

        const provider = getProvider(settings);
        const mermaidCode = await provider.generateDiagram(description);

        res.json({ mermaidCode });

    } catch (error) {
        console.error('Generate error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate diagram' });
    }
});

// Export diagram endpoint
app.post('/api/export', async (req, res) => {
    try {
        const { mermaidCode, format } = req.body;

        if (!mermaidCode) {
            return res.status(400).json({ error: 'Mermaid code is required' });
        }

        if (!['svg', 'png', 'jpeg'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Must be svg, png, or jpeg' });
        }

        // Create HTML page with Mermaid diagram
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: white;
        }
        #diagram {
            display: inline-block;
        }
    </style>
</head>
<body>
    <div id="diagram">
        <pre class="mermaid">
${mermaidCode}
        </pre>
    </div>
    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
        `;

        if (format === 'svg') {
            // For SVG, we can extract it directly
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.waitForSelector('svg', { timeout: 10000 });

            const svg = await page.evaluate(() => {
                const svgElement = document.querySelector('svg');
                return svgElement ? svgElement.outerHTML : null;
            });

            await browser.close();

            if (!svg) {
                throw new Error('Failed to generate SVG');
            }

            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Content-Disposition', 'attachment; filename=diagram.svg');
            res.send(svg);

        } else {
            // For PNG and JPEG, we need to take a screenshot
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.waitForSelector('svg', { timeout: 10000 });

            const element = await page.$('#diagram');
            const screenshot = await element.screenshot({
                type: format === 'png' ? 'png' : 'jpeg',
                quality: format === 'jpeg' ? 90 : undefined,
                omitBackground: format === 'png'
            });

            await browser.close();

            const contentType = format === 'png' ? 'image/png' : 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename=diagram.${format}`);
            res.send(screenshot);
        }

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message || 'Failed to export diagram' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});
