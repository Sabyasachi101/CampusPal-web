"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/FirebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp?: any;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [receiverId] = useState<string>("testReceiverId123"); // 🔁 Replace with dynamic id later

  // ✅ Track signed-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsub();
  }, []);

  // ✅ Fetch live messages
  useEffect(() => {
    if (!userId || !receiverId) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];

      const filtered = fetched.filter(
        (msg) =>
          (msg.senderId === userId && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === userId)
      );

      setMessages(filtered);
    });

    return () => unsub();
  }, [userId, receiverId]);

  // ✅ Send message to Firestore
  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    await addDoc(collection(db, "messages"), {
      text: input.trim(),
      senderId: userId,
      receiverId,
      participants: [userId, receiverId],
      timestamp: serverTimestamp(),
    });

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-64 flex-1 flex flex-col h-screen">
        <Header />

        <main className="flex-1 flex overflow-hidden pb-16 lg:pb-0">
          {/* Chat Sidebar */}
          <div className="hidden md:flex md:w-80 border-r border-border bg-card flex-col animate-fade-in">
            <div className="p-4 border-b border-border">
              <h2 className="text-2xl font-bold mb-4">Chats</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search chats..."
                  className="pl-10 bg-muted/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <button className="w-full p-4 flex items-start gap-3 bg-muted/50 transition-smooth border-b border-border">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Emily Carter" />
                    <AvatarFallback>EC</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      Emily Carter
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Chatting live...
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] flex items-center justify-center rounded-full text-xs">
                  1
                </Badge>
              </button>
            </div>

            <div className="p-4 border-t border-border">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>

          {/* Chat Main */}
          <div className="flex-1 flex flex-col bg-background animate-slide-up">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt="Emily Carter" />
                  <AvatarFallback>EC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">Emily Carter</h3>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.senderId === userId ? "justify-end" : ""
                  }`}
                >
                  {msg.senderId !== userId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>EC</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-md ${msg.senderId === userId ? "items-end" : ""}`}>
                    <div
                      className={`rounded-2xl p-3 ${
                        msg.senderId === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                  {msg.senderId === userId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="You" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-muted/50"
                />
                <Button size="icon" onClick={handleSend} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
