import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Send, CheckCircle, Clock } from 'lucide-react';

export default function AnnouncementsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const { data: announcements, refetch } = trpc.announcements.list.useQuery();

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success('Announcement created successfully');
      setFormData({ title: '', content: '' });
      setIsCreating(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create announcement');
    },
  });

  const sendMutation = trpc.announcements.send.useMutation({
    onSuccess: () => {
      toast.success('Announcement sent to all participants');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send announcement');
    },
  });

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
    });
  };

  const handleSend = (announcementId: number) => {
    sendMutation.mutate({ announcementId });
  };

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <Card className="golden-border">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Create New Announcement</CardTitle>
          <CardDescription>Send important updates to all participants</CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              New Announcement
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs md:text-sm">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  className="text-sm md:text-base h-8 md:h-10"
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-xs md:text-sm">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content"
                  className="text-sm md:text-base min-h-24"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 text-sm md:text-base h-8 md:h-10"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1 text-sm md:text-base h-8 md:h-10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card className="golden-border">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Announcements</CardTitle>
          <CardDescription>Manage and send announcements to participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(announcements || []).map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-3 md:p-4 space-y-2 hover:bg-accent/50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate">{announcement.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {announcement.status === 'draft' && (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    {announcement.status === 'sent' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    Status: <span className="font-semibold capitalize">{announcement.status}</span>
                  </span>
                  {announcement.status === 'draft' && (
                    <Button
                      onClick={() => handleSend(announcement.id)}
                      disabled={sendMutation.isPending}
                      size="sm"
                      className="h-6 md:h-8 text-xs md:text-sm"
                    >
                      <Send className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!announcements || announcements.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No announcements yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
