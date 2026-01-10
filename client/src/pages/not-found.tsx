import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 text-center p-6">
        <CardContent className="pt-6 space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">404 - הדף לא נמצא</h1>
          <p className="text-gray-600">
            הדף שחיפשת אינו קיים או שהוסר.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full">חזור לדף הבית</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
