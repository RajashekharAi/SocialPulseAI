import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search, Globe, Video, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const searchFormSchema = z.object({
  keyword: z.string().min(1, "Please enter a keyword or name"),
  timeperiod: z.string(),
  platform: z.string(),
  isVideoTitleSearch: z.boolean().default(false)
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

type SearchBarProps = {
  onSearch: (values: SearchFormValues) => void;
  isSearching: boolean;
  defaultKeyword?: string;
};

export default function SearchBar({ onSearch, isSearching, defaultKeyword = "" }: SearchBarProps) {
  // Add a unique key to force form reset when needed
  const [formKey, setFormKey] = useState<number>(0);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      keyword: defaultKeyword,
      timeperiod: "30",
      platform: "all",
      isVideoTitleSearch: false
    }
  });

  const watchIsVideoTitleSearch = form.watch("isVideoTitleSearch");
  const watchPlatform = form.watch("platform");
  const watchKeyword = form.watch("keyword");

  // When YouTube video title search is enabled, automatically select YouTube as platform
  useEffect(() => {
    if (watchIsVideoTitleSearch && watchPlatform !== "youtube") {
      form.setValue("platform", "youtube");
    }
  }, [watchIsVideoTitleSearch, watchPlatform, form]);

  const handleSubmit = (values: SearchFormValues) => {
    // Always trigger a search, even if values haven't changed
    onSearch(values);
  };

  return (
    <div className="w-full">
      <Form {...form} key={formKey}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      {watchIsVideoTitleSearch ? "Enter YouTube Video Title" : "Search Keyword or Person"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={watchIsVideoTitleSearch ? 
                            "Enter exact YouTube video title" : 
                            "Enter name or keyword"}
                          {...field}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400 flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          <span className="text-xs">EN/TE</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="timeperiod"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                  Platforms
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={watchIsVideoTitleSearch}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platforms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter (X)</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <div className="md:col-span-1 flex items-end">
            <Button 
              type="submit" 
              className="w-full h-10"
              disabled={isSearching || !watchKeyword}
            >
              <Search className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline-block">{isSearching ? "Analyzing..." : "Analyze"}</span>
            </Button>
          </div>

          {/* YouTube Video Title Analysis moved to after Platforms */}
          <div className="md:col-span-12 mt-3">
            <FormField
              control={form.control}
              name="isVideoTitleSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-start space-x-2 space-y-0 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">YouTube Video Title Analysis</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
