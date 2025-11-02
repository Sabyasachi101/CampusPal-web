import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Smile } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const posts = [
  {
    id: 1,
    author: "Maria Garcia",
    handle: "@maria.garcia",
    avatar: "/placeholder.svg",
    time: "2 hours ago",
    content: "Had a great time at the annual college fest! Here are some snaps from the event. 🎉 #CampusLife #FestVibes",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop",
    likes: 128,
    comments: 23,
    shares: 12,
  },
  {
    id: 2,
    author: "Astronomy Club",
    handle: "@astronomy",
    avatar: "/placeholder.svg",
    time: "Yesterday at 4:00 PM",
    content: "Don't forget our stargazing event tonight at the observatory hill! Telescopes will be provided. Come and explore the cosmos with us! ✨ #Stargazing #Astronomy",
    likes: 94,
    comments: 15,
    shares: 7,
  },
];

const upcomingEvents = [
  { date: "OCT\n28", title: "Career Fair 2024", time: "10:00 AM - 4:00 PM", location: "Student Union" },
  { date: "NOV\n05", title: "Homecoming Football Game", time: "2:00 PM", location: "University Stadium" },
];

const trending = ["#MidtermsAreComing", "#FallFest", "#StudyGroupFinder"];

export default function Feed() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />
      
      <div className="lg:ml-64 flex-1">
        <Header />
        
        <main className="mx-auto max-w-7xl p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 animate-slide-up">
              {/* Create Post */}
              <Card className="p-4 shadow-soft hover:shadow-medium transition-smooth">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="You" />
                    <AvatarFallback className="bg-primary text-primary-foreground">LP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's on your mind, Logan?"
                      className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Photo</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Video className="h-4 w-4" />
                          <span className="hidden sm:inline">Video</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">Post</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Posts */}
              {posts.map((post, index) => (
                <Card key={post.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{post.author}</h4>
                          <span className="text-xs text-muted-foreground">{post.handle}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                    
                    {post.image && (
                      <div className="mt-3 -mx-4 overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full object-cover transition-smooth hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-around p-2">
                    <Button variant="ghost" size="sm" className="gap-2 flex-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 flex-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 flex-1">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{post.shares}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {/* Upcoming Events */}
              <Card className="p-4 shadow-soft">
                <h3 className="font-bold text-sm mb-4">Upcoming Campus Events</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold whitespace-pre-line text-center leading-tight">
                        {event.date}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trending */}
              <Card className="p-4 shadow-soft">
                <h3 className="font-bold text-sm mb-4">Trending on Campus</h3>
                <div className="space-y-2">
                  {trending.map((tag) => (
                    <Button key={tag} variant="ghost" className="w-full justify-start text-primary hover:bg-primary/10">
                      {tag}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
