import { InsertComment } from "@shared/schema";

class TopicExtractor {
  /**
   * Extract topics from a batch of comments
   * @param comments Array of comments to analyze
   * @returns Array of comments with extracted topics
   */
  async extractTopics(comments: InsertComment[]): Promise<InsertComment[]> {
    const commentWithTopics = [];
    
    for (const comment of comments) {
      // Skip if topics already exist
      if (comment.topics && comment.topics.length > 0) {
        commentWithTopics.push(comment);
        continue;
      }
      
      const topics = await this.extractTopicsFromText(
        comment.text,
        comment.language,
        comment.sentiment
      );
      
      commentWithTopics.push({
        ...comment,
        topics
      });
    }
    
    return commentWithTopics;
  }
  
  /**
   * Extract topics from a single text
   * @param text The text to analyze
   * @param language Language of the text
   * @param sentiment Sentiment of the text
   * @returns Array of extracted topics
   */
  private async extractTopicsFromText(
    text: string,
    language: string,
    sentiment: string
  ): Promise<string[]> {
    // In a production environment, this would use a proper NLP library or API
    // For this demo, we'll implement a simple keyword-based approach
    
    // Common topics across both languages
    const topicKeywords: { [key: string]: string[] } = {
      "infrastructure": ["road", "roads", "bridge", "construction", "build", "infrastructure", "facility", "facilities"],
      "water issues": ["water", "drinking", "irrigation", "supply", "pipeline", "shortage", "dam"],
      "education": ["school", "education", "student", "college", "university", "literacy", "teacher", "classroom"],
      "healthcare": ["hospital", "health", "doctor", "medical", "patient", "treatment", "clinic"],
      "agriculture": ["farm", "agriculture", "farmer", "crop", "cultivation", "harvest", "seed", "fertilizer"],
      "employment": ["job", "employment", "unemployment", "salary", "wage", "work", "worker", "career"],
      "governance": ["governance", "government", "administration", "policy", "scheme", "implementation"],
      "development": ["development", "progress", "growth", "improve", "improvement"],
      
      // Telugu transliterations
      "నీరు (water)": ["నీరు", "నీటి", "తాగునీరు", "సాగునీరు"],
      "రహదారులు (roads)": ["రోడ్లు", "రహదారి", "రహదారులు"],
      "అభివృద్ధి (development)": ["అభివృద్ధి", "పురోగతి", "మెరుగుదల"],
      "విద్య (education)": ["విద్య", "పాఠశాల", "చదువు"],
      "వ్యవసాయం (agriculture)": ["వ్యవసాయం", "రైతు", "పంట"],
    };
    
    // Extract topics based on keyword matching
    const extractedTopics = new Set<string>();
    const normalizedText = text.toLowerCase();
    
    // Check each topic's keywords
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          // Remove the transliteration part for Telugu topics
          const cleanTopic = topic.includes("(") 
            ? topic.substring(0, topic.indexOf("(")).trim() 
            : topic;
          extractedTopics.add(cleanTopic);
          break;
        }
      }
    }
    
    // Add sentiment-specific topics
    if (sentiment === "positive") {
      if (normalizedText.includes("thank") || 
          normalizedText.includes("thanks") || 
          normalizedText.includes("ధన్యవాదాలు") ||
          normalizedText.includes("appreciation")) {
        extractedTopics.add("appreciation");
      }
    } else if (sentiment === "negative") {
      if (normalizedText.includes("problem") || 
          normalizedText.includes("issue") || 
          normalizedText.includes("సమస్య") ||
          normalizedText.includes("complaint")) {
        extractedTopics.add("complaints");
      }
    }
    
    // If no topics found, add a generic one
    if (extractedTopics.size === 0) {
      extractedTopics.add("general");
    }
    
    return Array.from(extractedTopics);
  }
}

export const topicExtractor = new TopicExtractor();
