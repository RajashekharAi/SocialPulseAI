# SocialPulseAI - Social Media Analytics Platform

SocialPulseAI is a full-stack application that provides AI-powered social media analytics to collect, process, analyze, and visualize social media data from multiple platforms. It uses advanced sentiment analysis, topic extraction, and engagement metrics to generate actionable insights.

## 📋 Project Overview

SocialPulseAI helps users monitor and analyze social media activity across multiple platforms:

- **Data Collection**: Collects comments and posts from YouTube, Twitter (X), Facebook, and Instagram
- **AI Analysis**: Performs sentiment analysis and topic extraction on collected data
- **Interactive Dashboard**: Visualizes trends, sentiment distribution, and key metrics
- **Insights Generation**: Uses AI to generate actionable insights from the analyzed data

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- (Optional) API keys for supported social media platforms

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/SocialPulseAI.git
   cd SocialPulseAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database configuration
   DATABASE_URL=your_database_url
   
   # Social Media API Keys (optional)
   YOUTUBE_API_KEY=your_youtube_api_key
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
SocialPulseAI/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Application pages
├── server/                 # Backend application
│   ├── services/           # Core services
│   │   ├── mediaCollector.ts   # Data collection from social platforms
│   │   ├── sentimentAnalyzer.ts # Sentiment analysis
│   │   └── topicExtractor.ts   # Topic extraction
│   ├── index.ts            # Server entry point
│   └── routes.ts           # API routes
└── shared/                 # Shared code between client and server
    ├── schema.ts           # Database schema
    └── types.ts            # TypeScript type definitions
```

## 🔍 Core Components

### Backend Services

#### Media Collector (`mediaCollector.ts`)
- Collects data from multiple social media platforms
- Supports YouTube, Twitter (X), Facebook, and Instagram
- Falls back to sample data when API keys are not configured

#### Sentiment Analyzer (`sentimentAnalyzer.ts`)
- Analyzes sentiment in collected comments
- Classifies sentiment as positive, negative, or neutral
- Supports multiple languages including English and Telugu

#### Topic Extractor (`topicExtractor.ts`)
- Extracts relevant topics from comments
- Uses keyword-based pattern matching
- Supports multiple languages

### Frontend Components

#### Dashboard (`Dashboard.tsx`)
- Main application interface
- Displays all analytics visualizations
- Allows users to search for topics and filter results

#### Analytics Components
- `SentimentTrend.tsx`: Visualizes sentiment trends over time
- `TopicDistribution.tsx`: Shows distribution of topics
- `WordCloud.tsx`: Displays frequently mentioned keywords
- `PlatformDistribution.tsx`: Shows data distribution across platforms
- `InfluentialUsers.tsx`: Identifies influential users in the data
- `AIInsightsSummary.tsx`: Displays AI-generated insights

## 🔧 API Configuration

SocialPulseAI can use real API data or fall back to sample data:

1. Go to Settings > API Configuration
2. Enter your API keys for the platforms you want to connect
3. The application will automatically use the configured APIs for data collection

Supported Platforms:
- YouTube (requires Google API key with YouTube Data API enabled)
- Twitter/X (requires Twitter API bearer token)
- Facebook (requires Facebook Graph API access token)
- Instagram (requires Instagram Graph API access token)

## 📊 Features

### Search and Analysis
- Search for keywords, phrases, or topics
- Filter by platform (YouTube, Twitter, Facebook, Instagram)
- Set custom time periods (7, 14, 30, or 90 days)

### Visualizations
- Sentiment trend over time
- Topic distribution
- Word cloud of key terms
- Platform distribution
- Comments list with sentiment indicators
- Influential users analysis

### Insights
- AI-generated summary of findings
- Engagement metrics with change indicators
- Identification of key topics and sentiment drivers

## 🧠 AI Capabilities

SocialPulseAI uses several AI techniques:

1. **Sentiment Analysis**: Analyzes the emotional tone of comments and classifies them as positive, negative, or neutral
2. **Topic Extraction**: Identifies key topics and themes from the collected content
3. **Engagement Scoring**: Calculates engagement metrics to identify influential content and users
4. **Trend Analysis**: Detects trends and patterns in sentiment and topics over time
5. **Insights Generation**: Creates human-readable insights from the analyzed data

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running in Production Mode
```bash
npm start
```

### Database Schema Updates
```bash
npm run db:push
```

## 📝 Notes

- When API keys are not configured, the application uses sample data
- The AI sentiment analysis and topic extraction use rule-based approaches but are designed to simulate more sophisticated AI models
- The application supports multi-language content with a focus on English and Telugu

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
author: Rajashekar.Arroju