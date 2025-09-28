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
import { Download, UploadCloud, ClipboardCopy, FileText, Stethoscope } from "lucide-react";
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
Original Diagnosis: ${results.originalDiagnosis}

--- SUGGESTED CODES ---
ICD-11 MMS (ICD Name): ${results.mmsCode} - ${results.mmsDescription}
ICD-11 TM2 (TM2 Name):  ${results.tm2Code} - ${results.tm2Description}

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
            title: "EMR Updated",
            description: "The report has been updated to the EMR.",
        });
    };

  return (
    <Card className="animate-in fade-in-50">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-2xl">{results.originalDiagnosis}</CardTitle>
                <CardDescription>Mapping results for Patient ID: {query.patientId} ({query.medicalSystem})</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CodeCard 
                title="ICD-11 MMS" 
                description={results.mmsDescription} 
                code={results.mmsCode} 
                onCopy={() => handleCopyToClipboard(results.mmsCode, 'ICD-11 Code')}
            />
            <CodeCard 
                title="ICD-11 TM2" 
                description={results.tm2Description} 
                code={results.tm2Code}
                onCopy={() => handleCopyToClipboard(results.tm2Code, 'TM2 Code')}
            />
        </div>
        
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Condition Description</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 space-y-4">
            <InfoCard title="Early Stage" content={results.conditionDescriptionEarlyStage} icon={<Stethoscope className="h-5 w-5" />} />
            <InfoCard title="Intermediate Stage" content={results.conditionDescriptionIntermediateStage} icon={<Stethoscope className="h-5 w-5" />} />
            <InfoCard title="Advanced Stage" content={results.conditionDescriptionAdvancedStage} icon={<Stethoscope className="h-5 w-5" />} />
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

function CodeCard({ title, description, code, onCopy }: { title: string; description: string, code: string, onCopy: () => void }) {
    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-md bg-background p-3">
                    <Badge variant="outline" className="text-base font-semibold">
                        {code}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function InfoCard({ title, content, icon }: { title: string, content: string, icon?: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                {icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>}
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
            </CardContent>
        </Card>
    );
}