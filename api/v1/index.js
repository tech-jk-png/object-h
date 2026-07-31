import { Router } from 'express';

const v1Router = Router();

// Model identifier constants
const MODELS = {
  CHAT_GPT: 'openai/gpt-5-5-mini',
  CHAT_GEMINI: 'gemini/3-6_flash',
  IMAGE_BANANA: 'google/nano-banana-2',
  VIDEO_SEEDANCE: 'bytedance/doubao-seedance-2-0-fast-260128',
  TTS_ELEVEN_V3: 'elevenlabs/eleven_v3',
  TTS_ELEVEN_FLASH: 'elevenlabs/eleven_flash_v2-5',
};

// Middleware logger
v1Router.use((req, res, next) => {
  console.log(`[Object-H/v1] ${req.method} ${req.path}`);
  next();
});

// 1. GET /resources
v1Router.get('/resources', (req, res) => {
  return res.status(200).json({
    status: 'online',
    repository: 'Object-H',
    available_models: [
      { id: MODELS.CHAT_GPT, type: 'chat', description: 'GPT-5.5-mini' },
      { id: MODELS.CHAT_GEMINI, type: 'chat', description: 'Gemini 3.6-Flash' },
      { id: MODELS.IMAGE_BANANA, type: 'image', description: 'Nano Banana 2' },
      { id: MODELS.VIDEO_SEEDANCE, type: 'video', description: 'Jimeng Seedance 2.0 Fast' },
      { id: MODELS.TTS_ELEVEN_V3, type: 'audio', description: 'Eleven v3' },
      { id: MODELS.TTS_ELEVEN_FLASH, type: 'audio', description: 'Eleven Flash 2.5' },
    ],
  });
});

// 2. GET /localhost
v1Router.get('/localhost', (req, res) => {
  return res.status(200).json({
    message: 'Local execution environment active',
    host: req.headers.host || 'localhost:3000',
    protocol: req.protocol,
    timestamp: new Date().toISOString(),
  });
});

// 3. POST /chat/completions
v1Router.post('/chat/completions', async (req, res) => {
  const { messages, model = MODELS.CHAT_GPT } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: { message: '`messages` array is required.', type: 'invalid_request_error' },
    });
  }

  // Validate supported chat models
  const supportedChatModels = [MODELS.CHAT_GPT, MODELS.CHAT_GEMINI];
  if (!supportedChatModels.includes(model)) {
    return res.status(400).json({
      error: {
        message: `Unsupported model '${model}'. Choose from: ${supportedChatModels.join(', ')}`,
        type: 'invalid_model_error',
      },
    });
  }

  return res.status(200).json({
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `Response from Object-H engine using ${model}.`,
        },
        finish_reason: 'stop',
      },
    ],
  });
});

// 4. POST /images/generations
v1Router.post('/images/generations', async (req, res) => {
  const { prompt, model = MODELS.IMAGE_BANANA, n = 1 } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: { message: '`prompt` is required.', type: 'invalid_request_error' },
    });
  }

  return res.status(200).json({
    created: Math.floor(Date.now() / 1000),
    model: model,
    data: Array.from({ length: n }).map((_, idx) => ({
      url: `https://tech-jk-png.github.io/object-h/assets/generated_${idx + 1}.png`,
    })),
  });
});

// 5. POST /video/generations/
v1Router.post(['/video/generations', '/video/generations/'], async (req, res) => {
  const { prompt, model = MODELS.VIDEO_SEEDANCE, duration = 5 } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: { message: '`prompt` field is required.', type: 'invalid_request_error' },
    });
  }

  return res.status(202).json({
    id: `vgen_${Date.now()}`,
    model: model,
    status: 'processing',
    prompt: prompt,
    duration_seconds: duration,
    check_status_url: `/object-h/api/v1/resources`,
  });
});

export default v1Router;
