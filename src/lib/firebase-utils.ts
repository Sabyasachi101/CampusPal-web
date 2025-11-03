import { db, storage } from '@/FirebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  category: 'academic' | 'events' | 'clubs' | 'lost-found' | 'marketplace' | 'fun';
  likes: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Timestamp;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: Timestamp;
  time: string;
  location: string;
  category: 'fest' | 'workshop' | 'webinar' | 'club' | 'competition' | 'other';
  organizerId: string;
  organizerName: string;
  attendees: string[];
  maxAttendees?: number;
  createdAt: Timestamp;
}

export interface MarketplaceItem {
  id?: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: 'books' | 'electronics' | 'clothing' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair';
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  sold: boolean;
  createdAt: Timestamp;
}

export interface StudyMaterial {
  id?: string;
  title: string;
  description: string;
  subject: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'other';
  uploaderId: string;
  uploaderName: string;
  downloads: number;
  createdAt: Timestamp;
}

export interface LostFound {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  date: Timestamp;
  reporterId: string;
  reporterName: string;
  reporterContact: string;
  resolved: boolean;
  createdAt: Timestamp;
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'commentCount' | 'likes'>) {
  const postData = {
    ...post,
    likes: [],
    likeCount: 0,
    commentCount: 0,
    createdAt: Timestamp.now(),
  };
  return addDoc(collection(db, 'posts'), postData);
}

export async function getPosts(category?: string, limitCount = 20) {
  let q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (category && category !== 'all') {
    q = query(
      collection(db, 'posts'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    likeCount: increment(1),
  });
}

export async function unlikePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    likeCount: increment(-1),
  });
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
  const commentData = {
    ...comment,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'comments'), commentData);
  
  const postRef = doc(db, 'posts', comment.postId);
  await updateDoc(postRef, {
    commentCount: increment(1),
  });
  
  return docRef;
}

export async function getComments(postId: string) {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'attendees'>) {
  const eventData = {
    ...event,
    attendees: [],
    createdAt: Timestamp.now(),
  };
  return addDoc(collection(db, 'events'), eventData);
}

export async function getEvents(limitCount = 20) {
  const q = query(
    collection(db, 'events'),
    orderBy('date', 'asc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
}

export async function rsvpEvent(eventId: string, userId: string) {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayUnion(userId),
  });
}

export async function cancelRsvp(eventId: string, userId: string) {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayRemove(userId),
  });
}

export async function createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'sold'>) {
  const itemData = {
    ...item,
    sold: false,
    createdAt: Timestamp.now(),
  };
  return addDoc(collection(db, 'marketplace'), itemData);
}

export async function getMarketplaceItems(category?: string) {
  let q = query(
    collection(db, 'marketplace'),
    where('sold', '==', false),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (category && category !== 'all') {
    q = query(
      collection(db, 'marketplace'),
      where('category', '==', category),
      where('sold', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
}

export async function createStudyMaterial(material: Omit<StudyMaterial, 'id' | 'createdAt' | 'downloads'>) {
  const materialData = {
    ...material,
    downloads: 0,
    createdAt: Timestamp.now(),
  };
  return addDoc(collection(db, 'studyMaterials'), materialData);
}

export async function getStudyMaterials() {
  const q = query(
    collection(db, 'studyMaterials'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));
}

export async function createLostFoundItem(item: Omit<LostFound, 'id' | 'createdAt' | 'resolved'>) {
  const itemData = {
    ...item,
    resolved: false,
    createdAt: Timestamp.now(),
  };
  return addDoc(collection(db, 'lostFound'), itemData);
}

export async function getLostFoundItems(type?: 'lost' | 'found') {
  let q = query(
    collection(db, 'lostFound'),
    where('resolved', '==', false),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (type) {
    q = query(
      collection(db, 'lostFound'),
      where('type', '==', type),
      where('resolved', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostFound));
}

export async function markLostFoundResolved(itemId: string) {
  const itemRef = doc(db, 'lostFound', itemId);
  await updateDoc(itemRef, {
    resolved: true,
  });
}
