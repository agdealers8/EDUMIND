
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, TestPaper, DailySchedule, LearningContent, UserProfile, ResourceLink } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJsonResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(text || "The AI could not process this information.");
    }
    const cleaned = jsonMatch[0].trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Invalid format received. Please try again.");
  }
};

export const geminiService = {
  async validateProfile(params: { level: string; board: string; grade: string }): Promise<{ isValid: boolean; message?: string }> {
    try {
      const prompt = `Validate if the following educational info exists: Level: ${params.level}, Board: ${params.board}, Grade: ${params.grade}. Return JSON: {"isValid": boolean, "message": string}.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return cleanJsonResponse(response.text);
    } catch (err) {
      return { isValid: true };
    }
  },

  async generateQuiz(params: {
    syllabus: string;
    book: string;
    chapter: string;
    topic: string;
    count: number;
    difficulty: string;
    language: string;
  }): Promise<QuizData> {
    try {
      const prompt = `Generate a high-quality MCQ quiz in ${params.language}. 
      Book: ${params.book}, Chapter: ${params.chapter}, Topic: ${params.topic}.
      Difficulty: ${params.difficulty}.
      
      CRITICAL INSTRUCTION: You MUST generate EXACTLY ${params.count} unique questions. 
      DO NOT shorten the list to 5 or 10. If I ask for 30, generate 30.
      Each MCQ must have EXACTLY 4 options (A, B, C, D).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["title", "questions"]
          }
        }
      });
      return cleanJsonResponse(response.text);
    } catch (err: any) {
      throw new Error("Quiz generation failed. Please try again with a slightly different count or topic.");
    }
  },

  async generateTest(params: {
    board: string;
    grade: string;
    subject: string;
    chapters: string;
    duration: string;
    difficulty: string;
    language: string;
    totalMarks: number;
    customInstructions?: string;
  }): Promise<TestPaper> {
    try {
      const prompt = `Act as an expert examiner. Generate a professional test paper for ${params.board}, Grade ${params.grade}, Subject ${params.subject}.
      Target Total Marks: ${params.totalMarks}. Duration: ${params.duration}. Difficulty: ${params.difficulty}. Language: ${params.language}.
      Chapters Covered: ${params.chapters}.
      
      SPECIFIC RULES:
      1. MCQs must have EXACTLY 4 options (A, B, C, D).
      2. Provide a detailed marking scheme/answer for every single question (MCQ, Short, Long).
      3. Distribute marks logically according to the ${params.board} pattern.
      4. ${params.customInstructions ? `Special Instructions: ${params.customInstructions}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              totalMarks: { type: Type.NUMBER },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionTitle: { type: Type.STRING },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.NUMBER },
                          text: { type: Type.STRING },
                          marks: { type: Type.NUMBER },
                          type: { type: Type.STRING },
                          options: { type: Type.ARRAY, items: { type: Type.STRING } },
                          answer: { type: Type.STRING },
                          explanation: { type: Type.STRING }
                        },
                        required: ["id", "text", "marks", "type", "answer"]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return cleanJsonResponse(response.text);
    } catch (err: any) {
      throw new Error("Test generation failed. Please check your inputs.");
    }
  },

  async getPastPaperLinks(profile: UserProfile): Promise<ResourceLink[]> {
    try {
      const query = `Past papers for ${profile.board} ${profile.grade}.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
      });
      return cleanJsonResponse(response.text);
    } catch (err: any) {
      throw new Error("Search failed.");
    }
  },

  async getLearningHelper(topic: string, profile: UserProfile): Promise<LearningContent> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Explain "${topic}" for ${profile.level}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING },
              visualDescription: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              examples: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["topic", "explanation", "visualDescription", "steps", "examples", "summary"]
          }
        }
      });
      return cleanJsonResponse(response.text);
    } catch (err: any) {
      throw new Error("Failed to generate learning helper content.");
    }
  },

  async generateStudyPlan(params: any): Promise<DailySchedule[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a detailed weekly study plan for ${params.userProfile.name}, Level: ${params.userProfile.level}, Syllabus: ${params.userProfile.syllabus}. 
        Free hours: ${params.freeHours}, Exam date: ${params.examDate}, Intensity: ${params.intensity}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                sessions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      topic: { type: Type.STRING }
                    },
                    required: ["time", "activity", "subject", "topic"]
                  }
                }
              },
              required: ["day", "sessions"]
            }
          }
        }
      });
      return cleanJsonResponse(response.text);
    } catch (err: any) {
      throw new Error("Failed to generate study plan.");
    }
  }
};
