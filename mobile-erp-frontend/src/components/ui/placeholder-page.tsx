"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed py-20">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <Icon className="h-12 w-12 text-slate-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Under Development</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We are working hard to bring you the most comprehensive {title.toLowerCase()} experience. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
