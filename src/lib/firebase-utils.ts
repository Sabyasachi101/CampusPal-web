// src/lib/firebase-utils.ts
import { db, storage } from "@/FirebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ============================
// 🔹 Shared Interfaces
// ============================

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  category: "academic" | "events" | "clubs" | "lost-found" | "marketplace" | "fun";
  likes?: string[];
  likeCount?: number;
  commentCount?: number;
  createdAt?: any;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt?: any;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: any;
  time: string;
  location: string;
  category: "fest" | "workshop" | "webinar" | "club" | "competition" | "other";
  organizerId: string;
  organizerName: string;
  attendees?: string[];
  maxAttendees?: number;
  createdAt?: any;
}

export interface MarketplaceItem {
  id?: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: "books" | "electronics" | "clothing" | "other";
  condition: "new" | "like-new" | "good" | "fair";
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  sold?: boolean;
  createdAt?: any;
}

export interface StudyMaterial {
  id?: string;
  title: string;
  description: string;
  subject: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "ppt" | "other";
  uploaderId: string;
  uploaderName: string;
  downloads?: number;
  createdAt?: any;
}

export interface LostFound {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: "lost" | "found";
  category: string;
  location: string;
  date: any;
  reporterId: string;
  reporterName: string;
  reporterContact: string;
  resolved?: boolean;
  createdAt?: any;
}

// ============================
// 🔹 Helper: Upload Image to Storage
// ============================

export async function uploadImage(file: File, folder: string): Promise<string> {
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ============================
// 🔹 POSTS
// ============================

export async function createPost(
  post: Omit<Post, "id" | "createdAt" | "likes" | "likeCount" | "commentCount">
) {
  const data = {
    ...post,
    likes: [],
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  };
  return await addDoc(collection(db, "posts"), data);
}

export async function getPosts(category?: string, limitCount = 20): Promise<Post[]> {
  const postsRef = collection(db, "posts");
  const q =
    category && category !== "all"
      ? query(postsRef, where("category", "==", category), orderBy("createdAt", "desc"), limit(limitCount))
      : query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Post) }));
}

export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    likeCount: increment(1),
  });
}

export async function unlikePost(postId: string, userId: string) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    likeCount: increment(-1),
  });
}

// ============================
// 🔹 COMMENTS
// ============================

export async function addComment(comment: Omit<Comment, "id" | "createdAt">) {
  const data = { ...comment, createdAt: serverTimestamp() };
  const commentRef = await addDoc(collection(db, "comments"), data);

  // Increment comment count on post
  const postRef = doc(db, "posts", comment.postId);
  await updateDoc(postRef, { commentCount: increment(1) });

  return commentRef;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Comment) }));
}

// ============================
// 🔹 EVENTS
// ============================

export async function createEvent(
  event: Omit<Event, "id" | "createdAt" | "attendees">
) {
  const eventData = {
    ...event,
    imageUrl: event.imageUrl || null,          // ✅ prevent undefined
    maxAttendees: event.maxAttendees ?? null,  // ✅ prevent undefined
    attendees: [],
    createdAt: Timestamp.now(),
  };

  return addDoc(collection(db, "events"), eventData);
}


export async function getEvents(limitCount = 20): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("date", "asc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Event) }));
}

export async function rsvpEvent(eventId: string, userId: string) {
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, { attendees: arrayUnion(userId) });
}

export async function cancelRsvp(eventId: string, userId: string) {
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, { attendees: arrayRemove(userId) });
}

// ============================
// 🔹 MARKETPLACE
// ============================

export async function createMarketplaceItem(
  item: Omit<MarketplaceItem, "id" | "createdAt" | "sold">
) {
  const data = {
    ...item,
    sold: false,
    createdAt: serverTimestamp(),
  };
  return await addDoc(collection(db, "marketplace"), data);
}

export async function getMarketplaceItems(category?: string): Promise<MarketplaceItem[]> {
  const marketplaceRef = collection(db, "marketplace");
  const q =
    category && category !== "all"
      ? query(
          marketplaceRef,
          where("category", "==", category),
          where("sold", "==", false),
          orderBy("createdAt", "desc"),
          limit(20)
        )
      : query(
          marketplaceRef,
          where("sold", "==", false),
          orderBy("createdAt", "desc"),
          limit(20)
        );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as MarketplaceItem) }));
}

// ============================
// 🔹 STUDY MATERIALS
// ============================

export async function createStudyMaterial(
  material: Omit<StudyMaterial, "id" | "createdAt" | "downloads">
) {
  const data = {
    ...material,
    downloads: 0,
    createdAt: serverTimestamp(),
  };
  return await addDoc(collection(db, "studyMaterials"), data);
}

export async function getStudyMaterials(): Promise<StudyMaterial[]> {
  const q = query(collection(db, "studyMaterials"), orderBy("createdAt", "desc"), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as StudyMaterial) }));
}

// ============================
// 🔹 LOST & FOUND
// ============================

export async function createLostFoundItem(
  item: Omit<LostFound, "id" | "createdAt" | "resolved">
) {
  const data = {
    ...item,
    resolved: false,
    createdAt: serverTimestamp(),
  };
  return await addDoc(collection(db, "lostFound"), data);
}

export async function getLostFoundItems(type?: "lost" | "found"): Promise<LostFound[]> {
  const baseRef = collection(db, "lostFound");
  const q =
    type
      ? query(
          baseRef,
          where("type", "==", type),
          where("resolved", "==", false),
          orderBy("createdAt", "desc"),
          limit(20)
        )
      : query(
          baseRef,
          where("resolved", "==", false),
          orderBy("createdAt", "desc"),
          limit(20)
        );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as LostFound) }));
}

export async function markLostFoundResolved(itemId: string) {
  const refDoc = doc(db, "lostFound", itemId);
  await updateDoc(refDoc, { resolved: true });
}
