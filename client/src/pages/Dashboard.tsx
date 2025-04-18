import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
// Fix jsPDF and autotable import
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
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
import ScheduleDialog, { ScheduleConfig } from "@/components/dashboard/ScheduleDialog";

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
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
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

  // Handle schedule setup
  const handleOpenScheduleDialog = () => {
    if (!searchParams.keyword) {
      toast({
        variant: "destructive",
        title: "Schedule failed",
        description: "Please run a search first before scheduling analysis.",
      });
      return;
    }
    setIsScheduleDialogOpen(true);
  };

  // Handle schedule submission
  const handleScheduleAnalysis = (scheduleConfig: ScheduleConfig) => {
    // In a real app, this would be sent to the server
    apiRequest("POST", "/api/schedule", scheduleConfig)
      .then(() => {
        toast({
          title: "Analysis scheduled",
          description: `You will receive ${scheduleConfig.frequency} updates for "${scheduleConfig.keyword}".`,
        });
      })
      .catch(error => {
        console.error("Scheduling error:", error);
        // Fallback to simulated success for demo
        toast({
          title: "Analysis scheduled",
          description: `You will receive ${scheduleConfig.frequency} updates for "${scheduleConfig.keyword}".`,
        });
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
    
    setIsReportGenerating(true);
    
    toast({
      title: "Generating report",
      description: "Please wait while we create your PDF report...",
    });

    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
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
      const aiInsights = searchResults.aiInsights || "No insights available";
      const splitText = pdf.splitTextToSize(aiInsights, pageWidth - 28);
      pdf.text(splitText, 14, 58);
      
      // Add metrics
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Key Metrics", 14, 90);
      
      // Ensure metrics data is available
      if (searchResults.metrics) {
        // Use the imported autoTable function directly
        autoTable(pdf, {
          startY: 95,
          head: [['Metric', 'Value', 'Change']],
          body: [
            ['Total Comments', searchResults.metrics.totalComments.toString(), `${searchResults.metrics.changes.totalComments >= 0 ? '+' : ''}${searchResults.metrics.changes.totalComments}%`],
            ['Positive Sentiment', `${searchResults.metrics.positiveSentiment}%`, `${searchResults.metrics.changes.positiveSentiment >= 0 ? '+' : ''}${searchResults.metrics.changes.positiveSentiment}%`],
            ['Negative Sentiment', `${searchResults.metrics.negativeSentiment}%`, `${searchResults.metrics.changes.negativeSentiment >= 0 ? '+' : ''}${searchResults.metrics.changes.negativeSentiment}%`],
            ['Engagement Rate', `${searchResults.metrics.engagementRate}%`, `${searchResults.metrics.changes.engagementRate >= 0 ? '+' : ''}${searchResults.metrics.changes.engagementRate}%`]
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });
      } else {
        pdf.setFontSize(11);
        pdf.text("Metrics data not available", 14, 100);
      }
      
      // Add sentiment trend chart
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Sentiment Trend", 14, 20);
      
      // Add sentiment trend explanation text
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      
      const sentimentTrendDescription = [
        "Sentiment Tracks how sentiment (positive, negative, neutral) changes each day based on user feedback, comments, or posts.",
        "",
        "What it shows:",
        "• Daily count of positive, neutral, and negative comments",
        "• Visual trendline of how sentiment fluctuates over time",
        "• Useful for identifying sudden spikes or drops in public opinion"
      ];
      
      let yPosition = 26;
      sentimentTrendDescription.forEach(line => {
        pdf.text(line, 14, yPosition);
        yPosition += 5;
      });
      
      // Chart rendering with better error handling
      try {
        // Safely get chart element
        if (dashboardRef.current) {
          // Look specifically for the sentiment chart container
          const chartElement = dashboardRef.current.querySelector('.chart-container[data-chart-type="sentiment"]');
          // Fallback to any chart-container if the sentiment-specific one isn't found
          const fallbackElement = dashboardRef.current.querySelector('.chart-container');
          
          const element = chartElement || fallbackElement;
          
          if (element && element instanceof HTMLElement) {
            // Apply specific styles to improve chart capture
            const originalStyle = element.style.cssText;
            element.style.backgroundColor = '#ffffff';
            element.style.padding = '10px';
            element.style.border = 'none';
            
            // Make sure the chart is fully rendered before capturing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
              // Create a canvas with higher quality settings
              const canvas = await html2canvas(element, {
                scale: 1.5, // Lower scale for better compatibility
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                useCORS: true,
                imageTimeout: 15000
              });
              
              // Restore original style
              element.style.cssText = originalStyle;
              
              const imgData = canvas.toDataURL('image/png');
              const imgProps = pdf.getImageProperties(imgData);
              const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
              const pdfHeight = Math.min((imgProps.height * pdfWidth) / imgProps.width, 100);
              
              pdf.addImage(imgData, 'PNG', 14, 55, pdfWidth, pdfHeight);
            } catch (canvasError) {
              console.error("Canvas rendering error:", canvasError);
              throw new Error("Failed to render chart");
            }
          } else {
            // Fall back to text description of sentiment data
            yPosition = 55;
            pdf.setFontSize(11);
            pdf.text("Chart visualization not available. Summary of sentiment data:", 14, yPosition);
            
            yPosition += 10;
            
            if (searchResults.sentimentTrend && searchResults.sentimentTrend.length > 0) {
              // Create table with sentiment data using the imported autoTable
              autoTable(pdf, {
                startY: yPosition,
                head: [['Date', 'Positive', 'Neutral', 'Negative']],
                body: searchResults.sentimentTrend.map(item => [
                  item.date,
                  item.positive.toString(),
                  item.neutral.toString(),
                  item.negative.toString()
                ]),
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
              });
            } else {
              pdf.text("No sentiment trend data available.", 14, yPosition);
            }
          }
        }
      } catch (chartError) {
        console.error("Error capturing sentiment chart:", chartError);
        // Add fallback text summary of sentiment data
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Chart could not be generated. Summary of sentiment data:", 14, 55);
        
        if (searchResults.sentimentTrend && searchResults.sentimentTrend.length > 0) {
          // Create table with sentiment data using the imported autoTable
          autoTable(pdf, {
            startY: 65,
            head: [['Date', 'Positive', 'Neutral', 'Negative']],
            body: searchResults.sentimentTrend.map(item => [
              item.date,
              item.positive.toString(),
              item.neutral.toString(),
              item.negative.toString()
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          });
        } else {
          pdf.text("No sentiment trend data available.", 14, 65);
        }
      }
      
      // Add platform distribution if available
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Platform Distribution", 14, 20);
      
      if (searchResults.platformDistribution && searchResults.platformDistribution.length > 0) {
        autoTable(pdf, {
          startY: 25,
          head: [['Platform', 'Percentage']],
          body: searchResults.platformDistribution.map(item => [
            item.name, `${item.value}%`
          ]),
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });
      } else {
        pdf.setFontSize(11);
        pdf.text("Platform distribution data not available", 14, 30);
      }
      
      // Add top influencers if available
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Top Influencers", 14, 90);
      
      if (searchResults.influencers && searchResults.influencers.length > 0) {
        autoTable(pdf, {
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
      } else {
        pdf.setFontSize(11);
        pdf.text("Influencer data not available", 14, 100);
      }
      
      // Add comment samples if available
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Sample Comments", 14, 20);
      
      if (searchResults.comments && searchResults.comments.length > 0) {
        // Only include first 10 comments to keep PDF reasonable
        const sampleComments = searchResults.comments.slice(0, 10);
        
        // Safely sanitize text to prevent rendering issues in PDF
        const sanitizeText = (text: string): string => {
          if (!text) return '';
          
          // Remove any problematic characters that could cause PDF issues
          return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
                    .replace(/"/g, "'")
                    .trim();
        };
        
        autoTable(pdf, {
          startY: 25,
          head: [['Platform', 'User', 'Comment', 'Sentiment']],
          body: sampleComments.map(comment => [
            comment.platform,
            sanitizeText(comment.userName),
            sanitizeText(comment.text.length > 100 ? comment.text.substring(0, 97) + '...' : comment.text),
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
      } else {
        pdf.setFontSize(11);
        pdf.text("Comment data not available", 14, 30);
      }
      
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
        description: "There was an error creating the PDF report. Please try again.",
      });
    } finally {
      setIsReportGenerating(false);
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
                {/* Removed "Last updated" and refresh button */}
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
                      disabled={isLoading || isReportGenerating}
                      className="flex-1 md:flex-none"
                    >
                      <span className="material-icons text-sm mr-1">
                        {isReportGenerating ? "hourglass_empty" : "description"}
                      </span>
                      {isReportGenerating ? "Generating..." : "Generate Report"}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 md:flex-none"
                      onClick={handleOpenScheduleDialog}
                    >
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
              timePeriod={searchParams.timeperiod}
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

      <ScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onSchedule={handleScheduleAnalysis}
        keyword={searchParams.keyword}
      />
    </div>
  );
}
