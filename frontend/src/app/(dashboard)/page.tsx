'use client';

import { useAuthStore } from '@/store/authStore';
import { useRecentCaptures } from '@/hooks/useCaptures';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { openDialog } = useUIStore();
  
  const { data: recentCaptures, isLoading } = useRecentCaptures(10);

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          You have {user.captureCount} captures in your library
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recent Captures</h2>
        <Button onClick={() => openDialog('capture')}>
          <Plus className="w-4 h-4 mr-2" />
          New Capture
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recentCaptures && recentCaptures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCaptures.map((capture) => (
            <Card 
              key={capture.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                if (capture.url) {
                  window.open(capture.url, '_blank');
                }
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {capture.title || capture.url || 'Untitled'}
                </CardTitle>
                <CardDescription>{formatRelativeTime(capture.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {capture.summary || capture.text || 'No content'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {capture.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No captures yet</p>
            <Button onClick={() => openDialog('capture')}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first capture
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
