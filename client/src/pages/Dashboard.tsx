import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);
  
  // Sponsor banner
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

  
  // Display name state
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const updateDisplayNameMutation = trpc.auth.updateDisplayName.useMutation();

  // Activity form states
  const [dailyPrayers, setDailyPrayers] = useState(0);
  const [tahajud, setTahajud] = useState(0);
  const [tarawih20, setTarawih20] = useState(0);
  const [tarawih8, setTarawih8] = useState(0);
  const [fasting, setFasting] = useState(0);
  const [quranArabicPages, setQuranArabicPages] = useState(0);
  const [quranOtherLanguagePages, setQuranOtherLanguagePages] = useState(0);
  const [islamicBookPages, setIslamicBookPages] = useState(0);
  const [otherBookPages, setOtherBookPages] = useState(0);

  const [podcastMinutes, setPodcastMinutes] = useState(0);
  const [salawat, setSalawat] = useState(0);
  const [notes, setNotes] = useState("");

  // Queries
  const { data: selectedActivity } = trpc.activities.getActivityByDate.useQuery({
    activityDate: selectedDate,
  });

  const { data: myActivities } = trpc.activities.getMyActivities.useQuery();
  const submitMutation = trpc.activities.submitDaily.useMutation();
  const deleteMutation = trpc.activities.deleteActivity.useMutation();
  const utils = trpc.useUtils();

  // Load today's activity if it exists
