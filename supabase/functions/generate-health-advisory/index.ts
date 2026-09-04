// ==============================================================================
// AirAware AI: Supabase Edge Function - generate-health-advisory
// Runs securely in Deno with GEMINI_API_KEY server-side secrets.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    // 2. Parse request payload
    const body = await req.json();
    const { location, weather, aqi, userProfile, riskAssessment } = body;

    if (!location || !weather || !aqi || !userProfile || !riskAssessment) {
      return new Response(
        JSON.stringify({ error: 'Missing required environmental or profile parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Authenticate user if JWT is provided
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    // 4. Construct Clinical LLM Prompt
    const systemInstruction = `You are AirAware AI, an evidence-based clinical environmental health intelligence system.
Analyze the user's specific health vulnerability profile and live atmospheric telemetry to generate a personalized, empathetic, yet actionable clinical health advisory.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "headline": "Short compelling status headline (under 10 words)",
  "summary": "Clinical narrative explaining why current conditions impact their specific health condition and occupation (3-4 sentences)",
  "recommendedActions": ["Specific preventive action 1", "Specific preventive action 2", "Specific preventive action 3", "Specific preventive action 4"],
  "considerAvoiding": ["High-risk activity to avoid 1", "High-risk activity to avoid 2"],
  "safeOutdoorWindows": ["Morning window e.g. 06:00 AM – 08:30 AM", "Evening window e.g. 06:30 PM – 08:30 PM"],
  "hydrationTargetLiters": 3.0,
  "maskRecommendation": "None" | "Recommended" | "Mandatory N95/FFP2",
  "confidenceScore": 0.95
}`;

    const promptText = `
LOCATION: ${location}

ATMOSPHERIC TELEMETRY:
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h (${weather.windDirection})
- UV Index: ${weather.uvIndex} (${weather.uvLevel})
- Weather Condition: ${weather.condition}
- Air Quality Index (US EPA): ${aqi.aqi} (${aqi.category})
- Dominant Pollutant: ${aqi.dominantPollutant}
- PM2.5: ${aqi.pollutants?.pm25?.value ?? 'N/A'} µg/m³
- PM10: ${aqi.pollutants?.pm10?.value ?? 'N/A'} µg/m³
- NO2: ${aqi.pollutants?.no2?.value ?? 'N/A'} µg/m³
- Ozone: ${aqi.pollutants?.o3?.value ?? 'N/A'} µg/m³

USER HEALTH PROFILE:
- Age Group: ${userProfile.ageGroup}
- Health Conditions: ${userProfile.healthConditions?.join(', ') || 'No Known Condition'}
- Occupation: ${userProfile.occupation}
- Activity Level: ${userProfile.activityLevel}

DETERMINISTIC RISK ASSESSMENT:
- Pollution Risk: ${riskAssessment.pollutionRisk} (${riskAssessment.details?.pollution?.score}/100)
- Heat Risk: ${riskAssessment.heatRisk} (${riskAssessment.details?.heat?.score}/100)
- UV Risk: ${riskAssessment.uvRisk} (${riskAssessment.details?.uv?.score}/100)
- Overall Compound Risk: ${riskAssessment.overallRisk} (${riskAssessment.details?.overall?.score}/100)
`;

    // 5. Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${promptText}` }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API Error:', errText);
      throw new Error(`Gemini API responded with status ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsedAdvisory = JSON.parse(rawContent);

    const advisoryPayload = {
      headline: parsedAdvisory.headline || 'Environmental Health Advisory',
      summary: parsedAdvisory.summary || 'Live advisory generated from current atmospheric telemetry.',
      recommendedActions: Array.isArray(parsedAdvisory.recommendedActions) ? parsedAdvisory.recommendedActions : [],
      considerAvoiding: Array.isArray(parsedAdvisory.considerAvoiding) ? parsedAdvisory.considerAvoiding : [],
      safeOutdoorWindows: Array.isArray(parsedAdvisory.safeOutdoorWindows) ? parsedAdvisory.safeOutdoorWindows : ['Early Morning', 'Late Evening'],
      hydrationTargetLiters: typeof parsedAdvisory.hydrationTargetLiters === 'number' ? parsedAdvisory.hydrationTargetLiters : 2.5,
      maskRecommendation: parsedAdvisory.maskRecommendation || (aqi.aqi > 150 ? 'Mandatory N95/FFP2' : (aqi.aqi > 100 ? 'Recommended' : 'None')),
      generatedAt: new Date().toISOString(),
      modelIdentifier: 'Google Gemini 1.5 Flash (Secure Edge)',
      confidenceScore: typeof parsedAdvisory.confidenceScore === 'number' ? parsedAdvisory.confidenceScore : 0.95,
    };

    // 6. Record to Supabase advisory_history if user is authenticated
    if (userId && supabaseUrl && supabaseAnonKey && authHeader) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });

        await supabase.from('advisory_history').insert({
          user_id: userId,
          location_name: location,
          latitude: weather.latitude ?? 0,
          longitude: weather.longitude ?? 0,
          temperature: weather.temperature,
          apparent_temperature: weather.feelsLike,
          humidity: weather.humidity,
          wind_speed: weather.windSpeed,
          uv_index: weather.uvIndex,
          precipitation: weather.precipitation ?? 0,
          aqi: aqi.aqi,
          pm25: aqi.pollutants?.pm25?.value,
          pm10: aqi.pollutants?.pm10?.value,
          no2: aqi.pollutants?.no2?.value,
          o3: aqi.pollutants?.o3?.value,
          co: aqi.pollutants?.co?.value,
          so2: aqi.pollutants?.so2?.value,
          pollution_risk: riskAssessment.pollutionRisk,
          heat_risk: riskAssessment.heatRisk,
          uv_risk: riskAssessment.uvRisk,
          overall_risk: riskAssessment.overallRisk,
          advisory: advisoryPayload,
        });
      } catch (dbErr) {
        console.warn('Failed to insert into advisory_history:', dbErr);
      }
    }

    return new Response(JSON.stringify(advisoryPayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error in advisory function' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
