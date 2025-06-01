const express = require('express');
const axios = require('axios');
const pdf = require('pdf-parse');
const fileUpload = require('express-fileupload');
const cors =require('cors');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// PDF to Text conversion
async function pdfToText(pdfBuffer) {
    try {
        const data = await pdf(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF');
    }
}

// AI Summary Generation
async function generateSummaryFromText(text) {
    const prompt = `
    Analyze the following resume text and provide a comprehensive professional summary:
    
    1. Career Overview: Start with a 2-3 sentence high-level summary
    2. Key Skills: Bullet list of 5-7 core competencies
    3. Career Highlights: 3-5 notable achievements
    4. Career Progression: Brief timeline of roles and progression
    5. Education/Certifications: Summary if mentioned
    
    Keep the tone professional and concise. Use markdown formatting with headings.
    
    Resume Text:
    ${text}
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        temperature: 0.7,
        max_tokens: 500
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    });

    return response.data.choices[0].message.content;
}

// Routes
app.post('/generate-summary', async (req, res) => {
    try {

        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const pdfBuffer = req.files.resume.data;
        const resumeText = await pdfToText(pdfBuffer);
        const summary = await generateSummaryFromText(resumeText)

        res.json({ 
            summary,
            originalText: resumeText // Optional: for debugging
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate summary' });
    }
});

app.post('/generate-summary-from-text', async (req, res) => {
    try {
        if (!req.body || !req.body.text) {
            return res.status(400).json({ error: 'No test provided' });
        }

        const summary = await generateSummaryFromText(req.body.text);

        res.json({ 
            summary,
            originalText: resumeText // Optional: for debugging
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate summary' });
    }
});

async function testAI() {
    const prompt = `
    What year was Elizabeth 2nd born?
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        temperature: 0.7,
        max_tokens: 500
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    });

    return response.data.choices[0].message.content;
}

app.post('/test', async (req, res) => {
    try {
        const summary = await testAI();

        res.json({ 
            summary
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate test' });
    }
});

// Start server

//console.log(`API key ${process.env.OPENAI_API_KEY}`)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));