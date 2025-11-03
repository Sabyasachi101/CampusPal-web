import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, CheckCircle, MessageCircle, ImagePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createMarketplaceItem,
  getMarketplaceItems,
  uploadImage,
  MarketplaceItem,
} from '@/lib/firebase-utils';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';

const conditionColors = {
  new: 'bg-green-500/10 text-green-500 border-green-500/20',
  'like-new': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  good: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  fair: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export default function Marketplace() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good' as 'new' | 'like-new' | 'good' | 'fair',
    category: 'other' as 'books' | 'electronics' | 'clothing' | 'other',
    contact: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadItems();
  }, [currentUser, navigate, category]);

  async function loadItems() {
    try {
      setLoading(true);
      const fetchedItems = await getMarketplaceItems(category === 'all' ? undefined : category);
      setItems(fetchedItems);
    } catch (error) {
      toast({
        title: 'Error loading items',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    try {
      setUploading(true);
      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'marketplace');
      }

      await createMarketplaceItem({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl,
        category: formData.category,
        condition: formData.condition,
        sellerId: currentUser.uid,
        sellerName: userProfile.displayName,
        sellerContact: formData.contact,
      });

      toast({
        title: 'Item listed successfully!',
        description: 'Your item is now available in the marketplace',
      });

      setFormData({
        title: '',
        description: '',
        price: '',
        condition: 'good',
        category: 'other',
        contact: '',
      });
      setImageFile(null);
      setImagePreview('');
      setIsDialogOpen(false);
      loadItems();
    } catch (error) {
      toast({
        title: 'Error creating listing',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  async function markAsSold(itemId: string) {
    try {
      await updateDoc(doc(db, 'marketplace', itemId), { sold: true });
      toast({ title: 'Item marked as sold!' });
      loadItems();
    } catch (error) {
      toast({
        title: 'Error updating item',
        variant: 'destructive',
      });
    }
  }

  function handleContact(sellerContact: string) {
    toast({
      title: 'Contact Information',
      description: sellerContact,
    });
  }

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-64 flex-1">
        <Header />

        <main className="p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-up">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Marketplace</h1>
                <p className="text-sm text-muted-foreground">Buy and sell items with fellow students</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                    <DialogDescription>Add details about the item you want to sell</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., MacBook Pro 2020"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the item, its condition, and any other details..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) =>
                            setFormData({ ...formData, condition: value as typeof formData.condition })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="like-new">Like New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value as typeof formData.category })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="contact">Contact Information</Label>
                      <Input
                        id="contact"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Phone number or email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Image</Label>
                      <div className="mt-2">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor="image"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                          >
                            <ImagePlus className="h-8 w-8 mb-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                            <input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? 'Creating...' : 'Create Listing'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={category} onValueChange={setCategory} className="w-full animate-slide-up">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="books">Books</TabsTrigger>
                <TabsTrigger value="electronics">Electronics</TabsTrigger>
                <TabsTrigger value="clothing">Clothing</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-scale-in">
                {items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-medium transition-smooth animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-smooth hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={conditionColors[item.condition]}>
                              {item.condition}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                          <div className="flex items-center gap-1 text-primary font-bold text-xl mb-2">
                            <DollarSign className="h-5 w-5" />
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      <div className="text-xs text-muted-foreground mb-3">
                        Seller: <span className="font-medium">{item.sellerName}</span>
                      </div>
                      <div className="flex gap-2">
                        {currentUser.uid === item.sellerId ? (
                          <Button
                            size="sm"
                            className="flex-1 gap-2"
                            variant="outline"
                            onClick={() => markAsSold(item.id!)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Sold
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => handleContact(item.sellerContact)}
                          >
                            <MessageCircle className="h-4 w-4" />
                            Contact Seller
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
