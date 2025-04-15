import { InsertComment } from "@shared/schema";
import { storage } from "../storage";

class MediaCollector {
  // API keys for different platforms
  private apiKeys: { [key: string]: string | null } = {
    youtube: null,
    twitter: null,
    facebook: null,
    instagram: null
  };
  
  constructor() {
    // Initialize API keys
    this.loadApiKeys();
  }
  
  /**
   * Load API keys from storage
   */
  private async loadApiKeys() {
    try {
      this.apiKeys = await storage.getApiKeys();
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  }
  /**
   * Collect comments from various social media platforms
   * @param keyword The search keyword or person name
   * @param timeperiod Time period in days (7, 14, 30, 90)
   * @param platform Target platform (all, youtube, twitter, facebook, instagram)
   * @returns Array of collected comments
   */
  async collectComments(
    keyword: string,
    timeperiod: number,
    platform: string
  ): Promise<InsertComment[]> {
    // In a production environment, this would use actual API calls to social media platforms
    // For this demo implementation, we'll generate sample comments to simulate the collection process
    
    const platforms = platform === "all" 
      ? ["YouTube", "Twitter (X)", "Facebook", "Instagram"] 
      : [this.formatPlatformName(platform)];
    
    // Generate variations of the search keyword
    const keywordVariations = this.generateKeywordVariations(keyword);
    
    // Simulate API calls and collect comments
    let allComments: InsertComment[] = [];
    
    for (const platform of platforms) {
      const platformComments = await this.fetchCommentsFromPlatform(
        platform,
        keywordVariations,
        timeperiod
      );
      
      allComments = [...allComments, ...platformComments];
    }
    
    return allComments;
  }
  
  /**
   * Format platform name for consistent use
   */
  private formatPlatformName(platform: string): string {
    const platformMap: {[key: string]: string} = {
      'youtube': 'YouTube',
      'twitter': 'Twitter (X)',
      'facebook': 'Facebook',
      'instagram': 'Instagram'
    };
    
    return platformMap[platform.toLowerCase()] || platform;
  }
  
  /**
   * Generate variations of a keyword for broader search
   */
  private generateKeywordVariations(keyword: string): string[] {
    // In a real implementation, this would use NLP techniques for transliteration
    // and generate actual keyword variations
    
    // For simplicity, we'll just return the original keyword
    // In a production app, we would add transliterations, aliases, etc.
    return [keyword];
  }
  
  /**
   * Fetch comments from a specific platform
   */
  private async fetchCommentsFromPlatform(
    platform: string,
    keywords: string[],
    timeperiod: number
  ): Promise<InsertComment[]> {
    try {
      // Depending on the platform, call the appropriate API method
      switch (platform.toLowerCase()) {
        case 'youtube':
          return await this.fetchFromYouTube(keywords, timeperiod);
        case 'twitter (x)':
          return await this.fetchFromTwitter(keywords, timeperiod);
        case 'facebook':
          return await this.fetchFromFacebook(keywords, timeperiod);
        case 'instagram':
          return await this.fetchFromInstagram(keywords, timeperiod);
        default:
          // Fallback to the sample data for now
          console.warn(`No real API implementation for platform: ${platform}`);
          return this.createCommentsData(platform, keywords[0], timeperiod);
      }
    } catch (error) {
      console.error(`Error fetching comments from ${platform}:`, error);
      // Return empty array instead of mock data when there's an error
      return [];
    }
  }
  
  /**
   * Fetch comments from YouTube using YouTube Data API
   */
  private async fetchFromYouTube(keywords: string[], timeperiod: number): Promise<InsertComment[]> {
    // First try to get API key from settings
    await this.loadApiKeys();
    const YOUTUBE_API_KEY = this.apiKeys.youtube || process.env.YOUTUBE_API_KEY;
    
    // Only use mock data if API key is not configured
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is not configured");
      return this.createCommentsData("YouTube", keywords[0], timeperiod);
    }
    
    try {
      const comments: InsertComment[] = [];
      const keyword = keywords[0]; // Use the first keyword
      
      // Calculate date for timeperiod days ago
      const publishedAfter = new Date();
      publishedAfter.setDate(publishedAfter.getDate() - timeperiod);
      const publishedAfterIso = publishedAfter.toISOString();
      
      // First search for videos related to the keyword
      const videoSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=10&q=${encodeURIComponent(keyword)}&type=video&publishedAfter=${publishedAfterIso}&key=${YOUTUBE_API_KEY}`;
      
      console.log(`Searching for YouTube videos with keyword: ${keyword}`);
      const videoSearchResponse = await fetch(videoSearchUrl);
      
      if (!videoSearchResponse.ok) {
        console.error(`YouTube API search error: ${videoSearchResponse.status} ${videoSearchResponse.statusText}`);
        
        // If the API key is invalid or quota is exceeded, fall back to sample data
        if (videoSearchResponse.status === 403) {
          console.error("YouTube API returned Forbidden (403). Your API key may be invalid, restricted, or the quota might be exceeded.");
          // Return empty array instead of mock data
          return [];
        }
        
        throw new Error(`YouTube API error: ${videoSearchResponse.statusText}`);
      }
      
      const videoSearchData = await videoSearchResponse.json();
      
      if (!videoSearchData.items || videoSearchData.items.length === 0) {
        console.log(`No videos found for keyword: ${keyword}`);
        // Return empty array with no mock data since API key is configured but no data found
        return [];
      }
      
      const videoIds = videoSearchData.items.map((item: any) => item.id.videoId);
      console.log(`Found ${videoIds.length} videos for keyword: ${keyword}`);
      
      // For each video, get the comments
      for (const videoId of videoIds) {
        try {
          const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&key=${YOUTUBE_API_KEY}`;
          
          const commentsResponse = await fetch(commentsUrl);
          
          if (!commentsResponse.ok) {
            console.warn(`Failed to fetch comments for video ${videoId}: ${commentsResponse.status} ${commentsResponse.statusText}`);
            // Skip this video and continue with others
            continue;
          }
          
          const commentsData = await commentsResponse.json();
          
          // Process comment data
          if (commentsData.items && commentsData.items.length > 0) {
            console.log(`Processing ${commentsData.items.length} comments for video ${videoId}`);
            
            for (const item of commentsData.items) {
              const comment = item.snippet.topLevelComment.snippet;
              const commentDate = new Date(comment.publishedAt);
              
              comments.push({
                searchQueryId: 0, // Will be set later
                platform: "YouTube",
                userName: comment.authorDisplayName,
                userId: comment.authorChannelId?.value,
                text: comment.textDisplay,
                language: this.detectLanguage(comment.textDisplay),
                sentiment: "neutral", // Will be analyzed later
                topics: [], // Will be extracted later
                engagementScore: comment.likeCount, // Use like count as engagement score
                createdAt: commentDate,
                sourceUrl: `https://www.youtube.com/watch?v=${videoId}&lc=${item.id}`
              });
            }
          } else {
            console.log(`No comments found for video ${videoId}`);
          }
        } catch (error) {
          console.error(`Error processing video ${videoId}:`, error);
          // Continue with other videos
        }
      }
      
