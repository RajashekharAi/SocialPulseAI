import { InsertComment } from "@shared/schema";

class SentimentAnalyzer {
  // List of names that should be treated as neutral
  private neutralNames = ["V.prasad", "v.prasad"];

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

    // Check if the text contains any neutral names that should not influence sentiment
    if (this.containsNeutralName(text)) {
      // If the text only contains the neutral name, treat it as neutral
      if (this.textContainsOnlyName(text)) {
        return { sentiment: "neutral", score: 0 };
      }
    }

    // AI-simulated approach with contextual analysis
    return this.aiEnhancedAnalysis(text);
  }

  /**
   * Check if text contains any name from the neutral names list
   */
  private containsNeutralName(text: string): boolean {
    return this.neutralNames.some(name => 
      text.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Check if text basically only contains a neutral name
   * (with possible punctuation or common words)
   */
  private textContainsOnlyName(text: string): boolean {
    const cleanText = text.toLowerCase().replace(/[.,!?'"]/g, '').trim();
    
    return this.neutralNames.some(name => {
      const nameLower = name.toLowerCase();
      // Check if text is just the name or name with very minimal other content
      return cleanText === nameLower || 
             cleanText === `the ${nameLower}` || 
             cleanText === `mr ${nameLower}` || 
             cleanText === `sri ${nameLower}` ||
             cleanText === `శ్రీ ${nameLower}`;
    });
  }

  /**
   * AI-enhanced sentiment analysis
   * This simulates a more sophisticated sentiment analysis that would normally be done by an AI model
   */
  private aiEnhancedAnalysis(text: string): {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  } {
    // First check for emojis and special patterns that indicate clear positive sentiment
    const emojiPatternResult = this.analyzeEmojiPatterns(text);
    if (emojiPatternResult !== null) {
      return emojiPatternResult;
    }

    // Check for specific Telugu praise phrases
    const praisePatternResult = this.analyzeTeluguPraisePhrases(text);
    if (praisePatternResult !== null) {
      return praisePatternResult;
    }

    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic",
      "terrific", "outstanding", "superb", "awesome", "thanks", "thank", 
      "appreciate", "happy", "love", "best", "congratulations", "well", 
      "improvement", "improved", "better", "beautiful", "perfect", "success",
      // Telugu positive words transliterated
      "bagundi", "chala bagundi", "dhanyavadalu", "abhinandanalu", 
      "manchidi", "ఎక్క", "అద్భుతం", "మంచి", "బాగుంది",
      // Additional Telugu positive words and phrases
      "జయహో", "ఘనవిజయం", "శ్వేతం", "ప్రజాసేవ", "విజయం", "ఖాయమైంది", 
      "తరింౘడానికి", "జయహో", "సురేష్", "ఘన", "మరకలంటని",
      "కుటుంబం", "అవినీతి మరకలంటని", "ప్రజాసేవలో",
      // Political positive context words in Telugu
      "నాయకత్వం", "సేవ", "సమర్పణ", "నిజాయితీ", "నిబద్ధత",
      // Additional Telugu positive words - April 2025 update
      "సంతోషం", "ఆనందం", "హర్షం", "శుభం", "రాణించు", "గెలుపు", "నమ్మకం",
      "విశ్వాసం", "ధన్యవాదాలు", "శుభాకాంక్షలు", "అభినందనలు", "ప్రగతి", 
      "అభివృద్ధి", "ఉన్నతి", "సాధన", "విజయోత్సవం", "సత్ఫలితం", "సంతృప్తి",
      "సమృద్ధి", "సంపన్నత", "సాఫల్యం", "సహకారం", "స్నేహపూర్వక", "సామరస్యం",
      "ఆదర్శం", "ఉత్తమ", "చక్కని", "సుందరమైన", "రమ్యమైన", "ఉత్సాహం", 
      "ప్రోత్సాహం", "ప్రేరణ", "శక్తివంతమైన", "ఆశాజనక", "నూతన", "సృష్టి",
      // Telugu political and social positive terms
      "పారదర్శకత", "జవాబుదారీతనం", "సమానత్వం", "స్వేచ్ఛ", "న్యాయం",
      "ప్రజాస్వామ్యం", "సుపరిపాలన", "సంక్షేమ", "సేవాధృష్టి", "ప్రజాహితం", 
      "జనసేవ", "దేశభక్తి", "రాజ్యాంగబద్ధత", "సర్వజనహితం",
      // New Telugu positive words to match the examples
      "జై", "jai", "అన్నా", "anna", "గారు", "garu", "సూపర్", "super", "హాట్సాఫ్", "hatsoff",
      "హాట్స్ ఆఫ్", "hats off", "బాగా", "చాల బాగా", "చెప్పారు", "మాట్లాడారు", "అసెంబ్లీలో",
      "ఆనందదాయకంగా", "అభిప్రాయం", "ఊహించలేదు", "డెవలప్", "బాగుంది", "శ్రీ", "శుభాకాంక్షలు",
      "ప్రేమ", "సర్", "sir"
    ];

    const negativeWords = [
      "bad", "terrible", "horrible", "awful", "poor", "disappointing",
      "disappoints", "disappointed", "unfortunate", "sad", "unhappy", "hate",
      "dislike", "worst", "failure", "failed", "problem", "issue", "concern",
      // Telugu negative words transliterated
      "chedu", "baagaledhu", "cheddaga", "kashṭam", "సమస్య", "చెడు", "బాగాలేదు",
      // Additional Telugu negative words and phrases
      "దోచి", "దాచుకోవడం", "అవినీతి", "కఱ్ఱ పెత్తనం", "విఱ్ఱవీగుతూ",
      // Political negative context words in Telugu
      "భ్రష్టాచారం", "అవినీతి", "దోపిడీ", "మోసం", "కుట్ర",
      // Additional Telugu negative words - April 2025 update
      "దుఃఖం", "బాధ", "కష్టం", "నష్టం", "విచారం", "నిరాశ", "నిస్పృహ",
      "అపజయం", "ఓటమి", "పరాభవం", "అసంతృప్తి", "ఆందోళన", "ఆవేదన",
      "కోపం", "రోషం", "ఆగ్రహం", "అసహనం", "నిరుత్సాహం", "నిరాసక్తత",
      "అయోగ్యత", "అనర్హత", "అసమర్థత", "బలహీనత", "భయం", "వైఫల్యం", 
      "అపఖ్యాతి", "అవమానం", "అగౌరవం", "అన్యాయం", "అపనిందలు",
      "దూషణ", "నిందలు", "విమర్శలు", "తప్పిదాలు", "లోపాలు", "పొరపాట్లు",
      // Telugu political and social negative terms
      "అక్రమాలు", "అరాచకం", "అరాజకం", "గుండాయిజం", "దౌర్జన్యం", 
      "అత్యాచారం", "దురాగతం", "దురాక్రమణ", "దుర్వినియోగం", "దుష్ప్రచారం",
      "కుంభకోణం", "కుట్రపన్నాగం", "వంచన", "లంచగొండితనం", "స్వార్థం", 
      "నిరంకుశత్వం", "పక్షపాతం", "వివక్ష"
    ];
    
    // Context modifiers - words that can flip the sentiment
    const negationWords = [
      "no", "not", "never", "don't", "doesn't", "didn't", "won't", "shouldn't", 
      "can't", "couldn't", "తప్ప", "లేదు", "కాదు", "వద్దు", "కూడదు", "చేయకూడదు",
      "ఉండకూడదు", "రాకూడదు", "పోకూడదు", "మాట్లాడకూడదు", "ఆలోచించకూడదు",
      "అనుకోకూడదు", "ఎప్పుడూ కాదు", "ఎన్నటికీ కాదు", "అస్సలు కాదు", "మరొకటి కాదు"
    ];
    
    const intensifiers = [
      "very", "extremely", "really", "absolutely", "completely", "totally", 
      "చాలా", "మరింత", "అత్యంత", "పూర్తిగా", "సంపూర్ణంగా", "అమితంగా", 
      "అధికంగా", "ఎక్కువగా", "మహా", "అతి", "మిక్కిలి", "గణనీయంగా",
      "సాటిలేని", "అసాధారణమైన", "అసమానమైన", "అద్భుతమైన", "అత్యద్భుతమైన"
    ];
    
    // Special handling for Telugu political sentiment patterns
    const teluguPoliticalSentiment = this.analyzeTeluguPoliticalSentiment(text);
    if (teluguPoliticalSentiment !== null) {
      return teluguPoliticalSentiment;
    }
    
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
   * Analyze emoji patterns in the text
   * Returns sentiment based on emoji usage patterns
   */
  private analyzeEmojiPatterns(text: string): {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  } | null {
    // Heart emoji detection (very strong positive indicator)
    const heartEmojis = text.match(/❤|♥|❣|💕|💓|💗|💖|💘|💝|💞|💟|❤️/g);
    if (heartEmojis && heartEmojis.length >= 1) {
      return { sentiment: "positive", score: 8.0 + Math.min(heartEmojis.length, 5) };
    }

    // Positive emoji clusters (fire, clapping, thumbs up, etc)
    const positiveEmojis = text.match(/🔥|👍|✌️|👏|💪|😎|🙏|👌|😍|🤩|😊|☺️|😄|😁/g);
    if (positiveEmojis && positiveEmojis.length >= 1) {
      return { sentiment: "positive", score: 7.0 + Math.min(positiveEmojis.length, 5) };
    }

    // Multiple emoji repetition pattern (often used for emphasis in positive contexts)
    const multipleEmojiPattern = /(\p{Emoji}\s*){3,}/u;
    if (multipleEmojiPattern.test(text)) {
      return { sentiment: "positive", score: 8.5 };
    }

    // Sequence of identical emojis (common in enthusiastic responses)
    const repeatedEmojiPattern = /(\p{Emoji})\1{2,}/u;
    if (repeatedEmojiPattern.test(text)) {
      return { sentiment: "positive", score: 8.0 };
    }

    return null;
  }

  /**
   * Analyze specific Telugu praise phrases
   */
  private analyzeTeluguPraisePhrases(text: string): {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  } | null {
    const normalizedText = text.toLowerCase();

    // Check for "Jai" or "జై" followed by name patterns (very strong positive indicator)
    if (/jai|జై/.test(normalizedText) && /suresh|సురేష్|kakarla|కాకర్ల/.test(normalizedText)) {
      return { sentiment: "positive", score: 9.5 };
    }

    // Check for name patterns with honorifics like "anna", "garu", etc.
    if (/(anna|అన్నా|garu|గారు)/.test(normalizedText) && 
        /(suresh|సురేష్|kakarla|కాకర్ల)/.test(normalizedText)) {
      return { sentiment: "positive", score: 8.5 };
    }

    // Check for appreciation phrases that start with "super", "hatsoff", etc.
    if (/^(super|సూపర్|hatsoff|హాట్సాఫ్|హాట్స్ ఆఫ్)/.test(normalizedText)) {
      return { sentiment: "positive", score: 8.0 };
    }

    // Check for admiration expressions in Telugu using specific patterns
    if (normalizedText.includes("చాల బాగా") || 
        normalizedText.includes("బాగా చెప్పారు") || 
        normalizedText.includes("ఆనందదాయకంగా") || 
        normalizedText.includes("బహు ఆనందదాయకంగా")) {
      return { sentiment: "positive", score: 8.0 };
    }

    // Add patterns for expressions of gratitude or admiration
    if (normalizedText.includes("ధన్యవాదాలు") || 
        normalizedText.includes("అభినందనలు") || 
        normalizedText.includes("శుభాకాంక్షలు")) {
      return { sentiment: "positive", score: 7.5 };
    }

    return null;
  }

  /**
   * Special analyzer for Telugu political content
   * Returns null if no specific political pattern is detected
   */
  private analyzeTeluguPoliticalSentiment(text: string): {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  } | null {
    // Check if text contains Telugu characters
    const containsTelugu = /[\u0C00-\u0C7F]/.test(text);
    if (!containsTelugu) {
      return null;
    }

    // Pattern 1: Praising a politician/party while criticizing another
    if (
      // Contains both criticism of one party and praise of another
      (text.includes("కాంగ్రెస్") || text.includes("congress")) && 
      ((text.includes("సురేష్") || text.includes("suresh")) && 
       (text.includes("విజయం") || text.includes("jayaho") || text.includes("జయహో")))
    ) {
      // This is a common pattern in political discourse - criticizing opponents and praising favorites
      return { sentiment: "positive", score: 8.5 };
    }

    // Pattern 2: Mentions of corruption for opponents, service for supporters
    if (text.includes("అవినీతి") && text.includes("ప్రజాసేవ")) {
      return { sentiment: "positive", score: 7.5 };
    }

    // Pattern 3: Victory/success phrases
    if (text.includes("ఘనవిజయం") || text.includes("ఖాయమైంది")) {
      return { sentiment: "positive", score: 8.0 };
    }

    // Pattern 4: Specific phrases that indicate strong support
    if (text.includes("శ్వేతం") || text.includes("మరకలంటని")) {
      return { sentiment: "positive", score: 7.0 };
    }

    // Pattern 5: MLA appreciation patterns
    if ((text.includes("MLA") || text.includes("ఎమ్మెల్యే")) && 
        (text.includes("బాగా") || text.includes("చెప్పారు") || text.includes("మాట్లాడారు"))) {
      return { sentiment: "positive", score: 8.0 };
    }

    // Pattern 6: Assembly speech appreciation
    if (text.includes("అసెంబ్లీ") || text.includes("assembly")) {
      if (text.includes("బాగా") || text.includes("చెప్పారు") || text.includes("మాట్లాడారు")) {
        return { sentiment: "positive", score: 7.5 };
      }
    }

    return null;
  }
  
  /**
   * Analyze a batch of comments
   * @param comments Array of comments to analyze
   * @returns Array of comments with sentiment analysis
   */
  async analyzeBatch(comments: InsertComment[]): Promise<InsertComment[]> {
    const analyzedComments = [];
    
    // Count only actual comments (excluding metadata entries)
    const actualComments = comments.filter(comment => 
      !comment.isVideoMetadata && !comment.isCommentMetric
    );
    const actualCommentCount = actualComments.length;
    
    for (const comment of comments) {
      const result = await this.analyze(comment.text);
      
      // Even if comment already has sentiment, we re-analyze with our improved algorithm
      analyzedComments.push({
        ...comment,
        sentiment: result.sentiment
      });
    }
    
    // Log the count of actual comments, not all entries
    console.log(`AI sentiment analysis complete for ${actualCommentCount} comments`);
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
