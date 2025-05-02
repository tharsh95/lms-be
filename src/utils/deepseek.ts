// This file is deprecated and should be removed
// The functionality has been moved to OpenAI implementation

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Example function to use the model
export async function generateResponse(prompt: string) {
    // console.log('Generating response for prompt:', prompt);
    
    if (!prompt || prompt.trim().length === 0) {
        throw new Error("Prompt cannot be empty");
    }

    try {
        const messages = [
            { role: "system", content: "You are a helpful Educational Content Generation AI." },
            { role: "user", content: prompt }
        ];
        
        console.log('Sending request to DeepSeek...', messages);
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000', // Using localhost for development
                'X-Title': 'Educational App' // Your app name
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324",
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        console.log('Response from DeepSeek:', response);

        if (!response.ok) {
            const error = await response.json();
            console.error('API Error Response:', error); // Log the full error response
            throw new Error(`OpenRouter API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Received response from DeepSeek');
        
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error("Error generating response:", error);
        if (error instanceof Error) {
            throw new Error(`DeepSeek API Error: ${error.message}`);
        }
        throw error;
    }
}