"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IcdCodeResults, DiagnosisFormValues } from "@/lib/types";
import { Download, UploadCloud, ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagnosisResultsProps {
  results: IcdCodeResults;
  query: DiagnosisFormValues;
}

export function DiagnosisResults({ results, query }: DiagnosisResultsProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        const reportContent = `
MediLexicon Assistant - Diagnosis Report
=======================================

Date: ${new Date().toLocaleString()}

--- ORIGINAL QUERY ---
Patient ID:     ${query.patientId}
Medical System: ${query.medicalSystem}
Diagnosis:      ${query.diagnosis}

--- SUGGESTED CODES ---
ICD-11 MMS: ${results.mmsCode} - ${results.mmsDescription}
ICD-11 TM2: ${results.tm2Code} - ${results.tm2Description}

--- CONDITION DESCRIPTION ---
Early Stage:
${results.conditionDescriptionEarlyStage}

Intermediate Stage:
${results.conditionDescriptionIntermediateStage}

Advanced Stage:
${results.conditionDescriptionAdvancedStage}

--- RECOMMENDATIONS ---
Lifestyle:
${results.lifestyleRecommendations}

Dietary:
${results.dietaryRecommendations}

Therapeutic:
${results.therapeuticRecommendations}
        `;

        const blob = new Blob([reportContent.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MediLexicon_Report_${query.patientId}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Report Downloaded",
            description: "The text report has been saved to your device.",
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard",
            description: `${label} has been copied.`,
        });
    };
    
    const handleUpdateEMR = () => {
        toast({
            title: "Feature Not Implemented",
            description: "This is a placeholder for EMR integration.",
        });
    };

  return (
    <Card className="animate-in fade-in-50">
      <CardHeader>
        <CardTitle>Mapping Complete</CardTitle>
        <CardDescription>
          AI has generated the following mapping and recommendations for '{query.diagnosis}'.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-semibold">Suggested Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CodeCard title="ICD-11 MMS" code={results.mmsCode} description={results.mmsDescription} onCopy={handleCopyToClipboard} />
                <CodeCard title="ICD-11 TM2" code={results.tm2Code} description={results.tm2Description} onCopy={handleCopyToClipboard} />
            </div>
        </div>
        <Separator />
        
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Condition Description</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 space-y-4">
            <InfoCard title="Early Stage" content={results.conditionDescriptionEarlyStage} />
            <InfoCard title="Intermediate Stage" content={results.conditionDescriptionIntermediateStage} />
            <InfoCard title="Advanced Stage" content={results.conditionDescriptionAdvancedStage} />
          </TabsContent>
          <TabsContent value="recommendations" className="mt-4 space-y-4">
            <InfoCard title="Lifestyle Recommendations" content={results.lifestyleRecommendations} />
            <InfoCard title="Dietary Recommendations" content={results.dietaryRecommendations} />
            <InfoCard title="Therapeutic Recommendations" content={results.therapeuticRecommendations} />
          </TabsContent>
        </Tabs>

      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
        </Button>
        <Button onClick={handleUpdateEMR}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Update to EMR
        </Button>
      </CardFooter>
    </Card>
  );
}

function CodeCard({ title, code, description, onCopy }: { title: string, code: string, description: string, onCopy: (text: string, label: string) => void }) {
    return (
        <Card className="bg-secondary/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(`${code} - ${description}`, title)}>
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Badge variant="default" className="text-sm font-mono mb-2">{code}</Badge>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

function InfoCard({ title, content }: { title: string, content: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
            </CardContent>
        </Card>
    );
}
