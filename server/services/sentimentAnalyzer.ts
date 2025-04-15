import { InsertComment } from "@shared/schema";

class SentimentAnalyzer {
  /**
   * Analyze the sentiment of a single text
   * @param text The text to analyze
   * @returns Sentiment analysis result (positive, negative, or neutral)
   */
  async analyze(text: string): Promise<{
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  }> {
    // In a production environment, this would use a proper NLP library or API
    // For this demo, we'll implement a simple rule-based approach
    
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic",
      "terrific", "outstanding", "superb", "awesome", "thanks", "thank", 
      "appreciate", "happy", "love", "best", "congratulations", "well", 
      "improvement", "improved", "better", "beautiful", "perfect",
      // Telugu positive words transliterated
      "bagundi", "chala bagundi", "dhanyavadalu", "abhinandanalu", 
      "manchidi", "ఎక్క", "అద్భుతం", "మంచి", "బాగుంది"
    ];

    const negativeWords = [
      "bad", "terrible", "horrible", "awful", "poor", "disappointing",
      "disappoints", "disappointed", "unfortunate", "sad", "unhappy", "hate",
      "dislike", "worst", "failure", "failed", "problem", "issue", "concern",
      // Telugu negative words transliterated
      "chedu", "baagaledhu", "cheddaga", "kashṭam", "సమస్య", "చెడు", "బాగాలేదు"
    ];
    
    // Normalize text for analysis
    const normalizedText = text.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Count occurrences of positive and negative words
    positiveWords.forEach(word => {
      if (normalizedText.includes(word)) {
        positiveScore += 1;
      }
    });
    
    negativeWords.forEach(word => {
      if (normalizedText.includes(word)) {
        negativeScore += 1;
      }
    });
    
    // Simple rule-based classification
    if (positiveScore > negativeScore) {
      return { sentiment: "positive", score: positiveScore - negativeScore };
    } else if (negativeScore > positiveScore) {
      return { sentiment: "negative", score: negativeScore - positiveScore };
    } else {
      return { sentiment: "neutral", score: 0 };
    }
  }
  
  /**
   * Analyze a batch of comments
   * @param comments Array of comments to analyze
   * @returns Array of comments with sentiment analysis
   */
  async analyzeBatch(comments: InsertComment[]): Promise<InsertComment[]> {
    const analyzedComments = [];
    
    for (const comment of comments) {
      if (!comment.sentiment) {
        const result = await this.analyze(comment.text);
        analyzedComments.push({
          ...comment,
          sentiment: result.sentiment
        });
      } else {
        analyzedComments.push(comment);
      }
    }
    
    return analyzedComments;
  }
  
  /**
   * Detect the language of a text
   * @param text The text to analyze
   * @returns Language code (e.g., "en" for English, "te" for Telugu)
   */
  detectLanguage(text: string): string {
    // Basic language detection based on unicode ranges
    // In a production environment, use a proper language detection library
    
    // Check for Telugu characters (Unicode range: 0C00-0C7F)
    const teluguPattern = /[\u0C00-\u0C7F]/;
    
    if (teluguPattern.test(text)) {
      return "Telugu";
    }
    
    // Default to English
    return "English";
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
