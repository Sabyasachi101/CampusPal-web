import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Upload } from "lucide-react";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, storage } from "@/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    major: "",
    email: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({
            name: userSnap.data().name || currentUser.displayName || "",
            major: userSnap.data().major || "",
            email: currentUser.email || "",
            photoURL: userSnap.data().photoURL || currentUser.photoURL || "",
          });
        } else {
          setUserData({
            name: currentUser.displayName || "",
            major: "",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        name: userData.name,
        major: userData.major,
        email: userData.email,
        photoURL: userData.photoURL,
      });
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // ✅ Upload Image Function
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      // Update both Auth and Firestore
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        { photoURL: downloadURL },
        { merge: true }
      );

      setUserData((prev) => ({ ...prev, photoURL: downloadURL }));
      alert("✅ Profile photo updated!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("❌ Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-64 flex-1">
        <Header />

        <main className="p-4 sm:p-6 pb-20 lg:pb-6 max-w-5xl mx-auto animate-slide-up">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="account">My Account</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Safety</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <Card className="p-6 shadow-soft">
                <h3 className="text-xl font-bold mb-6">Profile Information</h3>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={userData.photoURL || "/placeholder.svg"}
                        alt={userData.name}
                      />
                      <AvatarFallback className="text-lg">
                        {userData.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="fileUpload"
                      className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-semibold">{userData.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {userData.major || "Not specified"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={userData.major}
                      onChange={(e) =>
                        setUserData({ ...userData, major: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-soft">
                <h3 className="text-xl font-bold mb-6">Account Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value="********"
                      disabled
                    />
                  </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
