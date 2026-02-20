import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Users, TrendingUp, Calendar, Shield, Bell, Mail } from "lucide-react";
import { useLocation } from "wouter";
import AnnouncementsManager from "@/components/AnnouncementsManager";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'email'>('overview');
  const [publishDate, setPublishDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: allUsers, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const publishLeaderboard = trpc.admin.publishLeaderboard.useMutation({
    onSuccess: (data) => {
      toast.success(`Leaderboard published for ${publishDate}!`);
    },
    onError: (error) => {
      toast.error(`Failed to publish leaderboard: ${error.message}`);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }
  
  const SponsorBanner = () => (
    <div className="mb-6 p-3 md:p-4 rounded-lg text-center" style={{backgroundColor: '#faf1e4', borderWidth: '0px'}}>
      <p className="text-sm md:text-base font-semibold" style={{color: '#b8860b'}}>
        Sponsored by{" "}
        <a
          href="https://ktlianwears.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline font-bold"
        >
          Ktlian Wears :)
        </a>
      </p>
    </div>
  );

  const handlePublish = () => {
    publishLeaderboard.mutate({ publishDate });
  };

  return (
    <div className="min-h-screen sacred-geometry-bg">
      <div className="container py-8">
        <SponsorBanner />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage participants, publish leaderboard, and send announcements</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className="rounded-b-none"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'announcements' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('announcements')}
              className="rounded-b-none"
            >
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </Button>
            <Button
              variant={activeTab === 'email' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('email')}
              className="rounded-b-none"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && (
        <div className="grid gap-6 mb-8">
          {/* Publish Leaderboard Card */}
          <Card className="golden-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Publish Leaderboard
              </CardTitle>
              <CardDescription>
                Publish the current leaderboard snapshot for a specific date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="publishDate">Publication Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handlePublish}
                    disabled={publishLeaderboard.isPending}
                    className="golden-glow w-full sm:w-auto"
                  >
                    {publishLeaderboard.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Leaderboard"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Participants Card */}
          <Card className="golden-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Participants
              </CardTitle>
              <CardDescription>
                View all registered users and their statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading participants...
                </div>
              ) : allUsers && allUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Total Points</TableHead>
                        <TableHead className="text-right">Activities</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.name || 'Anonymous'}
                          </TableCell>
                          <TableCell>{participant.email || 'N/A'}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                participant.role === 'admin'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {participant.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {participant.totalPoints}
                          </TableCell>
                          <TableCell className="text-right">
                            {participant.activityCount}
                          </TableCell>
                          <TableCell>
                            {participant.activityCount > 0 ? 'Active' : 'Registered'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No participants registered yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Total Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {allUsers?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {allUsers?.filter(u => u.activityCount > 0).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Total Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {allUsers?.reduce((sum, u) => sum + u.activityCount, 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsManager />
        )}

        {activeTab === 'email' && (
          <EmailSenderCard participants={allUsers || []} />
        )}
      </div>
    </div>
  );
}

function EmailSenderCard({ participants }: { participants: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const sendEmailMutation = trpc.admin.sendEmail.useMutation({
    onSuccess: () => {
      toast.success('Email sent successfully!');
      setSubject('');
      setMessage('');
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to send email: ${error?.message || 'Unknown error'}`);
    },
  });

  const handleSend = () => {
    if (!selectedUserId || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    sendEmailMutation.mutate({ userId: selectedUserId, subject, message });
  };

  return (
    <div className="grid gap-6">
      <Card className="golden-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email to Participant
          </CardTitle>
          <CardDescription>
            Send an individual email to a specific participant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="participant">Select Participant</Label>
              <select
                id="participant"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
              >
                <option value="">-- Choose a participant --</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || 'Anonymous'} ({p.email || 'no-email'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                placeholder="Email message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1 min-h-32 font-sans"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sendEmailMutation.isPending || !selectedUserId}
              className="w-full golden-glow"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
