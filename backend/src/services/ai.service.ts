import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeSymptoms = async (symptoms: string, medicalHistory: string, testResults: string) => {
  if (!process.env.OPENAI_API_KEY) {
    // Return a mock response if the API key is not configured
    return {
      analysis: 'This is a demo response for AI analysis. Please configure your OpenAI API key.',
      confidence: 0.85,
      recommendations: [
        'Consult with a healthcare professional',
        'Monitor symptoms closely',
        'Keep detailed records of any changes'
      ],
      disclaimer: 'This is a demo response. Configure OpenAI API key for real AI analysis.',
    };
  }

  const prompt = `
    Analyze the following medical information:
    Symptoms: ${symptoms}
    Medical History: ${medicalHistory}
    Test Results: ${testResults}

    Provide a professional medical analysis and recommendations.
    Always include disclaimers about consulting healthcare professionals.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Provide helpful analysis while emphasizing the need for professional medical consultation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    return {
      analysis,
      confidence: 0.85, // This is a placeholder value
      recommendations: [ // This is a placeholder value
        'Consult with a healthcare professional',
        'Monitor symptoms closely',
        'Keep detailed records of changes'
      ],
      disclaimer: 'This AI analysis is for informational purposes only and should not replace professional medical advice.'
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze symptoms with AI');
  }
};
