"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Instagram } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const allClubs = [
  { id: 1, name: "FROSH", description: "Freshers society organizing fun campus events.", members: 120 },
  { id: 2, name: "FAPS", description: "Fine arts, photography, and performing society.", members: 98 },
  { id: 3, name: "GDSC", description: "Google Developer Student Club - Learn, Build, Grow.", members: 340 },
  { id: 4, name: "TVC", description: "The Visual Club - film and content creators community.", members: 210 },
  { id: 5, name: "ENACTUS", description: "Entrepreneurial action for social impact.", members: 180 },
  { id: 6, name: "ECHOES", description: "Music and performing arts society.", members: 230 },
  { id: 7, name: "GENE", description: "Gender equality and empowerment network.", members: 150 },
  { id: 8, name: "ECON", description: "Economics enthusiasts and analysts’ society.", members: 120 },
  { id: 9, name: "CCS", description: "Coding & Computer Science Society.", members: 270 },
  { id: 10, name: "TAAS", description: "Tech and applied analytics society.", members: 190 },
  { id: 11, name: "TNT", description: "Theatre and dramatics club.", members: 250 },
  { id: 12, name: "TICC", description: "Tech Innovation and Creativity Club.", members: 175 },
  { id: 13, name: "FATEH", description: "Fitness and adventure enthusiasts club.", members: 132 },
  { id: 14, name: "VIRSA", description: "Cultural and heritage preservation club.", members: 205 },
  { id: 15, name: "IETE", description: "Electronics and Telecommunication Engineers club.", members: 180 },
  { id: 16, name: "TAC", description: "The Art Circle.", members: 120 },
  { id: 17, name: "TEDX", description: "TEDx Talks organizing team.", members: 300 },
  { id: 18, name: "PRATIGYA", description: "Social service and volunteering club.", members: 260 },
  { id: 19, name: "TMC", description: "The Music Circle.", members: 200 },
  { id: 20, name: "ACM", description: "Association for Computing Machinery.", members: 275 },
  { id: 21, name: "LITSOC", description: "Literary Society.", members: 220 },
  { id: 22, name: "BIS", description: "Business and Investment Society.", members: 195 },
  { id: 23, name: "IEI", description: "Institution of Engineers India.", members: 180 },
  { id: 24, name: "CTD", description: "Creative design and thinking club.", members: 130 },
  { id: 25, name: "TFC", description: "The Film Club.", members: 150 },
  { id: 26, name: "PWS", description: "Public welfare society.", members: 175 },
  { id: 27, name: "LEAD", description: "Leadership development club.", members: 160 },
  { id: 28, name: "NMSC", description: "National Management Students Club.", members: 145 },
  { id: 29, name: "TNS", description: "Tech Networking Society.", members: 200 },
  { id: 30, name: "NSS", description: "National Service Scheme.", members: 280 },
  { id: 31, name: "MUDRA", description: "Finance and Economics Club.", members: 230 },
  { id: 32, name: "SAIC", description: "Social Awareness & Innovation Club.", members: 175 },
  { id: 33, name: "IICHE", description: "Indian Institute of Chemical Engineers.", members: 150 },
  { id: 34, name: "TM", description: "Toastmasters Club.", members: 200 },
  { id: 35, name: "GIRL UP", description: "Women empowerment initiative.", members: 250 },
  { id: 36, name: "NOX", description: "Nightlife and events management club.", members: 160 },
  { id: 37, name: "SPICMACAY", description: "Indian classical music & culture club.", members: 220 },
  { id: 38, name: "ISTE", description: "Indian Society for Technical Education.", members: 190 },
  { id: 39, name: "OWASP", description: "Cybersecurity awareness group.", members: 210 },
  { id: 40, name: "TCSE", description: "Tech & Coding Society of Engineers.", members: 180 },
  { id: 41, name: "OORJA", description: "Energy and environmental awareness club.", members: 150 },
  { id: 42, name: "TMUN", description: "Model United Nations club.", members: 240 },
  { id: 43, name: "LUG", description: "Linux Users Group.", members: 170 },
  { id: 44, name: "AISEC", description: "Global youth leadership organization.", members: 300 },
  { id: 45, name: "YOUTH UNITED", description: "Student unity and welfare club.", members: 260 },
  { id: 46, name: "MARKFIN", description: "Marketing and Finance Club.", members: 230 },
  { id: 47, name: "ARC", description: "Architecture and design club.", members: 190 },
  { id: 48, name: "ROTARACT", description: "Community service and leadership club.", members: 275 },
  { id: 49, name: "SIS", description: "Social Impact Society.", members: 185 },
  { id: 50, name: "MARS", description: "Robotics and Space research club.", members: 290 },
];

