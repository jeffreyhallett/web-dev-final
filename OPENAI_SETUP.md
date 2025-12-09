# OpenAI Activity Recommendations Setup Guide

This guide will help you complete the setup for the AI-powered activity recommendations feature.

## Overview

The application now includes an AI-powered feature that recommends activities for your trip destinations using OpenAI's Functions API. When you select a city, you can click "Get Recommendations" to receive personalized activity suggestions based on:

- The city and country you're visiting
- Activities you've already planned (to avoid duplicates)

## Setup Steps

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Give your key a name (e.g., "Trip Planner App")
6. Copy the key immediately (you won't be able to see it again)

### 2. Add the API Key to Your Environment

Create or update your `.env.local` file in the project root:

```bash
# .env.local
OPENAI_API_KEY=sk-your-api-key-here
```

**Important:** Never commit your API key to version control. The `.env.local` file should already be in `.gitignore`.

### 3. Verify the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Select a trip and city

4. In the left panel, you'll see the "AI Recommendations" section

5. Click "Get Recommendations" to test the integration

## Usage

### Getting Recommendations

1. Select a city from your trip
2. Look for the **AI Recommendations** section below the planned activities
3. Click the **Get Recommendations** button
4. Wait for the AI to generate personalized suggestions
5. Each recommendation includes:
   - Activity name and description
   - Location (can be added to the map)
   - Category (sightseeing, food, culture, etc.)
   - Estimated duration
   - Insider tips

### Adding Recommendations to Your Plan

- Click the **+** button on any recommended activity to add it to your travel plan
- The activity will appear in your "Planned Activities" list
- The AI considers your existing activities to avoid duplicate suggestions

## API Costs

The feature uses OpenAI's `gpt-4o-mini` model, which is cost-effective:

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens

Each recommendation request typically uses:
- ~200-300 input tokens
- ~400-600 output tokens
- **Estimated cost**: ~$0.0005 per request (less than a penny)

## Troubleshooting

### "OpenAI API key not configured" Error

- Ensure your `.env.local` file exists in the project root
- Check that `OPENAI_API_KEY` is set correctly
- Restart your development server after adding the key

### "Failed to get recommendations" Error

- Check your OpenAI account has API access and credits
- Verify your API key is valid and not expired
- Check the browser console for more detailed error messages

### Rate Limiting

If you see rate limit errors:
- OpenAI has rate limits based on your account tier
- Wait a moment and try again
- Consider upgrading your OpenAI account for higher limits

## Technical Details

### API Endpoint

The recommendations are fetched via:
- **Endpoint**: `POST /api/recommendations`
- **Payload**:
  ```json
  {
    "city": "Paris",
    "country": "France",
    "existingActivities": ["Eiffel Tower", "Louvre Museum"]
  }
  ```

### OpenAI Function Schema

The API uses OpenAI's Functions feature to ensure structured responses:

```typescript
{
  name: "get_activity_recommendations",
  parameters: {
    recommendations: [
      {
        name: string,
        description: string,
        location: string,
        category: "sightseeing" | "food" | "culture" | "nature" | "entertainment" | "shopping" | "nightlife",
        estimatedDuration?: string,
        tip?: string
      }
    ]
  }
}
```

## Security Notes

- The API key is only used server-side (never exposed to the browser)
- All requests go through your Next.js API route
- No user data is stored by OpenAI beyond the request

## Future Enhancements

Potential improvements for the recommendations feature:

- [ ] Cache recommendations to reduce API calls
- [ ] Allow users to filter by category
- [ ] Add user preferences (budget, interests)
- [ ] Include estimated costs for activities
- [ ] Add links to booking/more info
