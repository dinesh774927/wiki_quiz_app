import axios from 'axios';

/**
 * Backend Service Configuration
 * Centralized API client for all quiz-related operations.
 */
const BASE_GATEWAY_URL = 'http://localhost:8000/api';

const client = axios.create({
    baseURL: BASE_GATEWAY_URL,
    timeout: 30000, // 30s timeout for LLM generation tasks
});

/**
 * Initiates the creation of a new interactive quiz from a Wikipedia URL.
 */
export const createQuizSession = async (articleUrl: string, secretToken?: string) => {
    const response = await client.post('/generate', {
        url: articleUrl,
        api_key: secretToken
    });
    return response.data;
};

/**
 * Retrieves a list of all previously generated quizzes (history).
 */
export const fetchQuizHistory = async () => {
    const response = await client.get('/history');
    return response.data;
};

/**
 * Fetches the full dataset and questions for a specific quiz record.
 */
export const fetchQuizDetails = async (id: number) => {
    const response = await client.get(`/quiz/${id}`);
    return response.data;
};

/**
 * Submits user responses for evaluation and score calculation.
 */
export const submitAssessmentAnswers = async (id: number, selections: Record<number, string>) => {
    const response = await client.put(`/quiz/${id}/score`, {
        answers: selections
    });
    return response.data;
};
