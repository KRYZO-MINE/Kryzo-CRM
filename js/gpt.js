const GPT = (() => {
    const getSettings = () => {
        const s = Storage.get('settings') || {};
        return s.openai || { apiKey: '', transcribeModel: 'whisper-1', analyzeModel: 'gpt-4o-mini', autoAnalyze: true };
    };

    const hasKey = () => !!getSettings().apiKey;

    const ANALYSIS_PROMPT = `You are an expert sales coach and Tally ERP business analyst. Analyze the following sales call transcript between a Tally sales representative and a customer.

Return a STRICT valid JSON object (no markdown, no code fences, NO extra text outside JSON) with these exact keys:
{
  "summary": "2-3 line short summary of the call",
  "errors": [
    "list of specific mistakes the rep made: wrong product info, pricing errors, missed important questions, did not mention TSS/increment benefits, rude tone, etc. Empty array if none."
  ],
  "opportunities": [
    "List concrete revenue opportunities: TSS renewal/upgrade, Tally ERP to Prime upgrade, Silver to Gold, Add User, TallyDrive, E-Invoice, Add-on, follow-up demo etc. Empty array if none."
  ],
  "customer_pain_points": [
    "List specific customer problems, complaints, objections, needs they mentioned. Empty array if none."
  ],
  "follow_up_suggestion": {
    "action": "Exact next action the rep should take (e.g. Call back with Tally Prime demo invitation)",
    "date": "Suggested follow-up date as ISO string YYYY-MM-DD within next 7 days based on conversation context, or today if unclear",
    "remark": "Short remark/note to attach"
  },
  "lead_status_update": "Pick ONE most relevant status from: Pending | Called | Interested | Demo Required | TSS Required | Follow-up | Completed | Not Interested",
  "category_suggestion": "Suggested lead category: Demo | TSS | Increment | New Customer | Follow-up | Other"
}

TRANSCRIPT:
`;

    const safeJSONParse = (text) => {
        try {
            const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
            }
            return JSON.parse(cleaned);
        } catch (e) {
            throw new Error('Failed to parse analysis response: ' + e.message + '\nRaw: ' + text.slice(0, 300));
        }
    };

    const transcribe = async (file) => {
        const cfg = getSettings();
        if (!cfg.apiKey) throw new Error('OpenAI API key not set. Go to Settings → OpenAI Integration.');
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) throw new Error('File too large. Max 25 MB supported by Whisper API.');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', cfg.transcribeModel || 'whisper-1');
        formData.append('response_format', 'verbose_json');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + cfg.apiKey },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
            throw new Error('Transcription failed: ' + (err.error?.message || res.statusText));
        }
        return res.json();
    };

    const analyze = async (transcript) => {
        const cfg = getSettings();
        if (!cfg.apiKey) throw new Error('OpenAI API key not set. Go to Settings → OpenAI Integration.');

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + cfg.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: cfg.analyzeModel || 'gpt-4o-mini',
                temperature: 0.3,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'You are a sales intelligence assistant that always responds with valid JSON only.' },
                    { role: 'user', content: ANALYSIS_PROMPT + '\n' + transcript }
                ]
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
            throw new Error('Analysis failed: ' + (err.error?.message || res.statusText));
        }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        return safeJSONParse(content);
    };

    const transcribeAndAnalyze = async (file, onProgress) => {
        onProgress && onProgress('stage', 'transcribing');
        const transResult = await transcribe(file);
        const transcriptText = transResult.text || '';

        let analysis = null;
        const cfg = getSettings();
        if (cfg.autoAnalyze && transcriptText) {
            onProgress && onProgress('stage', 'analyzing');
            analysis = await analyze(transcriptText);
        }

        return {
            transcript: transcriptText,
            transcriptRaw: transResult,
            analysis
        };
    };

    return { transcribe, analyze, transcribeAndAnalyze, hasKey, getSettings };
})();
