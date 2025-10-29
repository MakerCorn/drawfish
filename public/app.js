// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
});

// State management
let currentSettings = {
    provider: 'ollama',
    ollama: { url: 'http://master.local:11434', model: 'gpt-oss:latest' },
    lmstudio: { url: 'http://localhost:1234', model: 'local-model' },
    azure: { endpoint: '', apiKey: '', deployment: '' },
    bedrock: { region: 'us-east-1', accessKey: '', secretKey: '', modelId: 'anthropic.claude-v2' },
    vertex: { projectId: '', location: 'us-central1', model: 'gemini-pro' }
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('aiProviderSettings');
    if (saved) {
        currentSettings = JSON.parse(saved);
        document.getElementById('providerSelect').value = currentSettings.provider;
        updateProviderConfig();
        populateProviderFields();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('aiProviderSettings', JSON.stringify(currentSettings));
}

// DOM Elements
const userInput = document.getElementById('userInput');
const generateBtn = document.getElementById('generateBtn');
const mermaidCode = document.getElementById('mermaidCode');
const updateDiagramBtn = document.getElementById('updateDiagramBtn');
const diagramPreview = document.getElementById('diagramPreview');
const loadingIndicator = document.getElementById('loadingIndicator');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const providerSelect = document.getElementById('providerSelect');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const exportSvgBtn = document.getElementById('exportSvgBtn');
const exportPngBtn = document.getElementById('exportPngBtn');
const exportJpegBtn = document.getElementById('exportJpegBtn');

// Event Listeners
generateBtn.addEventListener('click', generateDiagram);
updateDiagramBtn.addEventListener('click', updateDiagram);
settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
closeModalBtn.addEventListener('click', () => settingsModal.style.display = 'none');
providerSelect.addEventListener('change', updateProviderConfig);
saveSettingsBtn.addEventListener('click', handleSaveSettings);
copyCodeBtn.addEventListener('click', copyCode);
exportSvgBtn.addEventListener('click', () => exportDiagram('svg'));
exportPngBtn.addEventListener('click', () => exportDiagram('png'));
exportJpegBtn.addEventListener('click', () => exportDiagram('jpeg'));

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Generate diagram from user description
async function generateDiagram() {
    const description = userInput.value.trim();

    if (!description) {
        alert('Please describe the diagram you want to create');
        return;
    }

    generateBtn.disabled = true;
    loadingIndicator.style.display = 'flex';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description,
                settings: currentSettings
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate diagram');
        }

        const data = await response.json();
        mermaidCode.value = data.mermaidCode;
        await renderDiagram(data.mermaidCode);

    } catch (error) {
        console.error('Error generating diagram:', error);
        alert('Error generating diagram: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

// Update diagram from edited code
async function updateDiagram() {
    const code = mermaidCode.value.trim();

    if (!code) {
        alert('Please enter Mermaid code');
        return;
    }

    await renderDiagram(code);
}

// Render Mermaid diagram
async function renderDiagram(code) {
    try {
        // Clear previous content
        diagramPreview.innerHTML = '';

        // Create a unique ID for this diagram
        const id = 'mermaid-' + Date.now();

        // Render the diagram
        const { svg } = await mermaid.render(id, code);

        // Display the diagram
        diagramPreview.innerHTML = svg;

    } catch (error) {
        console.error('Error rendering diagram:', error);
        diagramPreview.innerHTML = `<div style="color: red; padding: 20px;">
            <strong>Error rendering diagram:</strong><br>
            ${error.message || 'Invalid Mermaid syntax'}
        </div>`;
    }
}

// Update provider configuration UI
function updateProviderConfig() {
    const provider = providerSelect.value;

    // Hide all configs
    document.querySelectorAll('.provider-config').forEach(config => {
        config.style.display = 'none';
    });

    // Show selected config
    document.getElementById(provider + 'Config').style.display = 'block';
}

// Populate provider fields with current settings
function populateProviderFields() {
    const provider = currentSettings.provider;

    if (provider === 'ollama') {
        document.getElementById('ollamaUrl').value = currentSettings.ollama.url;
        document.getElementById('ollamaModel').value = currentSettings.ollama.model;
    } else if (provider === 'lmstudio') {
        document.getElementById('lmstudioUrl').value = currentSettings.lmstudio.url;
        document.getElementById('lmstudioModel').value = currentSettings.lmstudio.model;
    } else if (provider === 'azure') {
        document.getElementById('azureEndpoint').value = currentSettings.azure.endpoint;
        document.getElementById('azureApiKey').value = currentSettings.azure.apiKey;
        document.getElementById('azureDeployment').value = currentSettings.azure.deployment;
    } else if (provider === 'bedrock') {
        document.getElementById('awsRegion').value = currentSettings.bedrock.region;
        document.getElementById('awsAccessKey').value = currentSettings.bedrock.accessKey;
        document.getElementById('awsSecretKey').value = currentSettings.bedrock.secretKey;
        document.getElementById('bedrockModel').value = currentSettings.bedrock.modelId;
    } else if (provider === 'vertex') {
        document.getElementById('vertexProjectId').value = currentSettings.vertex.projectId;
        document.getElementById('vertexLocation').value = currentSettings.vertex.location;
        document.getElementById('vertexModel').value = currentSettings.vertex.model;
    }
}

// Handle save settings
function handleSaveSettings() {
    const provider = providerSelect.value;
    currentSettings.provider = provider;

    if (provider === 'ollama') {
        currentSettings.ollama = {
            url: document.getElementById('ollamaUrl').value,
            model: document.getElementById('ollamaModel').value
        };
    } else if (provider === 'lmstudio') {
        currentSettings.lmstudio = {
            url: document.getElementById('lmstudioUrl').value,
            model: document.getElementById('lmstudioModel').value
        };
    } else if (provider === 'azure') {
        currentSettings.azure = {
            endpoint: document.getElementById('azureEndpoint').value,
            apiKey: document.getElementById('azureApiKey').value,
            deployment: document.getElementById('azureDeployment').value
        };
    } else if (provider === 'bedrock') {
        currentSettings.bedrock = {
            region: document.getElementById('awsRegion').value,
            accessKey: document.getElementById('awsAccessKey').value,
            secretKey: document.getElementById('awsSecretKey').value,
            modelId: document.getElementById('bedrockModel').value
        };
    } else if (provider === 'vertex') {
        currentSettings.vertex = {
            projectId: document.getElementById('vertexProjectId').value,
            location: document.getElementById('vertexLocation').value,
            model: document.getElementById('vertexModel').value
        };
    }

    saveSettings();
    settingsModal.style.display = 'none';
    alert('Settings saved successfully!');
}

// Copy code to clipboard
function copyCode() {
    const code = mermaidCode.value;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyCodeBtn.textContent = originalText;
        }, 2000);
    });
}

// Export diagram
async function exportDiagram(format) {
    const code = mermaidCode.value.trim();

    if (!code) {
        alert('No diagram to export');
        return;
    }

    try {
        const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mermaidCode: code,
                format: format
            })
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        // Get the blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error exporting diagram:', error);
        alert('Error exporting diagram: ' + error.message);
    }
}

// Initialize app
loadSettings();