useEffect(() => {
  if (selectedActivity) {
    setDailyPrayers(selectedActivity.dailyPrayers || 0);
    setTahajud(selectedActivity.tahajud || 0);
    setTarawih20(selectedActivity.tarawih20 || 0);
    setTarawih8(selectedActivity.tarawih8 || 0);
    setFasting(selectedActivity.fasting || 0);
    setQuranArabicPages(selectedActivity.quranArabicPages || 0);
    setQuranOtherLanguagePages(selectedActivity.quranOtherLanguagePages || 0);
    setIslamicBookPages(selectedActivity.islamicBookPages || 0);
    setOtherBookPages(selectedActivity.otherBookPages || 0);
    setPodcastMinutes(selectedActivity.podcastMinutes || 0);
    setSalawat(selectedActivity.salawat || 0);
    setNotes(selectedActivity.notes || "");
  } else {
    // CLEAR form when no activity exists for that date
    setDailyPrayers(0);
    setTahajud(0);
    setTarawih20(0);
    setTarawih8(0);
    setFasting(0);
    setQuranArabicPages(0);
    setQuranOtherLanguagePages(0);
    setIslamicBookPages(0);
    setOtherBookPages(0);
    setPodcastMinutes(0);
    setSalawat(0);
    setNotes("");
  }
}, [selectedActivity]);

  // Show loading state while checking authentication
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

  // Redirect happens automatically via useAuth hook, but add safety check
  if (!isAuthenticated) {
    return null;
  }

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    try {
      await updateDisplayNameMutation.mutateAsync({ displayName });
      toast.success("Display name updated successfully!");
      setIsEditingName(false);
    } catch (error) {
      toast.error("Failed to update display name");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await submitMutation.mutateAsync({
        activityDate: selectedDate,
        dailyPrayers,
        tahajud,
        tarawih20,
        tarawih8,
        fasting,
        quranArabicPages,
        quranOtherLanguagePages,
                islamicBookPages,
                otherBookPages,
        podcastMinutes,
        salawat,
        notes,
      });
      toast.success(`Activities submitted for ${selectedDate}! You earned ${result.totalPoints} points.`);
    } catch (error) {
      toast.error("Failed to submit activities");
    }
  };

  // Calculate today's points
  const selectedPoints = selectedActivity?.totalPoints || 0;
  const totalPoints = (myActivities || []).reduce((sum, a) => sum + (a.totalPoints || 0), 0);

  return (
    <div className="min-h-screen sacred-geometry-bg">
      <div className="container py-4 md:py-8">
        <SponsorBanner />
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Welcome, {user?.name || "Participant"}!</h1>
              <p className="text-xs md:text-base text-muted-foreground">Track your daily Ramadan activities and earn points</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditingName(!isEditingName)} className="whitespace-nowrap">
              {isEditingName ? "Cancel" : "Edit Name"}
            </Button>
          </div>
          {isEditingName && (
            <div className="mt-4 p-4 bg-muted rounded-lg flex gap-2 flex-col sm:flex-row">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your display name" maxLength={100} className="text-sm" />
              <Button onClick={handleUpdateDisplayName} disabled={updateDisplayNameMutation.isPending} size="sm" className="whitespace-nowrap">
                {updateDisplayNameMutation.isPending ? "Saving..." : "Save Name"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 md:mb-8">
          <Card className="golden-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Points for {selectedDate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-primary">{selectedPoints}</div>
            </CardContent>
          </Card>

          <Card className="golden-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-primary">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="golden-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
                Activities Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-primary">{myActivities?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Activity Form */}
          <div className="lg:col-span-2">
            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Log Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="border-b pb-4">
  <Label htmlFor="activityDate" className="text-xs md:text-sm">
    Select Date
  </Label>
  <Input
    id="activityDate"
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    max={new Date().toISOString().split("T")[0]}
    className="text-sm md:text-base h-8 md:h-10"
  />
</div>
                  
                  {/* Prayer Activities */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-base md:text-lg mb-3 text-primary">Prayer Activities</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <Label htmlFor="dailyPrayers" className="text-xs md:text-sm">Daily Prayers (10 pts each)</Label>
                        <Input
                          id="dailyPrayers"
                          type="number"
                          min="0"
                          max="5"
                          value={dailyPrayers}
                          onChange={(e) => setDailyPrayers(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tahajud" className="text-xs md:text-sm">Tahajud (30 pts each)</Label>
                        <Input
                          id="tahajud"
                          type="number"
                          min="0"
                          value={tahajud}
                          onChange={(e) => setTahajud(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tarawih20" className="text-xs md:text-sm">Tarawih 20 Rakat (100 pts)</Label>
                        <Input
                          id="tarawih20"
                          type="number"
                          min="0"
                          value={tarawih20}
                          onChange={(e) => setTarawih20(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tarawih8" className="text-xs md:text-sm">Tarawih 8 Rakat (40 pts)</Label>
                        <Input
                          id="tarawih8"
                          type="number"
                          min="0"
                          value={tarawih8}
                          onChange={(e) => setTarawih8(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fasting" className="text-xs md:text-sm">Fasting (100 pts)</Label>
                        <Input
                          id="fasting"
                          type="number"
                          min="0"
                          max="1"
                          value={fasting}
                          onChange={(e) => setFasting(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quran Reading */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-base md:text-lg mb-3 text-primary">Quran Reading</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <Label htmlFor="quranArabic" className="text-xs md:text-sm">Arabic Quran Pages (20 pts)</Label>
                        <Input
                          id="quranArabic"
                          type="number"
                          min="0"
                          value={quranArabicPages}
                          onChange={(e) => setQuranArabicPages(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quranOther" className="text-xs md:text-sm">Quran Other Language Pages (10 pts)</Label>
                        <Input
                          id="quranOther"
                          type="number"
                          min="0"
                          value={quranOtherLanguagePages}
                          onChange={(e) => setQuranOtherLanguagePages(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Reading & Learning */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-base md:text-lg mb-3 text-primary">Reading & Learning</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <Label htmlFor="islamicBook" className="text-xs md:text-sm">Islamic Book Pages (8 pts)</Label>
                        <Input
                          id="islamicBook"
                          type="number"
                          min="0"
                          value={islamicBookPages}
                          onChange={(e) => setIslamicBookPages(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="otherBook" className="text-xs md:text-sm">Other Book Pages (4 pts)</Label>
                        <Input
                          id="otherBook"
                          type="number"
                          min="0"
                          value={otherBookPages}
                          onChange={(e) => setOtherBookPages(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="podcast" className="text-xs md:text-sm">Podcast Minutes (3 pts/min)</Label>
                        <Input
                          id="podcast"
                          type="number"
                          min="0"
                          value={podcastMinutes}
                          onChange={(e) => setPodcastMinutes(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salawat" className="text-xs md:text-sm">Salawat (10 = 1 pt)</Label>
                        <Input
                          id="salawat"
                          type="number"
                          min="0"
                          value={salawat}
                          onChange={(e) => setSalawat(parseInt(e.target.value) || 0)}
                          className="text-sm md:text-base h-8 md:h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-xs md:text-sm">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes about your activities..."
                      className="text-sm md:text-base min-h-20"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full text-sm md:text-base h-8 md:h-10"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Activities"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities & Donation */}
          <div className="space-y-6">
            {/* Donation CTA Card */}
            <Card className="golden-border" style={{backgroundColor: '#faf1e4', borderColor: '#d4a574', borderWidth: '3px'}}>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl" style={{color: '#1a1a2e'}}>Support the Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{color: '#333333'}}>
                  Your donation helps increase prizes and keep participants motivated.
                </p>
                <div className="p-3 rounded-lg" style={{backgroundColor: '#ffffff', border: '2px dashed #d4a574'}}>
                  <p className="text-xs font-semibold mb-1" style={{color: '#b8860b'}}>BANK CARD</p>
                  <p className="text-sm font-mono font-bold" style={{color: '#1a1a2e'}}>4400 4303 8246 3625</p>
                </div>
                <Button asChild className="w-full golden-glow text-xs md:text-sm">
                  <a href="/donate">Learn More</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(myActivities || []).map((activity) => (
                    <div key={activity.id} className="border-l-4 border-primary pl-3 py-2 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{activity.activityDate}</div>
                        <div className="text-sm text-muted-foreground">{activity.totalPoints} points</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete activity from ${activity.activityDate}? You can resubmit it after deletion.`)) {
                            deleteMutation.mutate(
                              { activityDate: activity.activityDate },
                              {
                                onSuccess: () => {
                                  toast.success('Activity deleted successfully');
                                  utils.activities.getMyActivities.invalidate();
                                },
                                onError: (error) => {
                                  toast.error('Failed to delete activity');
                                },
                              }
                            );
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                  {(!myActivities || myActivities.length === 0) && (
                    <p className="text-sm text-muted-foreground">No activities logged yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
