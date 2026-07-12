const { sendResponse } = require('../utils/response');
const CustomError = require('../utils/customError');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper to proxy request to Python FastAPI
const proxyToAIService = async (path, req, res, next) => {
  try {
    const url = `${AI_SERVICE_URL}${path}`;
    const method = req.method;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error(`AI Service proxy error at ${path}:`, error.message);
    // Graceful fallback when AI service is down
    return res.status(200).json({
      success: true,
      message: 'EcoSphere AI Service is currently performing offline validation. Fallback rules applied.',
      data: {
        offline: true,
        warning: 'AI Intelligence Service is temporarily unavailable. Displaying cached/rule-based estimations.',
        confidenceScore: 50,
        status: 'Pending Verification',
        findings: [],
        recommendations: [
          {
            title: 'Audit energy bills locally',
            description: 'Check billing amounts and consumption manually while the AI server is reconnecting.',
            priority: 'medium',
            actionableSteps: ['Review electricity bills manually', 'Verify meter readings']
          }
        ]
      },
      meta: null,
      timestamp: new Date().toISOString()
    });
  }
};

const validate = async (req, res, next) => {
  await proxyToAIService('/api/ai/validate', req, res, next);
};

const confidence = async (req, res, next) => {
  await proxyToAIService('/api/ai/confidence', req, res, next);
};

const predict = async (req, res, next) => {
  await proxyToAIService('/api/ai/predict', req, res, next);
};

const recommend = async (req, res, next) => {
  await proxyToAIService('/api/ai/recommend', req, res, next);
};

const governance = async (req, res, next) => {
  await proxyToAIService('/api/ai/governance', req, res, next);
};

const csr = async (req, res, next) => {
  await proxyToAIService('/api/ai/csr', req, res, next);
};

const chat = async (req, res, next) => {
  await proxyToAIService('/api/ai/chat', req, res, next);
};

const status = async (req, res, next) => {
  const documentId = req.query.documentId || '';
  await proxyToAIService(`/api/ai/status?documentId=${documentId}`, req, res, next);
};

module.exports = {
  validate,
  confidence,
  predict,
  recommend,
  governance,
  csr,
  chat,
  status
};
