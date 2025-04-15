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
    // For this demo, we'll implement an enhanced rule-based approach that simulates AI

    // AI-simulated approach with contextual analysis
    return this.aiEnhancedAnalysis(text);
  }

  /**
   * AI-enhanced sentiment analysis
   * This simulates a more sophisticated sentiment analysis that would normally be done by an AI model
   */
  private aiEnhancedAnalysis(text: string): {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  } {
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic",
      "terrific", "outstanding", "superb", "awesome", "thanks", "thank", 
      "appreciate", "happy", "love", "best", "congratulations", "well", 
      "improvement", "improved", "better", "beautiful", "perfect", "success",
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
    
    // Context modifiers - words that can flip the sentiment
    const negationWords = ["no", "not", "never", "don't", "doesn't", "didn't", "won't", "shouldn't", "can't", "couldn't"];
    const intensifiers = ["very", "extremely", "really", "absolutely", "completely", "totally"];
    
    // Normalize text for analysis
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\s+/);
    
    let positiveScore = 0;
    let negativeScore = 0;
    let contextModifier = 1; // Used to flip sentiment based on context
    
    // Process text with context sensitivity
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check for negation words that might flip sentiment
      if (negationWords.includes(word)) {
        contextModifier = -1;
        continue;
      }
      
      // Check for intensifiers that strengthen sentiment
      if (intensifiers.includes(word)) {
        contextModifier = contextModifier * 1.5;
        continue;
      }
      
      // Check for positive words
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveScore += 1 * contextModifier;
        contextModifier = 1; // Reset after applying
        continue;
      }
      
      // Check for negative words
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeScore += 1 * Math.abs(contextModifier); // Always add negative score
        contextModifier = 1; // Reset after applying
        continue;
      }
      
      // Context window reset (if we're past a certain number of words without sentiment)
      if (i % 5 === 0) {
        contextModifier = 1;
      }
    }
    
    // Check for key phrases in the entire text
    if (normalizedText.includes("thank you") || normalizedText.includes("thanks for")) {
      positiveScore += 2;
    }
    
    if (normalizedText.includes("waste of") || normalizedText.includes("not worth")) {
      negativeScore += 2;
    }
    
    // Calculate final scores
    const finalPositive = Math.max(0, positiveScore);
    const finalNegative = Math.max(0, negativeScore);
    
    // Enhanced sentiment classification with confidence score
    if (finalPositive > finalNegative && finalPositive > 0) {
      return { 
        sentiment: "positive", 
        score: finalPositive / (finalPositive + finalNegative + 0.1) * 10
      };
    } else if (finalNegative > finalPositive && finalNegative > 0) {
      return { 
        sentiment: "negative", 
        score: finalNegative / (finalPositive + finalNegative + 0.1) * 10
      };
    } else {
      return { sentiment: "neutral", score: 1 }; // Low confidence neutral
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
      const result = await this.analyze(comment.text);
      
      // Even if comment already has sentiment, we re-analyze with our improved algorithm
      analyzedComments.push({
        ...comment,
        sentiment: result.sentiment
      });
    }
    
    console.log(`AI sentiment analysis complete for ${comments.length} comments`);
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
