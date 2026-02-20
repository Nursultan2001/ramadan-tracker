import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, Sparkles, Users, TrendingUp, Gift, Heart } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="sacred-geometry-bg relative py-12 md:py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4 md:mb-8 inline-block">
              <div className="text-4xl md:text-6xl mb-2 md:mb-4">🌙</div>
            </div>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-6 leading-tight">
              Ramadan Challenge
              <span className="block text-primary mt-1 md:mt-2">Tracker</span>
            </h1>
            <p className="text-xs md:text-lg lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              Track your spiritual journey, compete with fellow believers, and earn rewards for your dedication during the blessed month of Ramadan.
            </p>
            {/* Sponsorship Section */}
            <div className="mb-8 md:mb-12 p-6 md:p-8 rounded-xl" style={{backgroundColor: '#faf1e4', borderWidth: '0px'}}>
              <p className="text-lg md:text-2xl font-bold mb-2" style={{color: '#b8860b'}}>Proudly Sponsored by</p>
              <a
                href="https://ktlianwears.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl md:text-4xl font-bold hover:underline transition-all"
                style={{color: '#d4a574'}}
              >
                Ktlian Wears :)
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="sm" className="golden-glow text-xs md:text-lg md:px-8">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-xs md:text-lg md:px-8">
                    <Link href="/leaderboard">View Leaderboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" className="golden-glow text-xs md:text-lg md:px-8">
                    <Link href="/register">Join Challenge</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-xs md:text-lg md:px-8">
                    <Link href="/leaderboard">View Leaderboard</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section - PROMINENT */}
      <section className="py-12 md:py-20 relative overflow-hidden" style={{backgroundColor: '#faf1e4'}}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #d4a574 0%, transparent 50%), radial-gradient(circle at 80% 50%, #b8860b 0%, transparent 50%)',
        }}></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-6 md:p-10 lg:p-12 text-center" style={{backgroundColor: '#ffffff', border: '4px solid #d4a574', boxShadow: '0 8px 32px rgba(212, 165, 116, 0.15)'}}>
              <div className="mb-4 md:mb-6 inline-block">
                <Heart className="h-12 w-12 md:h-16 md:w-16" style={{color: '#d4a574'}} fill="#d4a574" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4" style={{color: '#1a1a2e'}}>Support This Challenge</h2>
              <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-3xl mx-auto" style={{color: '#333333', lineHeight: '1.6'}}>
                Your donation helps sustain this initiative and increase prize pools for participants. Every contribution—no matter the amount—makes a meaningful difference in keeping participants motivated throughout Ramadan.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(212, 165, 116, 0.15)', border: '2px solid #d4a574'}}>
                  <p className="text-xs md:text-sm font-semibold mb-2 uppercase" style={{color: '#b8860b'}}>Website & Domain</p>
                  <p className="text-lg md:text-xl font-bold" style={{color: '#1a1a2e'}}>Operational Costs</p>
                </div>
                <div className="p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(212, 165, 116, 0.15)', border: '2px solid #d4a574'}}>
                  <p className="text-xs md:text-sm font-semibold mb-2 uppercase" style={{color: '#b8860b'}}>Prize Pool</p>
                  <p className="text-lg md:text-xl font-bold" style={{color: '#1a1a2e'}}>Increase Rewards</p>
                </div>
                <div className="p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(212, 165, 116, 0.15)', border: '2px solid #d4a574'}}>
                  <p className="text-xs md:text-sm font-semibold mb-2 uppercase" style={{color: '#b8860b'}}>Excess Funds</p>
                  <p className="text-lg md:text-xl font-bold" style={{color: '#1a1a2e'}}>To Charity</p>
                </div>
              </div>

              <div className="mb-8 md:mb-10 p-6 md:p-8 rounded-xl" style={{backgroundColor: '#faf1e4', border: '3px dashed #d4a574'}}>
                <p className="text-xs md:text-sm font-semibold mb-3 uppercase" style={{color: '#b8860b'}}>Bank Card</p>
                <p className="text-2xl md:text-4xl font-bold font-mono mb-3" style={{color: '#1a1a2e', letterSpacing: '0.1em'}}>4400 4303 8246 3625</p>
                <p className="text-sm md:text-base" style={{color: '#666666'}}>Send any amount you can afford. <span className="font-semibold">No minimum or maximum.</span></p>
              </div>

              <div className="space-y-4 md:space-y-5 text-left max-w-3xl mx-auto mb-8 md:mb-10">
                <div className="flex items-start gap-4">
                  <span className="text-3xl md:text-4xl flex-shrink-0">✨</span>
                  <p className="text-sm md:text-base" style={{color: '#333333'}}>Your donation is an <span className="font-semibold">investment in passive reward earning</span>—you become part of others' good deeds throughout Ramadan.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl md:text-4xl flex-shrink-0">🤲</span>
                  <p className="text-sm md:text-base" style={{color: '#333333'}}>Donations help participants <span className="font-semibold">stay motivated and complete the challenge</span>, maximizing their spiritual journey and dedication.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl md:text-4xl flex-shrink-0">💝</span>
                  <p className="text-sm md:text-base" style={{color: '#333333'}}>If you cannot donate, <span className="font-semibold">no problem!</span> Participation is completely free. The goal is to push the limits of our good deeds in Ramadan.</p>
                </div>
              </div>

              <p className="text-xs md:text-sm italic" style={{color: '#666666'}}>
                Every contribution, no matter how small, makes a meaningful impact on this community and helps us achieve our collective spiritual goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">How It Works</h2>
            <p className="text-xs md:text-lg text-muted-foreground">
              Simple steps to track your progress and compete for rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto">
            <Card className="golden-border">
              <CardHeader className="p-3 md:p-6">
                <div className="mb-3 md:mb-4">
                  <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                </div>
                <CardTitle className="text-base md:text-lg">Track Daily Activities</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Record your spiritual activities and earn points
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="space-y-3 text-xs md:text-sm">
                  <div>
                    <p className="font-semibold text-primary mb-1">🤲 Prayer Activities</p>
                    <ul className="space-y-1 text-muted-foreground ml-2">
                      <li>• Daily Prayers: 10 pts each</li>
                      <li>• Tahajud: 30 pts each</li>
                      <li>• Tarawih 20 Rakat: 100 pts</li>
                      <li>• Tarawih 8 Rakat: 40 pts</li>
                      <li>• Fasting: 100 pts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-primary mb-1">📖 Quran Reading</p>
                    <ul className="space-y-1 text-muted-foreground ml-2">
                      <li>• Arabic Quran: 20 pts/page</li>
                      <li>• Quran in Other Languages: 10 pts/page</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-primary mb-1">📚 Learning</p>
                    <ul className="space-y-1 text-muted-foreground ml-2">
                      <li>• Islamic Books: 8 pts/page</li>
                      <li>• Other Books: 4 pts/page</li>
                      <li>• Podcasts: 3 pts/minute</li>
                      <li>• Salawat: 1 pt per 10</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Earn Points</CardTitle>
                <CardDescription>
                  Accumulate points throughout Ramadan based on your consistent efforts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your dedication is rewarded with points that reflect your spiritual commitment and consistency.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Compete & Win</CardTitle>
                <CardDescription>
                  Top 5 participants receive monetary prizes at the end of Ramadan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Check the leaderboard daily to see your ranking and stay motivated!
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Live Leaderboard</CardTitle>
                <CardDescription>
                  Real-time rankings updated as participants log activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Watch your rank change in real-time as you and others submit daily activities.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Join believers from around the world in this spiritual challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Be part of a global community dedicated to maximizing their good deeds during Ramadan.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Win Prizes</CardTitle>
                <CardDescription>
                  Top performers receive rewards at the end of Ramadan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your consistency and dedication throughout the month are rewarded with meaningful prizes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
