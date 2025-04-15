import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from "html2canvas";

// Components
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/dashboard/SearchBar";
import AIInsightsSummary from "@/components/dashboard/AIInsightsSummary";
import MetricsCards from "@/components/dashboard/MetricsCards";
import SentimentTrend from "@/components/dashboard/SentimentTrend";
import TopicDistribution from "@/components/dashboard/TopicDistribution";
import WordCloud from "@/components/dashboard/WordCloud";
import PlatformDistribution from "@/components/dashboard/PlatformDistribution";
import CommentsList from "@/components/dashboard/CommentsList";
import InfluentialUsers from "@/components/dashboard/InfluentialUsers";
import AlertSettings from "@/components/dashboard/AlertSettings";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    timeperiod: "30",
    platform: "all"
  });
  const [alertSettings, setAlertSettings] = useState({
    negativeSentimentSpike: true,
    engagementVolume: true,
    newTopicDetection: false
  });
  const [commentPage, setCommentPage] = useState(1);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Fetch data based on search params
  const { 
    data: searchResults, 
    isLoading, 
    refetch, 
    isFetching 
  } = useQuery<SearchResult>({
    queryKey: [`/api/analyze?keyword=${searchParams.keyword}&timeperiod=${searchParams.timeperiod}&platform=${searchParams.platform}&page=${commentPage}`],
    enabled: !!searchParams.keyword
  });

  // Handle search form submission
  const handleSearch = (values: { keyword: string; timeperiod: string; platform: string }) => {
    setCommentPage(1); // Reset to first page when new search is performed
    setSearchParams(values);
  };

  // Handle refresh data
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing data",
      description: "Updating your analytics dashboard with fresh data.",
    });
  };

  // Handle alert settings update
  const handleUpdateAlerts = (newAlerts: { [key: string]: boolean }) => {
    // Type assertion to make TypeScript happy
    setAlertSettings(newAlerts as {
      negativeSentimentSpike: boolean;
      engagementVolume: boolean;
      newTopicDetection: boolean;
    });
    
    // Save to server
    apiRequest("POST", "/api/settings/alerts", newAlerts)
      .then(() => {
        toast({
          title: "Alert settings updated",
          description: "Your notification preferences have been saved.",
        });
      })
      .catch(error => {
        toast({
          variant: "destructive",
          title: "Failed to save settings",
          description: error.message || "Please try again later.",
        });
      });
  };

  // Handle load more comments
  const handleLoadMoreComments = () => {
    setCommentPage(prevPage => prevPage + 1);
  };

  // Format last updated time
  const getLastUpdatedTime = () => {
    if (isFetching) return "Updating...";
    if (!searchResults?.lastUpdated) return "Not available";
    
    const updateTime = new Date(searchResults.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Export data as CSV
  const handleExportData = () => {
    if (!searchResults) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "No data available to export. Run an analysis first.",
      });
      return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Platform,User Name,Text,Sentiment,Language,Time\n";
    
    // Add comment data
    searchResults.comments.forEach(comment => {
      const row = [
        comment.platform,
        comment.userName,
        `"${comment.text.replace(/"/g, '""')}"`, // Escape quotes in text
        comment.sentiment,
        comment.language,
        comment.timeAgo
      ].join(",");
      csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${searchParams.keyword}_social_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Data has been exported to CSV file.",
    });
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    if (!searchResults) {
      toast({
        variant: "destructive",
        title: "Report generation failed",
        description: "No data available to generate report. Run an analysis first.",
      });
      return;
    }
    
    toast({
      title: "Generating report",
      description: "Please wait while we create your PDF report...",
    });

    try {
      // Create new PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`Social Media Analysis Report`, pageWidth / 2, 20, { align: 'center' });
      
      // Add subtitle with keyword
      pdf.setFontSize(16);
      pdf.setTextColor(52, 73, 94);
      pdf.text(`Keyword: ${searchParams.keyword}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add date
      const today = new Date();
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${today.toLocaleDateString()}`, pageWidth / 2, 38, { align: 'center' });
      
      // Add summary
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("AI Insights Summary", 14, 50);
      
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      const splitText = pdf.splitTextToSize(searchResults.aiInsights || "No insights available", pageWidth - 28);
      pdf.text(splitText, 14, 58);
      
      // Add metrics
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Key Metrics", 14, 90);
      
      // Create table for metrics
      (pdf as any).autoTable({
        startY: 95,
        head: [['Metric', 'Value', 'Change']],
        body: [
          ['Total Comments', searchResults.metrics.totalComments.toString(), `${searchResults.metrics.changes.totalComments > 0 ? '+' : ''}${searchResults.metrics.changes.totalComments}%`],
          ['Positive Sentiment', `${searchResults.metrics.positiveSentiment}%`, `${searchResults.metrics.changes.positiveSentiment > 0 ? '+' : ''}${searchResults.metrics.changes.positiveSentiment}%`],
          ['Negative Sentiment', `${searchResults.metrics.negativeSentiment}%`, `${searchResults.metrics.changes.negativeSentiment > 0 ? '+' : ''}${searchResults.metrics.changes.negativeSentiment}%`],
          ['Engagement Rate', `${searchResults.metrics.engagementRate}%`, `${searchResults.metrics.changes.engagementRate > 0 ? '+' : ''}${searchResults.metrics.changes.engagementRate}%`]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      
      // Add platform distribution
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Platform Distribution", 14, 20);
      
      (pdf as any).autoTable({
        startY: 25,
        head: [['Platform', 'Percentage']],
        body: searchResults.platformDistribution.map(item => [
          item.name, `${item.value}%`
        ]),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      
      // Add top influencers
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Top Influencers", 14, 90);
      
      (pdf as any).autoTable({
        startY: 95,
        head: [['Name', 'Platform', 'Comment Count', 'Engagement Level']],
        body: searchResults.influencers.map(influencer => [
          influencer.name, 
          influencer.platform,
          influencer.commentCount.toString(),
          influencer.engagementLevel
        ]),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
      
      // Add comment samples
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Sample Comments", 14, 20);
      
      // Only include first 10 comments to keep PDF reasonable
      const sampleComments = searchResults.comments.slice(0, 10);
      
      (pdf as any).autoTable({
        startY: 25,
        head: [['Platform', 'User', 'Comment', 'Sentiment']],
        body: sampleComments.map(comment => [
          comment.platform,
          comment.userName,
          comment.text.length > 100 ? comment.text.substring(0, 97) + '...' : comment.text,
          comment.sentiment
        ]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 20 }
        }
      });
      
      // Save PDF
      pdf.save(`${searchParams.keyword}_analysis_report.pdf`);
      
      toast({
        title: "Report generated",
        description: "PDF report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Report generation failed",
        description: "There was an error creating the PDF report.",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-0 md:pt-0 mt-16 md:mt-0" ref={dashboardRef}>
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="p-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-9">
                <SearchBar 
                  onSearch={handleSearch} 
                  isSearching={isLoading} 
                  defaultKeyword={searchParams.keyword} 
                />
              </div>
              
              <div className="lg:col-span-3 flex items-end justify-end">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  <div className="text-sm text-gray-500 mb-2 sm:mb-0 text-center sm:text-left">
                    Last updated: <span className="font-medium">{getLastUpdatedTime()}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="w-full sm:w-auto"
                  >
                    <span className="material-icons text-sm mr-1">
                      {isFetching ? "sync" : "refresh"}
                    </span>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert settings in a collapsible card */}
        <div className="bg-white border-b border-gray-100 py-2">
          <div className="max-w-7xl mx-auto px-4">
            <AlertSettings 
              alerts={alertSettings} 
              onUpdateAlerts={handleUpdateAlerts} 
            />
          </div>
        </div>

        <div className="p-4 max-w-7xl mx-auto">
          {searchResults ? (
            <div className="mb-6 mt-2">
              <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="text-sm text-gray-500 mb-1">Analysis results for</div>
                    <h2 className="text-xl font-semibold flex items-center flex-wrap">
                      <span>{searchParams.keyword}</span>
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Live
                      </span>
                      <span className="text-sm text-gray-500 ml-2 font-normal">
                        {searchParams.platform === 'all' ? 'All platforms' : 
                          searchParams.platform.charAt(0).toUpperCase() + searchParams.platform.slice(1)}
                        {' · '}
                        Last {searchParams.timeperiod} days
                      </span>
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportData}
                      disabled={isLoading}
                      className="flex-1 md:flex-none"
                    >
                      <span className="material-icons text-sm mr-1">download</span>
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateReport}
                      disabled={isLoading}
                      className="flex-1 md:flex-none"
                    >
                      <span className="material-icons text-sm mr-1">description</span>
                      Generate Report
                    </Button>
                    <Button size="sm" className="flex-1 md:flex-none">
                      <span className="material-icons text-sm mr-1">schedule</span>
                      Schedule Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : searchParams.keyword ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
              <span className="material-icons text-4xl text-gray-300 mb-2">search</span>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Analyzing "{searchParams.keyword}"</h3>
              <p className="text-sm text-gray-500">Please wait while we collect and analyze the data</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
              <span className="material-icons text-4xl text-gray-300 mb-2">search</span>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Start by searching for a keyword</h3>
              <p className="text-sm text-gray-500">Enter a name or keyword in the search box above</p>
            </div>
          )}

          <AIInsightsSummary 
            summary={searchResults?.aiInsights || null} 
            isLoading={isLoading} 
          />

          <MetricsCards 
            metrics={searchResults?.metrics || null} 
            isLoading={isLoading} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SentimentTrend 
              data={searchResults?.sentimentTrend || null} 
              isLoading={isLoading} 
            />
            <TopicDistribution 
              data={searchResults?.topicDistribution || null} 
              isLoading={isLoading} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WordCloud 
              data={searchResults?.topKeywords || null} 
              isLoading={isLoading} 
            />
            <PlatformDistribution 
              data={searchResults?.platformDistribution || null} 
              isLoading={isLoading} 
            />
          </div>

          <CommentsList 
            comments={searchResults?.comments || null} 
            isLoading={isLoading}
            onLoadMore={handleLoadMoreComments}
            hasMore={searchResults?.hasMoreComments || false}
          />

          <InfluentialUsers 
            influencers={searchResults?.influencers || null} 
            isLoading={isLoading} 
          />
        </div>
      </main>
    </div>
  );
}
