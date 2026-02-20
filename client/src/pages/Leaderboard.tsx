import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, Wifi, WifiOff } from "lucide-react";
import { useRealtimeLeaderboard } from "@/hooks/useRealtimeLeaderboard";

export default function Leaderboard() {
  const { leaderboard, isLoading, isConnected } = useRealtimeLeaderboard();
  
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 md:h-8 md:w-8 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 md:h-7 md:w-7 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 md:h-6 md:w-6 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400";
    if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-400";
    if (rank <= 5) return "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30";
    return "bg-card border-border";
  };

  return (
    <div className="min-h-screen sacred-geometry-bg">
      <div className="container py-4 md:py-8">
        <SponsorBanner />
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4">🏆 Ramadan Challenge Leaderboard</h1>
          <p className="text-xs md:text-lg text-muted-foreground">
            Top performers competing for the grand prize
          </p>
        </div>

        <Card className="golden-border max-w-4xl mx-auto">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-2xl">Current Rankings</CardTitle>
                <CardDescription className="text-xs md:text-base">
                  Top 5 participants will receive monetary rewards at the end of Ramadan
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-xs md:text-sm text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs md:text-sm text-gray-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {isLoading ? (
              <div className="text-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
                Loading leaderboard...
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${getRankColor(entry.rank)}`}
                  >
                    <div className="flex-shrink-0 w-6 md:w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-shrink-0 w-6 md:w-12 text-center">
                      <div className="text-lg md:text-2xl font-bold text-foreground">
                        #{entry.rank}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs md:text-lg truncate">
                        {entry.userName}
                      </div>
                      {entry.isTopFive && (
                        <div className="text-xs text-primary font-medium">
                          🎁 Prize Eligible
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg md:text-2xl font-bold text-primary">
                        {entry.totalPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
                No participants yet. Be the first to submit your activities!
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 md:mt-8 max-w-4xl mx-auto space-y-6">
          {/* Donation CTA */}
          <Card className="golden-border" style={{backgroundColor: '#faf1e4', borderColor: '#d4a574', borderWidth: '3px'}}>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-xl" style={{color: '#1a1a2e'}}>Support This Challenge</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 space-y-4">
              <p className="text-xs md:text-sm" style={{color: '#333333'}}>
                Your donation helps increase prizes and keeps participants motivated throughout Ramadan.
              </p>
              <div className="p-3 rounded-lg" style={{backgroundColor: '#ffffff', border: '2px dashed #d4a574'}}>
                <p className="text-xs font-semibold mb-1" style={{color: '#b8860b'}}>BANK CARD</p>
                <p className="text-sm font-mono font-bold" style={{color: '#1a1a2e'}}>4400 4303 8246 3625</p>
              </div>
              <Button asChild className="w-full golden-glow text-xs md:text-sm">
                <a href="/donate">Learn More About Donations</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="golden-border bg-primary/5">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-xl">Prize Information</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <p className="flex items-center gap-2">
                  <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0" />
                  <span className="font-semibold">1st Place:</span> <span className="hidden sm:inline">Grand Prize</span>
                </p>
                <p className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold">2nd Place:</span> <span className="hidden sm:inline">Second Prize</span>
                </p>
                <p className="flex items-center gap-2">
                  <Medal className="h-4 w-4 md:h-5 md:w-5 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold">3rd Place:</span> <span className="hidden sm:inline">Third Prize</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">4th & 5th:</span> <span className="hidden sm:inline">Consolation Prizes</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
