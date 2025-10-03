import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const Messages = () => {
  return (
    <div className="min-h-screen bg-gradient-hero pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Your messages will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};