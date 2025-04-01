
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyBTafddLjrxI2oasWHIC-dVqCB7mvSNzAY";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Format messages for Gemini API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    console.log("Sending request to Gemini API with messages:", JSON.stringify(formattedMessages));

    // Make sure we have at least one message
    if (!formattedMessages.length) {
      throw new Error("No messages provided");
    }

    // Using the gemini-1.5-flash model which is known to work reliably
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API returned an error:", response.status, errorText);
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Response from Gemini API:", JSON.stringify(data));
    
    if (data.error) {
      console.error("Error in Gemini API response:", data.error);
      throw new Error(data.error.message || "Error from Gemini API");
    }
    
    // Check if we have a valid response with candidates
    if (!data.candidates || !data.candidates.length || !data.candidates[0].content) {
      console.error("Invalid response format from Gemini API:", data);
      throw new Error("Invalid response format from Gemini API");
    }
    
    const reply = data.candidates[0].content.parts?.[0]?.text || "Sorry, I couldn't generate a response";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Gemini chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 200, // Return 200 even for errors to avoid client-side fetch issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
