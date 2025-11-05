import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Camera,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { db, auth, storage } from "@/FirebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

const mockPosts = [
  {
    id: 1,
    content:
      "Just finished my final project for CS 301! So proud of what we built. 🎉",
    time: "2 hours ago",
    likes: 45,
    comments: 8,
    shares: 3,
  },
  {
    id: 2,
    content: "Had an amazing time at the hackathon! Built a campus app!",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop",
    time: "2 days ago",
    likes: 78,
    comments: 12,
    shares: 5,
  },
];

const mockFriends = [
  { name: "Emily Carter", major: "Biology", avatar: "/placeholder.svg" },
  { name: "Sarah Johnson", major: "Psychology", avatar: "/placeholder.svg" },
  { name: "Mike Chen", major: "Engineering", avatar: "/placeholder.svg" },
  { name: "Alex Smith", major: "Business", avatar: "/placeholder.svg" },
];

export default function Profile() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch Firestore profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // ✅ Create default profile if not found
          const defaultData = {
            name: user.displayName || "New User",
            username: user.email?.split("@")[0],
            email: user.email,
            bio: "",
            department: "",
            year: "",
            profilePic: user.photoURL || "",
            createdAt: new Date(),
          };
          await setDoc(userRef, defaultData);
          setUserData(defaultData);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  // ✅ Handle image selection preview
  const handleImageSelect = (file: File) => {
    setNewProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ✅ Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user || !userData) return;

      const userRef = doc(db, "users", user.uid);
      const updates: any = {
        bio: userData.bio || "",
        department: userData.department || "",
        year: userData.year || "",
      };

      if (newProfilePic) {
        const imgRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(imgRef, newProfilePic);
        const url = await getDownloadURL(imgRef);
        updates.profilePic = url;
      }

      await updateDoc(userRef, updates);
      setUserData((prev: any) => ({ ...prev, ...updates }));
      setPreviewUrl(null);
      setNewProfilePic(null);
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading profile...
      </div>
    );

  if (!userData)
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Failed to load profile.
      </div>
    );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-64 flex-1">
        <Header />

        <main className="animate-slide-up pb-20 lg:pb-0">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
              {/* ✅ Left: Profile Info */}
              <div className="space-y-6">
                <Card className="p-6 shadow-soft relative">
                  <div className="flex flex-col items-center text-center mb-6 relative">
                    <div className="relative">
                      <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20">
                        <AvatarImage
                          src={previewUrl || userData.profilePic || ""}
                          alt={userData.name}
                        />
                        <AvatarFallback className="text-3xl">
                          {userData.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {isEditing && (
                        <>
                          <label
                            htmlFor="profile-upload"
                            className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full cursor-pointer hover:scale-105 transition"
                          >
                            <Camera className="h-4 w-4" />
                          </label>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files &&
                              handleImageSelect(e.target.files[0])
                            }
                          />
                        </>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold mb-1">
                      {userData.name}
                    </h1>
                    <p className="text-sm text-primary">@{userData.username}</p>
                  </div>

                  <Separator className="my-4" />

                  {/* ✅ Editable or View State */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={userData.bio}
                          onChange={(e) =>
                            setUserData({ ...userData, bio: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label>Department</Label>
                        <Input
                          value={userData.department}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              department: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Year</Label>
                        <Input
                          value={userData.year}
                          onChange={(e) =>
                            setUserData({ ...userData, year: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setIsEditing(false);
                            setPreviewUrl(null);
                            setNewProfilePic(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Bio
                          </h3>
                          <p className="text-sm leading-relaxed">
                            {userData.bio || "No bio added yet."}
                          </p>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {userData.department || "Not set"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {userData.year || "Not set"}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-6"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    </>
                  )}
                </Card>

                {/* ✅ Clubs Section */}
                <Card className="p-6 shadow-soft">
                  <h3 className="font-bold text-sm mb-4 uppercase text-muted-foreground">
                    My Communities
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "Computer Science Dept.", icon: "💻" },
                      { name: "Chess Club", icon: "♟️" },
                      { name: "Hiking Group", icon: "🥾" },
                    ].map((club) => (
                      <div
                        key={club.name}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                          {club.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold truncate">
                            {club.name}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* ✅ Right: Posts & Friends */}
              <div className="space-y-6">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="w-full bg-card">
                    <TabsTrigger value="posts" className="flex-1">
                      My Posts
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="flex-1">
                      Friends
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="space-y-4 mt-6">
                    {mockPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden shadow-soft hover:shadow-medium transition"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar>
                              <AvatarImage
                                src={userData.profilePic}
                                alt={userData.name}
                              />
                              <AvatarFallback>
                                {userData.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">
                                {userData.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {post.time}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm mb-3">{post.content}</p>
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full rounded-lg mb-3"
                            />
                          )}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-around p-2">
                          <Button variant="ghost" size="sm" className="gap-2 flex-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 flex-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 flex-1">
                            <Share2 className="h-4 w-4" />
                            {post.shares}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="friends" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockFriends.map((friend) => (
                        <Card
                          key={friend.name}
                          className="p-4 hover:shadow-medium transition"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={friend.avatar}
                                alt={friend.name}
                              />
                              <AvatarFallback>
                                {friend.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {friend.name}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {friend.major}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
