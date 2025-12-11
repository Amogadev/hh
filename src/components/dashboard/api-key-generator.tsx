// This file is no longer used for the main dashboard page.
// You can remove it if you no longer need it, or keep it for other purposes.
"use client";

import * as React from "react";
import { generateGeminiApiKey } from "@/ai/flows/generate-gemini-api-key";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Copy, Check } from "lucide-react";

export function ApiKeyGenerator() {
  const [apiKey, setApiKey] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasCopied, setHasCopied] = React.useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerateKey = async () => {
    setIsLoading(true);
    setApiKey("");
    try {
      const result = await generateGeminiApiKey({});
      if (result.apiKey) {
        setApiKey(result.apiKey);
        toast({
          title: "API Key Generated",
          description: "Your new Gemini API key is ready.",
        });
      }
    } catch (error) {
      console.error("Failed to generate API key:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate an API key. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini API Key</CardTitle>
        <CardDescription>
          Generate a new Gemini API key for integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Generated Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              value={apiKey}
              readOnly
              placeholder="Click 'Generate' to create a key"
              className="pr-10"
            />
            {apiKey && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleCopy}
              >
                {hasCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy API Key</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateKey} disabled={isLoading}>
          <KeyRound className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate New Key"}
        </Button>
      </CardFooter>
    </Card>
  );
}