export default function Clubs() {
  const [myCommunities, setMyCommunities] = useState([{ name: "Discover", icon: "🔍" }]);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);
  const [activeChatClub, setActiveChatClub] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [confirmLeaveClub, setConfirmLeaveClub] = useState<string | null>(null);

  const handleJoin = (clubName: string) => {
    if (!joinedClubs.includes(clubName)) {
      setJoinedClubs([...joinedClubs, clubName]);
      setMyCommunities((prev) => [...prev, { name: clubName, icon: "💬" }]);
    }
  };

  const handleLeave = (clubName: string) => {
    setJoinedClubs(joinedClubs.filter((c) => c !== clubName));
    setMyCommunities(myCommunities.filter((c) => c.name !== clubName));
    if (activeChatClub === clubName) setActiveChatClub(null);
  };

  const handleSendMessage = () => {
    if (message.trim() && activeChatClub) {
      setChatMessages((prev) => ({
        ...prev,
        [activeChatClub]: [...(prev[activeChatClub] || []), message],
      }));
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const topClubs = [...allClubs].sort((a, b) => b.members - a.members).slice(0, 5);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-64 flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Left Sidebar */}
            <Card className="p-4 sm:p-6 h-fit shadow-soft order-2 lg:order-1">
              <h3 className="font-bold text-sm mb-4 text-muted-foreground">MY COMMUNITIES</h3>
              <div className="space-y-2">
                {myCommunities.map((community, index) => (
                  <div key={community.name} className="flex justify-between items-center">
                    <Button
                      variant={index === 0 ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => index !== 0 && setActiveChatClub(community.name)}
                    >
                      <span className="text-lg">{community.icon}</span>
                      <span className="text-sm">{community.name}</span>
                    </Button>
                    {index !== 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmLeaveClub(community.name)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Middle Section */}
            <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col h-full">
              {!activeChatClub ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Explore Campus Communities</h1>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="search" placeholder="Find your community..." className="pl-10 bg-muted/50" />
                  </div>

                  <Tabs defaultValue="all" className="w-full mt-4">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="academic">Academic</TabsTrigger>
                      <TabsTrigger value="arts">Arts & Culture</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Grid view for clubs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 overflow-y-auto">
                    {allClubs.map((club) => (
                      <Card key={club.id} className="overflow-hidden hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                          <div className="p-4 flex-1">
                            <h3 className="font-bold mb-1">{club.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {club.description}
                            </p>
                            <p className="text-xs text-muted-foreground">{club.members} Members</p>
                          </div>
                          <div className="p-4 flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleJoin(club.name)}
                              disabled={joinedClubs.includes(club.name)}
                            >
                              {joinedClubs.includes(club.name) ? "Joined" : "Join"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedClub(club)}
                            >
                              About
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col flex-1 bg-muted/10 dark:bg-gray-900 rounded-lg shadow-lg p-4">
                  <div className="flex items-center mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveChatClub(null)}
                      className="mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-xl font-bold">{activeChatClub} Chat Room</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto border rounded-md p-3 bg-background dark:bg-gray-800">
                    {(chatMessages[activeChatClub] || []).map((msg, i) => (
                      <p key={i} className="mb-2 text-sm">
                        <span className="font-semibold text-primary">You:</span> {msg}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Top Communities */}
            <div className="space-y-4 sm:space-y-6 animate-slide-up order-3">
              <Card className="p-4 shadow-soft">
                <h4 className="font-semibold text-sm mb-4">🏆 Top Clubs</h4>
                <div className="space-y-3">
                  {topClubs.map((club, i) => (
                    <div key={club.id} className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-sm">
                          {i + 1}. {club.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">{club.members} Members</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleJoin(club.name)}
                        disabled={joinedClubs.includes(club.name)}
                      >
                        {joinedClubs.includes(club.name) ? "Joined" : "Join"}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* ✅ Fixed About Modal (only one Close button now) */}
      <Dialog open={!!selectedClub}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedClub?.name}</DialogTitle>
            <DialogDescription>{selectedClub?.description}</DialogDescription>
          </DialogHeader>
          <p className="text-sm mt-2">Members: {selectedClub?.members}</p>
          <div className="mt-4 flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Button>
            <Button variant="outline" size="sm">Website</Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedClub(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Modal */}
      <Dialog open={!!confirmLeaveClub} onOpenChange={() => setConfirmLeaveClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave {confirmLeaveClub}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this community?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                handleLeave(confirmLeaveClub!);
                setConfirmLeaveClub(null);
              }}
            >
              Yes, Leave
            </Button>
            <Button variant="outline" onClick={() => setConfirmLeaveClub(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
