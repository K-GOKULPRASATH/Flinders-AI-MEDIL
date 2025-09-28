"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { DiagnosisForm, type DiagnosisFormValues } from "@/components/dashboard/diagnosis-form";
import { DiagnosisResults } from "@/components/dashboard/diagnosis-results";
import { getIcdCodes } from "@/lib/actions";
import type { IcdCodeResults } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { ResultsSkeleton } from "@/components/dashboard/results-skeleton";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<IcdCodeResults | null>(null);
  const [query, setQuery] = useState<DiagnosisFormValues | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isClient]);

  const handleFormSubmit = async (data: DiagnosisFormValues) => {
    setIsLoading(true);
    setResults(null);
    setQuery(data);
    try {
      const res = await getIcdCodes(data);
      setResults(res);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <DiagnosisForm onSubmit={handleFormSubmit} isSubmitting={isLoading} />
          {isLoading && <ResultsSkeleton />}
          {results && query && <DiagnosisResults results={results} query={query} />}
        </div>
      </main>
    </div>
  );
}
