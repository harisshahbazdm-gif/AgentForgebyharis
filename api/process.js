// Vercel Serverless Function - Handles Claude API calls securely
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agent, csvData, totalRows } = req.body;

    if (!agent || !csvData) {
      return res.status(400).json({ error: 'Missing agent or csvData' });
    }

    // Prompts for each agent type
    const prompts = {
      cleaning: `You are a Data Cleaning AI Agent processing an uploaded file.

Return ONLY valid JSON (absolutely no markdown fences, no prose):
{"metrics":{"processed":${totalRows},"changed":<int>,"flagged":<int>,"confidence":"<e.g. 0.93>"},"table":[{"<col>":"<cleaned value>",...,"_status":"changed|ok|flagged|DUPLICATE","_changes":["describe each change"]}],"reviewItems":[{"field":"<col>","original":"<old>","suggested":"<new>","reason":"<why>","confidence":<0-1>}],"summary":"<one line>"}
Rules: proper-case names/cities, mark exact duplicate rows as DUPLICATE, flag invalid emails (missing @ or domain) for review, standardise status (active/inactive/pending), trim whitespace.
FILE DATA (${totalRows} total rows, first 100 shown):
${csvData}`,

      cases: `You are a Case List Builder AI Agent.
Return ONLY valid JSON (no fences):
{"metrics":{"processed":${totalRows},"changed":<int>,"flagged":<int>,"confidence":"0.91"},"table":[{"Case_ID":"CASE-001","Title":"<short>","Category":"Bug|Feature|Urgent|Performance|Security|Request","Priority":"High|Medium|Low","Description":"<one line>","Status":"Open","Assigned_To":"TBD","_status":"new"}],"reviewItems":[],"summary":"<summary>"}
FILE DATA:
${csvData}`,

      category: `You are a Category Standardizer Agent.
Standard taxonomy: Electronics, Electronics - Accessories, Furniture, Office Supplies, Clothing, Sports & Outdoors, Food & Beverages, Books & Media, Health & Beauty, Software, Services, Other
Return ONLY valid JSON (no fences):
{"metrics":{"processed":${totalRows},"changed":<int>,"flagged":<int>,"confidence":"0.89"},"table":[{<all original cols>,"Standardized_Category":"<clean>","Confidence":<0-1>,"_status":"changed|ok|flagged"}],"reviewItems":[{"field":"Category","original":"<raw>","suggested":"<clean>","reason":"Standardised","confidence":<0-1>}],"summary":"<summary>"}
FILE DATA:
${csvData}`,

      reshape: `You are a Data Reshaper Agent. Convert wide/pivot format to normalised long format.
Return ONLY valid JSON (no fences):
{"metrics":{"processed":${totalRows},"changed":<new rows created>,"flagged":0,"confidence":"0.96"},"table":[{<normalised: ID/Name col, Metric, Period, Value, Target if present, Variance>,"_status":"new"}],"reviewItems":[],"summary":"<transformation description>"}
FILE DATA:
${csvData}`,

      exceptions: `You are an Exception Detector Agent.
Return ONLY valid JSON (no fences):
{"metrics":{"processed":${totalRows},"changed":0,"flagged":<count>,"confidence":"0.94"},"table":[{<all original cols>,"Exception_Type":"None|Outlier|Invalid|Missing|Suspicious|Duplicate","Severity":"High|Medium|Low|None","Exception_Detail":"<detail or OK>","_status":"flagged|ok"}],"reviewItems":[{"field":"<col>","original":"<val>","suggested":"REVIEW","reason":"<why>","confidence":<0-1>}],"summary":"<summary>"}
FILE DATA:
${csvData}`,

      review: `You are a Manual Review Agent.
Return ONLY valid JSON (no fences):
{"metrics":{"processed":${totalRows},"changed":0,"flagged":<proposals>,"confidence":"0.88"},"table":[{<all original cols unchanged>,"_status":"pending|ok"}],"reviewItems":[{"field":"<col>","original":"<current>","suggested":"<better>","reason":"<specific reason>","confidence":<0-1>}],"summary":"<summary>"}
FILE DATA:
${csvData}`
    };

    const prompt = prompts[agent];
    if (!prompt) {
      return res.status(400).json({ error: 'Invalid agent type' });
    }

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.text();
      console.error('Anthropic API error:', error);
      return res.status(anthropicResponse.status).json({ 
        error: 'AI processing failed', 
        details: error 
      });
    }

    const data = await anthropicResponse.json();
    const text = data.content.map(c => c.text || '').join('');
    
    // Clean and parse JSON response
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (e) {
      // Try to extract JSON from text
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
