import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

// Define the function schema for activity recommendations
const getActivityRecommendationsFunction: OpenAI.Chat.ChatCompletionTool = {
   type: 'function',
   function: {
      name: 'get_activity_recommendations',
      description:
         'Returns a list of recommended activities for a city, excluding activities already planned by the user',
      parameters: {
         type: 'object',
         properties: {
            recommendations: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     name: {
                        type: 'string',
                        description: 'Name of the recommended activity',
                     },
                     description: {
                        type: 'string',
                        description:
                           'A brief description of the activity (2-3 sentences)',
                     },
                     location: {
                        type: 'string',
                        description:
                           'The specific location or address where this activity takes place',
                     },
                     category: {
                        type: 'string',
                        enum: [
                           'sightseeing',
                           'food',
                           'culture',
                           'nature',
                           'entertainment',
                           'shopping',
                           'nightlife',
                        ],
                        description: 'Category of the activity',
                     },
                     estimatedDuration: {
                        type: 'string',
                        description:
                           'Estimated time needed for this activity (e.g., "2-3 hours")',
                     },
                     tip: {
                        type: 'string',
                        description: 'A helpful tip or insider advice for this activity',
                     },
                  },
                  required: ['name', 'description', 'location', 'category'],
               },
               description: 'List of recommended activities',
            },
         },
         required: ['recommendations'],
      },
   },
};

export interface RecommendedActivity {
   name: string;
   description: string;
   location: string;
   category: 'sightseeing' | 'food' | 'culture' | 'nature' | 'entertainment' | 'shopping' | 'nightlife';
   estimatedDuration?: string;
   tip?: string;
}

export interface RecommendationsResponse {
   recommendations: RecommendedActivity[];
   city: string;
   country: string;
}

export async function POST(request: NextRequest) {
   try {
      // Check for API key
      if (!process.env.OPENAI_API_KEY) {
         return NextResponse.json(
            {
               error: 'OpenAI API key not configured',
               message: 'Please add OPENAI_API_KEY to your environment variables',
            },
            { status: 500 }
         );
      }

      const body = await request.json();
      const { city, country, existingActivities } = body;

      // Validate required fields
      if (!city || !country) {
         return NextResponse.json(
            { error: 'City and country are required' },
            { status: 400 }
         );
      }

      // Build the prompt
      const existingActivitiesList =
         existingActivities && existingActivities.length > 0
            ? `The user has already planned these activities: ${existingActivities.join(', ')}. Please suggest different activities that complement their existing plans.`
            : 'The user has not planned any activities yet.';

      const systemPrompt = `You are a knowledgeable travel assistant specializing in providing personalized activity recommendations for travelers. Your recommendations should be:
- Authentic and popular among locals and tourists alike
- Diverse in category (mix of sightseeing, food, culture, etc.)
- Practical with specific locations that can be found on a map
- Unique and not repetitive of what the user has already planned`;

      const userPrompt = `Please recommend 3-4 must-do activities for someone visiting ${city}, ${country}.

${existingActivitiesList}

Provide diverse recommendations across different categories. Include specific locations and helpful tips.`;

      // Call OpenAI with function calling
      const completion = await openai.chat.completions.create({
         model: 'gpt-4o-mini',
         messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
         ],
         tools: [getActivityRecommendationsFunction],
         tool_choice: {
            type: 'function',
            function: { name: 'get_activity_recommendations' },
         },
      });

      // Extract the function call response
      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

      if (!toolCall || toolCall.type !== 'function') {
         return NextResponse.json(
            { error: 'Failed to get recommendations from AI' },
            { status: 500 }
         );
      }

      // Type guard for function tool call
      const functionCall = toolCall as OpenAI.Chat.ChatCompletionMessageToolCall & {
         function: { name: string; arguments: string };
      };

      if (functionCall.function.name !== 'get_activity_recommendations') {
         return NextResponse.json(
            { error: 'Unexpected function call response' },
            { status: 500 }
         );
      }

      // Parse the function arguments
      const recommendations = JSON.parse(functionCall.function.arguments);

      return NextResponse.json({
         recommendations: recommendations.recommendations,
         city,
         country,
      });
   } catch (error) {
      console.error('Error getting recommendations:', error);

      if (error instanceof OpenAI.APIError) {
         return NextResponse.json(
            { error: `OpenAI API error: ${error.message}` },
            { status: error.status || 500 }
         );
      }

      return NextResponse.json(
         { error: 'Failed to get recommendations' },
         { status: 500 }
      );
   }
}