      // If we couldn't get any comments from the API, don't use mock data
      if (comments.length === 0) {
        console.log("No comments collected from YouTube API for the given filters");
        return [];
      }
      
      console.log(`Successfully collected ${comments.length} comments from YouTube`);
      return comments;
    } catch (error) {
      console.error("Error fetching data from YouTube API:", error);
      // Don't fall back to sample data when there's an error if key is configured
      return [];
    }
  }
  
  /**
   * Fetch comments from Twitter using Twitter API v2
   */
  private async fetchFromTwitter(keywords: string[], timeperiod: number): Promise<InsertComment[]> {
    // First try to get API key from settings
    await this.loadApiKeys();
    const TWITTER_BEARER_TOKEN = this.apiKeys.twitter || process.env.TWITTER_BEARER_TOKEN;
    
    // Only use mock data if API key is not configured
    if (!TWITTER_BEARER_TOKEN) {
      console.error("Twitter API token is not configured");
      return this.createCommentsData("Twitter (X)", keywords[0], timeperiod);
    }
    
    try {
      const comments: InsertComment[] = [];
      const keyword = keywords[0]; // Use the first keyword
      
      // Calculate date for timeperiod days ago in Twitter format (YYYY-MM-DD)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeperiod);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Search for tweets with the keyword
      const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)}&start_time=${startDateStr}T00:00:00Z&max_results=100&tweet.fields=created_at,public_metrics,author_id,lang&expansions=author_id&user.fields=name,username`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
        }
      });
      
      if (!response.ok) {
        console.error(`Twitter API error: ${response.status} ${response.statusText}`);
        // Don't fall back to mock data for API errors when key is configured
        return [];
      }
      
      const data = await response.json();
      
      // If no tweets found, return empty array with no mock data
      if (!data.data || data.data.length === 0) {
        console.log(`No tweets found for keyword: ${keyword}`);
        return [];
      }
      
      // Create a map of user IDs to user data
      const users = new Map();
      if (data.includes?.users) {
        for (const user of data.includes.users) {
          users.set(user.id, user);
        }
      }
      
      // Process tweet data
      for (const tweet of data.data || []) {
        const user = users.get(tweet.author_id);
        const tweetDate = new Date(tweet.created_at);
        
        comments.push({
          searchQueryId: 0, // Will be set later
          platform: "Twitter (X)",
          userName: user ? user.name : 'Unknown User',
          userId: user ? user.username : undefined,
          text: tweet.text,
          language: tweet.lang || this.detectLanguage(tweet.text),
          sentiment: "neutral", // Will be analyzed later
          topics: [], // Will be extracted later
          engagementScore: tweet.public_metrics ? 
            (tweet.public_metrics.like_count + tweet.public_metrics.retweet_count) : 0,
          createdAt: tweetDate,
          sourceUrl: `https://twitter.com/x/status/${tweet.id}`
        });
      }
      
      console.log(`Successfully collected ${comments.length} comments from Twitter`);
      return comments;
    } catch (error) {
      console.error("Error fetching data from Twitter API:", error);
      // Don't use mock data for errors when key is configured
      return [];
    }
  }
  
  /**
   * Fetch comments from Facebook using Graph API
   */
  private async fetchFromFacebook(keywords: string[], timeperiod: number): Promise<InsertComment[]> {
    // First try to get API key from settings
    await this.loadApiKeys();
    const FACEBOOK_ACCESS_TOKEN = this.apiKeys.facebook || process.env.FACEBOOK_ACCESS_TOKEN;
    
    // Only use mock data if API key is not configured
    if (!FACEBOOK_ACCESS_TOKEN) {
      console.error("Facebook API token is not configured");
      return this.createCommentsData("Facebook", keywords[0], timeperiod);
    }
    
    try {
      const comments: InsertComment[] = [];
      const keyword = keywords[0]; // Use the first keyword
      
      // Calculate unix timestamp for timeperiod days ago
      const sinceTimestamp = Math.floor(Date.now() / 1000) - (timeperiod * 24 * 60 * 60);
      
      // Search for posts related to the keyword
      const searchUrl = `https://graph.facebook.com/v17.0/search?q=${encodeURIComponent(keyword)}&type=post&fields=id,message,created_time&limit=25&since=${sinceTimestamp}&access_token=${FACEBOOK_ACCESS_TOKEN}`;
      
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        console.error(`Facebook API error: ${searchResponse.status} ${searchResponse.statusText}`);
        // Don't use mock data for API errors
        return [];
      }
      
      const searchData = await searchResponse.json();
      
      // If no posts found, return empty array with no mock data
      if (!searchData.data || searchData.data.length === 0) {
        console.log(`No posts found for keyword: ${keyword}`);
        return [];
      }
      
      // For each post, get the comments
      for (const post of searchData.data || []) {
        const commentsUrl = `https://graph.facebook.com/v17.0/${post.id}/comments?fields=id,message,from,created_time,like_count&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        
        const commentsResponse = await fetch(commentsUrl);
        
        if (!commentsResponse.ok) {
          console.warn(`Failed to fetch comments for post ${post.id}: ${commentsResponse.statusText}`);
          continue;
        }
        
        const commentsData = await commentsResponse.json();
        
        // Process comment data
        for (const comment of commentsData.data || []) {
          const commentDate = new Date(comment.created_time);
          
          comments.push({
            searchQueryId: 0, // Will be set later
            platform: "Facebook",
            userName: comment.from?.name || 'Facebook User',
            userId: comment.from?.id,
            text: comment.message,
            language: this.detectLanguage(comment.message),
            sentiment: "neutral", // Will be analyzed later
            topics: [], // Will be extracted later
            engagementScore: comment.like_count || 0,
            createdAt: commentDate,
            sourceUrl: `https://facebook.com/${comment.id}`
          });
        }
      }
      
      // If we couldn't get any comments, don't use mock data
      if (comments.length === 0) {
        console.log("No comments collected from Facebook for the given filters");
        return [];
      }
      
      console.log(`Successfully collected ${comments.length} comments from Facebook`);
      return comments;
    } catch (error) {
      console.error("Error fetching data from Facebook API:", error);
      // Don't fall back to mock data on error
      return [];
    }
  }
  
  /**
   * Fetch comments from Instagram using Graph API
   */
  private async fetchFromInstagram(keywords: string[], timeperiod: number): Promise<InsertComment[]> {
    // First try to get API key from settings
    await this.loadApiKeys();
    const INSTAGRAM_ACCESS_TOKEN = this.apiKeys.instagram || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    // Only use mock data if API key is not configured
    if (!INSTAGRAM_ACCESS_TOKEN) {
      console.error("Instagram API token is not configured");
      return this.createCommentsData("Instagram", keywords[0], timeperiod);
    }
    
    try {
      const comments: InsertComment[] = [];
      const keyword = keywords[0]; // Use the first keyword
      
      // Instagram API requires a user ID or a hashtag to search for content
      // For simplicity, we'll search for hashtags related to the keyword
      const hashtagSearch = keyword.replace(/\s+/g, '').toLowerCase();
      
      // First get hashtag ID
      const hashtagUrl = `https://graph.instagram.com/ig_hashtag_search?user_id=me&q=${encodeURIComponent(hashtagSearch)}&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
      
      const hashtagResponse = await fetch(hashtagUrl);
      
      if (!hashtagResponse.ok) {
        console.error(`Instagram API error: ${hashtagResponse.status} ${hashtagResponse.statusText}`);
        // Don't use mock data for API errors
        return [];
      }
      
      const hashtagData = await hashtagResponse.json();
      
      if (!hashtagData.data || hashtagData.data.length === 0) {
        console.warn(`No hashtag found for ${hashtagSearch}`);
        // Don't use mock data when API key is configured but no matching hashtags found
        return [];
      }
      
      const hashtagId = hashtagData.data[0].id;
      
      // Get recent media for this hashtag
      const mediaUrl = `https://graph.instagram.com/v17.0/${hashtagId}/recent_media?user_id=me&fields=id,caption,timestamp,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
      
      const mediaResponse = await fetch(mediaUrl);
      
      if (!mediaResponse.ok) {
        console.error(`Instagram API error: ${mediaResponse.status} ${mediaResponse.statusText}`);
        // Don't use mock data for API errors
        return [];
      }
      
      const mediaData = await mediaResponse.json();
      
      // If no media found, return empty array
      if (!mediaData.data || mediaData.data.length === 0) {
        console.log(`No media found for hashtag: ${hashtagSearch}`);
        return [];
      }
      
      // For each media, get the comments
      for (const media of mediaData.data || []) {
        const commentsUrl = `https://graph.instagram.com/v17.0/${media.id}/comments?fields=id,text,username,timestamp,like_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
        
        const commentsResponse = await fetch(commentsUrl);
        
        if (!commentsResponse.ok) {
          console.warn(`Failed to fetch comments for media ${media.id}: ${commentsResponse.statusText}`);
          continue;
        }
        
        const commentsData = await commentsResponse.json();
        
        // Process comment data
        for (const comment of commentsData.data || []) {
          const commentDate = new Date(comment.timestamp);
          
          comments.push({
            searchQueryId: 0, // Will be set later
            platform: "Instagram",
            userName: comment.username || 'Instagram User',
            userId: comment.username,
            text: comment.text,
            language: this.detectLanguage(comment.text),
            sentiment: "neutral", // Will be analyzed later
            topics: [], // Will be extracted later
            engagementScore: comment.like_count || 0,
            createdAt: commentDate,
            sourceUrl: `https://instagram.com/p/${media.id}`
          });
        }
      }
      
      // If we couldn't get any comments, don't use mock data
      if (comments.length === 0) {
        console.log("No comments collected from Instagram for the given filters");
        return [];
      }
      
      console.log(`Successfully collected ${comments.length} comments from Instagram`);
      return comments;
    } catch (error) {
      console.error("Error fetching data from Instagram API:", error);
      // Don't fall back to mock data on error
      return [];
    }
  }
  
  /**
   * Detect language using browser's language detection capabilities
   */
  detectLanguage(text: string): string {
    // For proper language detection, you would use a service like Google Cloud Translation API
    // For now, we'll use our simple detection method for Telugu and English
    const teluguPattern = /[\u0C00-\u0C7F]/;
    
    if (teluguPattern.test(text)) {
      return "Telugu";
    }
    
    return "English";
  }
  
  /**
   * Create structured comment data
   */
  private createCommentsData(
    platform: string,
    keyword: string,
    timeperiod: number
  ): InsertComment[] {
    const commentsCount = Math.floor(Math.random() * 10) + 15; // 15-25 comments per platform
    const comments: InsertComment[] = [];
    const now = new Date();
    
    // Generate a realistic set of comments
    // Note: In a production app, these would come from the social media APIs
    
    if (keyword.includes("ఎమ్మెల్యే కాకర్ల సురేష్ గారు")) {
      // Comments related to the example Telugu politician
      
      const teluguComments = [
        {
          text: "అభినందనలు సురేష్ గారు! మా ప్రాంతంలో రోడ్లు మరియు నీటి సదుపాయాలు మెరుగుపరిచినందుకు ధన్యవాదాలు. మీ కృషి అద్భుతం.",
          translation: "Congratulations Suresh garu! Thank you for improving roads and water facilities in our area. Your efforts are amazing.",
          language: "Telugu",
          sentiment: "positive",
          topics: ["infrastructure", "roads", "water facilities", "appreciation"]
        },
        {
          text: "కాకర్ల సురేష్ గారు మా ప్రాంతంలో తాగునీటి సమస్యలపై దృష్టి పెట్టడం లేదు. మేము చాలా నెలలుగా ఈ సమస్యతో బాధపడుతున్నాము.",
          translation: "Kakrla Suresh garu is not focusing on drinking water problems in our area. We have been suffering from this issue for many months.",
          language: "Telugu",
          sentiment: "negative",
          topics: ["water issues", "complaints", "public services"]
        },
        {
          text: "గ్రామాభివృద్ధి పథకాల అమలులో కాకర్ల సురేష్ గారు చాలా శ్రద్ధ చూపిస్తున్నారు. కానీ ఇంకా చాలా పనులు జరగాలి.",
          translation: "Kakrla Suresh garu is showing a lot of interest in implementing rural development schemes. But there is still a lot of work to be done.",
          language: "Telugu",
          sentiment: "neutral",
          topics: ["rural development", "government schemes", "progress"]
        }
      ];
      
      const englishComments = [
        {
          text: "The new community center built by MLA Suresh garu is a great addition to our town. It's already being used for so many cultural events!",
          language: "English",
          sentiment: "positive",
          topics: ["community center", "cultural events", "public facilities"]
        },
        {
          text: "When is MLA Kakrla Suresh planning to address the pending irrigation projects? Many farmers are waiting for updates.",
          language: "English",
          sentiment: "neutral",
          topics: ["irrigation", "agriculture", "farmer issues"]
        },
        {
          text: "Disappointment with the lack of action on school infrastructure by MLA Suresh. Our children deserve better facilities!",
          language: "English",
          sentiment: "negative",
          topics: ["education", "school infrastructure", "children welfare"]
        }
      ];
      
      // Add Telugu comments
      for (let i = 0; i < commentsCount / 2; i++) {
        const commentTemplate = teluguComments[i % teluguComments.length];
        const randomDays = Math.floor(Math.random() * timeperiod);
        const commentDate = new Date(now);
        commentDate.setDate(commentDate.getDate() - randomDays);
        
        const userName = this.getRandomUserName("Telugu");
        
        comments.push({
          searchQueryId: 0, // Will be set later
          platform,
          userName,
          userId: userName.toLowerCase().replace(/\s+/g, ""),
          text: commentTemplate.text,
          translation: commentTemplate.translation,
          language: commentTemplate.language,
          sentiment: commentTemplate.sentiment as "positive" | "negative" | "neutral",
          topics: commentTemplate.topics,
          engagementScore: Math.floor(Math.random() * 100),
          createdAt: commentDate,
          sourceUrl: `https://example.com/${platform.toLowerCase()}/comment/${i}`
        });
      }
      
      // Add English comments
      for (let i = 0; i < commentsCount / 2; i++) {
        const commentTemplate = englishComments[i % englishComments.length];
        const randomDays = Math.floor(Math.random() * timeperiod);
        const commentDate = new Date(now);
        commentDate.setDate(commentDate.getDate() - randomDays);
        
        const userName = this.getRandomUserName("English");
        
        comments.push({
          searchQueryId: 0, // Will be set later
          platform,
          userName,
          userId: userName.toLowerCase().replace(/\s+/g, ""),
          text: commentTemplate.text,
          language: commentTemplate.language,
          sentiment: commentTemplate.sentiment as "positive" | "negative" | "neutral",
          topics: commentTemplate.topics,
          engagementScore: Math.floor(Math.random() * 100),
          createdAt: commentDate,
          sourceUrl: `https://example.com/${platform.toLowerCase()}/comment/${i + commentsCount/2}`
        });
      }
    } else {
      // Generic comments for other keywords
      for (let i = 0; i < commentsCount; i++) {
        const isPositive = Math.random() > 0.3;
        const isNeutral = !isPositive && Math.random() > 0.5;
        const sentiment = isPositive ? "positive" : (isNeutral ? "neutral" : "negative");
        
        const language = Math.random() > 0.5 ? "English" : "Telugu";
        const randomDays = Math.floor(Math.random() * timeperiod);
        const commentDate = new Date(now);
        commentDate.setDate(commentDate.getDate() - randomDays);
        
        const userName = this.getRandomUserName(language);
        
        comments.push({
          searchQueryId: 0, // Will be set later
          platform,
          userName,
          userId: userName.toLowerCase().replace(/\s+/g, ""),
          text: `Comment about ${keyword} - ${i}`,
          language,
          sentiment: sentiment as "positive" | "negative" | "neutral",
          topics: ["general", keyword],
          engagementScore: Math.floor(Math.random() * 100),
          createdAt: commentDate,
          sourceUrl: `https://example.com/${platform.toLowerCase()}/comment/${i}`
        });
      }
    }
    
    return comments;
  }
  
  /**
   * Get a random user name based on language
   */
  private getRandomUserName(language: string): string {
    const teluguNames = [
      "Ramesh Kumar", "Lakshmi Devi", "Vijaya Reddy", "Praveen Rao", 
      "Sunil Goud", "Sarita Kumari", "Venkat Reddy", "Padma Rao", 
      "Anand Prasad", "Local News Today", "Telugu Politics", "Farmers Association"
    ];
    
    const englishNames = [
      "John Smith", "Sarah Wilson", "David Kumar", "Emily Reddy", 
      "Michael Johnson", "Jennifer Lee", "Regional Times", "Democracy Watch", 
      "Public Voice", "Civic Forum", "Development Tracker", "CitizenSpeak"
    ];
    
    const names = language === "Telugu" ? teluguNames : englishNames;
    return names[Math.floor(Math.random() * names.length)];
  }
}

export const mediaCollector = new MediaCollector();
