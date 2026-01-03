/**
 * OpenAI client for blog post generation from video transcripts.
 * Provides functions to generate blog content with SEO metadata.
 */

import OpenAI from 'openai';
import { getConfig } from '@/lib/config';
import { logServiceCall, logError, logDebug } from '@/utils/logger';
import { ExternalServiceError } from '@/utils/error-handler';
import type {
  OpenAIRequestOptions,
  GeneratedBlogPost,
  SEOMetadata,
} from '@/types';

/**
 * Initialize OpenAI client with API key from environment
 */
function createOpenAIClient(): OpenAI {
  const config = getConfig();

  return new OpenAI({
    apiKey: config.openai.apiKey,
    maxRetries: config.openai.maxRetries,
    timeout: config.openai.timeout,
  });
}

/**
 * Get singleton OpenAI client instance
 */
let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
}

/**
 * System prompt for blog post generation
 * Emphasizes SEO, readability, and AdSense-friendly structure
 */
const BLOG_GENERATION_SYSTEM_PROMPT = `
You are an expert blog post writer and SEO specialist. Your task is to transform video transcripts into engaging, well-structured blog posts.

Requirements:
1. Write in a professional yet conversational tone
2. Use proper headings (H2, H3) for structure
3. Include SEO-friendly meta title and description
5. Suggest relevant keywords for SEO
6. Ensure the content is AdSense-friendly (original, valuable content)
7. Include an engaging introduction and conclusion
8. Use bullet points and numbered lists where appropriate
9. Add semantic HTML comments for ad placement areas:
   - <!-- ADSENSE_TOP_BANNER --> at the beginning
   - <!-- ADSENSE_IN_ARTICLE --> after first 2-3 paragraphs
   - <!-- ADSENSE_BOTTOM_BANNER --> before conclusion

Output format (JSON):
{
  "title": "Catchy blog post title",
  "content": "Full blog post content with HTML formatting",
  "excerpt": "2-3 sentence summary",
  "seoMetadata": {
    "title": "SEO title (60 chars max)",
    "description": "SEO description (160 chars max)",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "ogTitle": "Open Graph title",
    "ogDescription": "Open Graph description"
  },
  "wordCount": number
}
`;

/**
 * Generate a blog post from a transcript
 * @param transcript - The video transcript text
 * @param titleSuggestion - Optional title suggestion
 * @param options - OpenAI request options
 * @returns Generated blog post with SEO metadata
 */
