import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, X, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPost, getPosts, likePost, unlikePost, uploadImage, Post, addComment, getComments, Comment, deletePost, updatePost } from "@/lib/firebase-utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

const categories = [
  { value: "all", label: "All Posts" },
  { value: "academic", label: "Academic" },
  { value: "events", label: "Events" },
  { value: "clubs", label: "Clubs" },
  { value: "lost-found", label: "Lost & Found" },
  { value: "marketplace", label: "Marketplace" },
  { value: "fun", label: "Fun" },
];

export default function Feed() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Post["category"]>("fun");
  const [filterCategory, setFilterCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadPosts();
  }, [currentUser, filterCategory]);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const fetchedPosts = await getPosts(filterCategory === "all" ? undefined : filterCategory);
      setPosts(fetchedPosts);
    } catch (error) {
      toast.error("Error loading posts");
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleCreatePost() {
  if (!newPost.trim() && !imageFile) {
    toast.error("Please add some text or an image!");
    return;
  }

  if (!currentUser) {
    toast.error("You must be logged in to post!");
    navigate("/login");
    return;
  }

  setLoading(true);
  try {
    // ✅ Always define a valid imageUrl (null if none)
    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, "posts");
    }

    const authorName =
      userProfile?.displayName || currentUser.displayName || "Anonymous";
    const authorAvatar =
      userProfile?.photoURL || currentUser.photoURL || "";

    await createPost({
      authorId: currentUser.uid,
      authorName,
      authorAvatar,
      content: newPost,
      imageUrl, // ✅ now it's always string or null, never undefined
      category: selectedCategory,
    });

    setNewPost("");
    setImageFile(null);
    setImagePreview("");
    setSelectedCategory("fun");
    toast.success("Post created!");
    loadPosts();
  } catch (error: any) {
    console.error("❌ Error creating post:", error);
    toast.error(`Failed to create post: ${error.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}


  async function handleLike(post: Post) {
    if (!currentUser || !post.id) return;

    const isLiked = post.likes?.includes(currentUser.uid);
    try {
      if (isLiked) {
        await unlikePost(post.id, currentUser.uid);
      } else {
        await likePost(post.id, currentUser.uid, currentUser.displayName || "Anonymous", currentUser.photoURL || undefined);
      }
      loadPosts();
    } catch {
      toast.error("Error updating like");
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function openComments(post: Post) {
    setSelectedPost(post);
    if (post.id) {
      const fetchedComments = await getComments(post.id);
      setComments(fetchedComments);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !selectedPost?.id || !currentUser) return;

    const authorName =
      userProfile?.displayName || currentUser.displayName || "Anonymous";
    const authorAvatar =
      userProfile?.photoURL || currentUser.photoURL || "";

    try {
      await addComment({
        postId: selectedPost.id,
        authorId: currentUser.uid,
        authorName,
        authorAvatar,
        content: newComment,
      });
      setNewComment("");
      const fetchedComments = await getComments(selectedPost.id);
      setComments(fetchedComments);
      loadPosts();
    } catch {
      toast.error("Error adding comment");
    }
  }

  function startEditing(post: Post) {
    setEditingPost(post);
    setEditContent(post.content);
  }

  async function handleEditPost() {
    if (!editingPost?.id || !editContent.trim()) return;

    try {
      await updatePost(editingPost.id, { content: editContent });
      setEditingPost(null);
      setEditContent("");
      loadPosts();
      toast.success("Post updated!");
    } catch {
      toast.error("Error updating post");
    }
  }

  function handleDeletePost(post: Post) {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  }

  async function confirmDeletePost() {
    if (!postToDelete?.id) return;

    try {
      await deletePost(postToDelete.id);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      loadPosts();
      toast.success("Post deleted!");
    } catch {
      toast.error("Error deleting post");
    }
  }

  async function toggleHideLikes(post: Post) {
    if (!post.id) return;

    try {
      await updatePost(post.id, { hideLikes: !post.hideLikes });
      loadPosts();
    } catch {
      toast.error("Error updating post");
    }
  }

  function handleShare(post: Post) {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const text = `Check out this post: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

    if (navigator.share) {
      navigator.share({
        title: 'CampusPal Post',
        text: text,
        url: postUrl,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareOptions = [
        {
          name: 'WhatsApp',
          url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`
        },
        {
          name: 'Facebook',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        },
        {
          name: 'Instagram (copy link)',
          action: () => {
            navigator.clipboard.writeText(postUrl);
            toast.success('Link copied to clipboard!');
          }
        },
        {
          name: 'SMS',
          url: `sms:?body=${encodeURIComponent(text + ' ' + postUrl)}`
        },
        {
          name: 'Copy Link',
          action: () => {
            navigator.clipboard.writeText(postUrl);
            toast.success('Link copied to clipboard!');
          }
        }
      ];

      // Create a simple share menu using alert or console for now
      const choice = window.prompt('Choose how to share:', shareOptions.map((opt, i) => `${i + 1}. ${opt.name}`).join('\n'));
      if (choice) {
        const index = parseInt(choice) - 1;
        if (shareOptions[index]) {
          if (shareOptions[index].action) {
            shareOptions[index].action();
          } else {
            window.open(shareOptions[index].url, '_blank');
          }
        }
      }
    }
  }

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-64 flex-1">
        <Header />

        <main className="mx-auto max-w-4xl p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="mb-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 sm:space-y-6 animate-slide-up">
            <Card className="p-4 shadow-soft hover:shadow-medium transition-smooth">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={userProfile?.photoURL || currentUser.photoURL} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userProfile?.displayName?.charAt(0) ||
                      currentUser.displayName?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`What's on your mind, ${
                      userProfile?.displayName ||
                      currentUser.displayName ||
                      "User"
                    }?`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                  />
                  {imagePreview && (
                    <div className="relative mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={handleImageSelect}
                      />
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                          <span>
                            <ImageIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Photo</span>
                          </span>
                        </Button>
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(val) =>
                          setSelectedCategory(val as Post["category"])
                        }
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((c) => c.value !== "all")
                            .map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleCreatePost}
                      disabled={loading || (!newPost.trim() && !imageFile)}
                    >
                      {loading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {loadingPosts ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to post!
                </p>
              </Card>
            ) : (
              posts.map((post, index) => (
                <Card
                  key={post.id}
                  className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback>
                          {post.authorName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                            {post.authorName}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {categories.find((c) => c.value === post.category)
                              ?.label || "General"}
                          </span>
                          {post.authorId === currentUser.uid && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditing(post)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuCheckboxItem
                                  checked={post.hideLikes || false}
                                  onCheckedChange={() => toggleHideLikes(post)}
                                >
                                  {post.hideLikes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                  Hide like count
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeletePost(post)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {post.createdAt &&
                            formatDistanceToNow(post.createdAt.toDate(), {
                              addSuffix: true,
                            })}
                        </p>
                      </div>
                    </div>

                    {editingPost?.id === post.id ? (
                    <div className="mt-3 space-y-2">
                        <Textarea
                           value={editContent}
                           onChange={(e) => setEditContent(e.target.value)}
                           className="min-h-[60px] resize-none"
                         />
                         <div className="flex gap-2">
                           <Button size="sm" onClick={handleEditPost} disabled={!editContent.trim()}>
                             Save
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               setEditingPost(null);
                               setEditContent("");
                             }}
                           >
                             Cancel
                           </Button>
                         </div>
                       </div>
                     ) : (
                       <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                         {post.content}
                       </p>
                     )}

                    {post.imageUrl && (
                      <div className="mt-3 -mx-4 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt="Post content"
                          className="w-full object-cover transition-smooth hover:scale-105"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-around p-2">
                    <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 flex-1 ${
                    post.likes?.includes(currentUser.uid)
                    ? "text-red-500"
                    : ""
                    }`}
                    onClick={() => handleLike(post)}
                    >
                    <Heart
                    className={`h-4 w-4 ${
                    post.likes?.includes(currentUser.uid)
                    ? "fill-red-500"
                    : ""
                    }`}
                    />
                    {!post.hideLikes && <span className="text-xs">{post.likeCount || 0}</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 flex-1"
                      onClick={() => openComments(post)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.commentCount || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 flex-1" onClick={() => handleShare(post)}>
                    <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex gap-3 pb-4 border-b">
                <Avatar>
                  <AvatarImage src={selectedPost.authorAvatar} />
                  <AvatarFallback>
                    {selectedPost.authorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {selectedPost.authorName}
                  </h4>
                  <p className="text-sm mt-1">{selectedPost.content}</p>
                </div>
              </div>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="text-xs">
                        {comment.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold text-xs">
                        {comment.authorName}
                      </h5>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {comment.createdAt &&
                          formatDistanceToNow(comment.createdAt.toDate(), {
                            addSuffix: true,
                          })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
