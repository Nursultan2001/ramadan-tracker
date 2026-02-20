import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Zap, Target, Gift, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Donation() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="sacred-geometry-bg relative py-12 md:py-20 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4 md:mb-8 inline-block">
              <Heart className="h-16 w-16 md:h-24 md:w-24 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Support the Ramadan Challenge
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto">
              Your donation helps sustain this initiative, increase prize pools, and keep participants motivated throughout the blessed month of Ramadan.
            </p>
          </div>
        </div>
      </section>

      {/* Main Donation Card */}
      <section className="py-12 md:py-16 relative overflow-hidden" style={{backgroundColor: '#faf1e4'}}>
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-8 md:p-12 text-center" style={{backgroundColor: '#ffffff', border: '4px solid #d4a574', boxShadow: '0 8px 32px rgba(212, 165, 116, 0.15)'}}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{color: '#1a1a2e'}}>Bank Card Details</h2>
              
              <div className="mb-8 p-8 rounded-xl" style={{backgroundColor: '#faf1e4', border: '3px dashed #d4a574'}}>
                <p className="text-xs md:text-sm font-semibold mb-4 uppercase" style={{color: '#b8860b'}}>Send Your Donation To</p>
                <p className="text-3xl md:text-5xl font-bold font-mono mb-4" style={{color: '#1a1a2e', letterSpacing: '0.15em'}}>4400 4303 8246 3625</p>
                <p className="text-sm md:text-base font-semibold" style={{color: '#333333'}}>Any Amount • No Minimum • No Maximum</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 text-left">
                  <span className="text-2xl flex-shrink-0">💰</span>
                  <div>
                    <p className="font-semibold" style={{color: '#1a1a2e'}}>Flexible Donations</p>
                    <p className="text-sm" style={{color: '#666666'}}>Give whatever amount you can afford. Every contribution matters, regardless of size.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                  <span className="text-2xl flex-shrink-0">🔒</span>
                  <div>
                    <p className="font-semibold" style={{color: '#1a1a2e'}}>Secure & Direct</p>
                    <p className="text-sm" style={{color: '#666666'}}>Your donation goes directly to supporting the challenge infrastructure and prizes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                  <span className="text-2xl flex-shrink-0">🎁</span>
                  <div>
                    <p className="font-semibold" style={{color: '#1a1a2e'}}>Transparent Use</p>
                    <p className="text-sm" style={{color: '#666666'}}>We clearly allocate funds to operational costs, prizes, or charity based on community needs.</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="golden-glow text-lg px-8">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How Donations Are Used */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Your Donation Is Used</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every donation is allocated strategically to maximize impact and support our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Operational Costs</CardTitle>
                <CardDescription>
                  Website & Domain Infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Maintaining the platform, domain registration, and server costs to keep the challenge running smoothly.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Prize Pool</CardTitle>
                <CardDescription>
                  Increase Rewards for Top Performers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Donations directly increase the prize amounts offered to top 5 participants, motivating higher engagement.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <div className="mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Charity</CardTitle>
                <CardDescription>
                  Excess Funds to Good Causes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  If donations exceed planned prize amounts, excess funds are donated to charitable organizations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Support This Challenge */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Support This Challenge?</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 md:p-8 rounded-lg golden-border" style={{backgroundColor: 'rgba(212, 165, 116, 0.05)'}}>
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Community Impact</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Your donation helps create a supportive community where participants encourage each other to maximize their spiritual dedication during Ramadan. Many participants lose motivation mid-month—your support helps them stay committed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-lg golden-border" style={{backgroundColor: 'rgba(212, 165, 116, 0.05)'}}>
              <div className="flex items-start gap-4">
                <Target className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Passive Reward Earning</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Your donation is an investment in passive reward earning. You become part of others' good deeds throughout Ramadan. Every activity logged by participants—every prayer, every page of Quran read—is partially enabled by your generosity.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-lg golden-border" style={{backgroundColor: 'rgba(212, 165, 116, 0.05)'}}>
              <div className="flex items-start gap-4">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Sustainable Growth</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Donations help us scale the challenge year after year. With sufficient funds, we can expand to more participants, increase prize pools, and create a lasting tradition of community-driven spiritual growth.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-lg golden-border" style={{backgroundColor: 'rgba(212, 165, 116, 0.05)'}}>
              <div className="flex items-start gap-4">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">No Pressure</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    If your financial situation doesn't allow for a donation, there's absolutely no problem. Participation in the challenge is completely free. Our goal is to push the limits of our good deeds in Ramadan, with or without donations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg">Is there a minimum donation amount?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No. You can donate any amount you can afford. Every contribution, no matter how small, is appreciated and makes a difference.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg">What if I can't donate?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No problem at all! Participation in the Ramadan Challenge is completely free. Donations are optional and help us enhance the experience for everyone, but they're not required to participate.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg">How are donations tracked?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All donations are received directly to the bank card. We maintain transparent records of how funds are allocated between operational costs, prize increases, and charitable donations.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg">What happens to excess donations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  If donations exceed the planned prize amounts, excess funds are either reinvested in larger prizes and more prize tiers, or donated to charitable organizations. The decision is made transparently with community input.
                </p>
              </CardContent>
            </Card>

            <Card className="golden-border">
              <CardHeader>
                <CardTitle className="text-lg">Can I donate anonymously?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes. Bank transfers can be made without revealing your identity. Your donation will be appreciated regardless of whether you choose to be recognized.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="sacred-geometry-bg py-16 md:py-24">
        <div className="container">
          <Card className="golden-border golden-glow max-w-3xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl">
                Ready to Make an Impact?
              </CardTitle>
              <CardDescription className="text-lg">
                Every donation helps keep participants motivated and increases the rewards for our community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-lg" style={{backgroundColor: '#faf1e4', border: '2px solid #d4a574'}}>
                <p className="text-sm font-semibold mb-2" style={{color: '#b8860b'}}>Bank Card</p>
                <p className="text-2xl font-bold font-mono" style={{color: '#1a1a2e'}}>4400 4303 8246 3625</p>
              </div>
              <Button asChild size="lg" className="golden-glow text-lg px-8">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