export async function generateBlogPost(
  transcript: string,
  titleSuggestion?: string,
  options: OpenAIRequestOptions = {}
): Promise<GeneratedBlogPost> {
  const startTime = Date.now();

  try {
    const client = getClient();
    const config = getConfig();

    logDebug('Generating blog post from transcript', {
      transcriptLength: transcript.length,
      hasTitleSuggestion: !!titleSuggestion,
      model: options.model || config.openai.model,
    });

    // Prepare the user prompt
    let userPrompt = `Transform the following video transcript into a well-structured blog post:\n\n${transcript}`;

    if (titleSuggestion) {
      userPrompt = `Transform the following video transcript into a well-structured blog post. Consider this title suggestion: "${titleSuggestion}"\n\n${transcript}`;
    }

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: options.model || config.openai.model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      messages: [
        { role: 'system', content: BLOG_GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    logServiceCall('OpenAI', 'generate blog post', duration, {
      model: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ExternalServiceError('OpenAI', 'Empty response from API');
    }

    // Parse JSON response
    let blogPost: GeneratedBlogPost;
    try {
      blogPost = JSON.parse(content);
    } catch (parseError) {
      logError('Failed to parse OpenAI response JSON', { content });
      throw new ExternalServiceError('OpenAI', 'Invalid JSON response from API');
    }

    // Validate required fields
    if (!blogPost.title || !blogPost.content) {
      throw new ExternalServiceError('OpenAI', 'Missing required fields in response');
    }

    // Set word count if not provided
    if (!blogPost.wordCount) {
      blogPost.wordCount = countWords(blogPost.content);
    }

    return blogPost;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      // Handle OpenAI API errors
      if (error.message.includes('API key')) {
        logError('OpenAI authentication error', { error: error.message });
        throw new ExternalServiceError('OpenAI', 'Invalid API key');
      }

      if (error.message.includes('rate limit')) {
        logError('OpenAI rate limit error', { error: error.message });
        // TODO: Implement retry logic with exponential backoff
        throw new ExternalServiceError('OpenAI', 'Rate limit exceeded');
      }

      if (error.message.includes('insufficient_quota')) {
        logError('OpenAI quota exceeded', { error: error.message });
        throw new ExternalServiceError('OpenAI', 'API quota exceeded');
      }

      logError('OpenAI API error', { error: error.message, duration });
      throw new ExternalServiceError('OpenAI', error.message);
    }

    logError('Unknown OpenAI error', { error, duration });
    throw new ExternalServiceError('OpenAI', 'Unknown error occurred');
  }
}

/**
 * Enhance and format blog post content
 * @param content - Raw blog post content
 * @param options - Enhancement options
 * @returns Enhanced blog post content
 */
export async function enhanceBlogContent(
  content: string,
  options: {
    improveReadability?: boolean;
    addSubheadings?: boolean;
    generateExcerpt?: boolean;
  } = {}
): Promise<string> {
  const startTime = Date.now();

  try {
    const client = getClient();
    const config = getConfig();

    logDebug('Enhancing blog content', {
      contentLength: content.length,
      options,
    });

    let prompt = 'Enhance the following blog post content for better readability and engagement:\n\n';

    if (options.improveReadability) {
      prompt += '- Improve sentence structure and flow\n';
    }

    if (options.addSubheadings) {
      prompt += '- Add relevant subheadings where appropriate\n';
    }

    if (options.generateExcerpt) {
      prompt += '- Ensure it has a clear introduction and conclusion\n';
    }

    prompt += `\n${content}`;

    const response = await client.chat.completions.create({
      model: config.openai.model,
      temperature: 0.5,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: 'You are a professional content editor. Improve blog posts for readability while maintaining the original meaning and style.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const duration = Date.now() - startTime;
    logServiceCall('OpenAI', 'enhance content', duration, {
      model: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    });

    const enhancedContent = response.choices[0]?.message?.content;
    if (!enhancedContent) {
      throw new ExternalServiceError('OpenAI', 'Empty response from API');
    }

    return enhancedContent;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    logError('OpenAI content enhancement error', { error, duration });
    throw new ExternalServiceError('OpenAI', 'Failed to enhance content');
  }
}

/**
 * Generate SEO metadata for a blog post
 * @param title - Blog post title
 * @param content - Blog post content
 * @param options - OpenAI request options
 * @returns SEO metadata
 */
export async function generateSEOMetadata(
  title: string,
  content: string,
  options: OpenAIRequestOptions = {}
): Promise<SEOMetadata> {
  const startTime = Date.now();

  try {
    const client = getClient();
    const config = getConfig();

    logDebug('Generating SEO metadata', {
      title,
      contentLength: content.length,
    });

    const prompt = `Generate SEO metadata for the following blog post:

Title: ${title}
Content: ${content.substring(0, 2000)}...

Provide:
1. SEO title (60 characters max)
2. SEO description (160 characters max)
3. 5-7 relevant keywords
4. Open Graph title
5. Open Graph description

Format as JSON`;

    const response = await client.chat.completions.create({
      model: options.model || config.openai.model,
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are an SEO specialist. Generate optimized metadata for blog posts.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    logServiceCall('OpenAI', 'generate SEO metadata', duration);

    const metadataContent = response.choices[0]?.message?.content;
    if (!metadataContent) {
      throw new ExternalServiceError('OpenAI', 'Empty response from API');
    }

    const metadata: SEOMetadata = JSON.parse(metadataContent);
    return metadata;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    logError('OpenAI SEO metadata generation error', { error, duration });
    throw new ExternalServiceError('OpenAI', 'Failed to generate SEO metadata');
  }
}

/**
 * Count words in a text string
 * @param text - Text to count
 * @returns Number of words
 */
function countWords(text: string): number {
  // Remove HTML tags and count words
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText ? plainText.split(' ').length : 0;
}

/**
 * Validate OpenAI API key
 * @returns True if API key is valid
 */
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    const client = getClient();

    await client.models.list();
    return true;
  } catch (error) {
    logError('OpenAI API key validation failed', { error });
    return false;
  }
}
