import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createStudyMaterial, getStudyMaterials, StudyMaterial } from "@/lib/firebase-utils";
import { storage } from "@/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { FileText, File, Presentation, Download, Upload, Search, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/FirebaseConfig";

const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Other"
];

const fileTypeIcons = {
    pdf: <FileText className="h-8 w-8 text-red-500" />,
    doc: <File className="h-8 w-8 text-blue-500" />,
    ppt: <Presentation className="h-8 w-8 text-orange-500" />,
    other: <File className="h-8 w-8 text-gray-500" />
};

export default function StudyCorner() {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSubject, setFilterSubject] = useState("all");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        loadMaterials();
    }, [currentUser]);

    useEffect(() => {
        filterMaterials();
    }, [materials, searchQuery, filterSubject]);

    async function loadMaterials() {
        setLoadingMaterials(true);
        try {
            const fetchedMaterials = await getStudyMaterials();
            setMaterials(fetchedMaterials);
        } catch (error) {
            toast({ title: "Error loading study materials", variant: "destructive" });
        } finally {
            setLoadingMaterials(false);
        }
    }

    function filterMaterials() {
        let filtered = materials;

        if (filterSubject !== "all") {
            filtered = filtered.filter(m => m.subject === filterSubject);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.title.toLowerCase().includes(query) ||
                m.description.toLowerCase().includes(query) ||
                m.subject.toLowerCase().includes(query)
            );
        }

        setFilteredMaterials(filtered);
    }

    function getFileType(filename: string): StudyMaterial['fileType'] {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'pdf';
        if (ext === 'doc' || ext === 'docx') return 'doc';
        if (ext === 'ppt' || ext === 'pptx') return 'ppt';
        return 'other';
    }

    async function handleUpload() {
        if (!title.trim() || !description.trim() || !subject || !file || !currentUser || !userProfile) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const storageRef = ref(storage, `study-materials/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            await createStudyMaterial({
                title,
                description,
                subject,
                fileUrl,
                fileType: getFileType(file.name),
                uploaderId: currentUser.uid,
                uploaderName: userProfile.displayName,
            });

            setTitle("");
            setDescription("");
            setSubject("");
            setFile(null);
            setUploadDialogOpen(false);
            toast({ title: "Study material uploaded successfully!" });
            loadMaterials();
        } catch (error) {
            toast({ title: "Error uploading file", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(material: StudyMaterial) {
        try {
            if (material.id) {
                const materialRef = doc(db, 'studyMaterials', material.id);
                await updateDoc(materialRef, {
                    downloads: increment(1)
                });
                loadMaterials();
            }

            window.open(material.fileUrl, '_blank');
        } catch (error) {
            toast({ title: "Error downloading file", variant: "destructive" });
        }
    }

    if (!currentUser) return null;

    return (
        <div className="flex min-h-screen w-full bg-background">
            <Sidebar />
            <MobileNav />

            <div className="lg:ml-64 flex-1">
                <Header />

                <main className="mx-auto max-w-6xl p-4 sm:p-6 pb-20 lg:pb-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold">Study Corner</h1>
                        </div>
                        <p className="text-muted-foreground">Share and access study materials, notes, and papers</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search materials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(subj => (
                                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload Material
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Upload Study Material</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Data Structures Notes"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Brief description of the material"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select value={subject} onValueChange={setSubject}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(subj => (
                                                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="file">File (PDF, DOC, PPT)</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {file && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Selected: {file.name}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? "Uploading..." : "Upload"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {loadingMaterials ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading study materials...</p>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <Card className="p-12 text-center">
                            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No materials found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || filterSubject !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Be the first to upload study materials!"}
                            </p>
                            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Material
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMaterials.map((material, index) => (
                                <Card
                                    key={material.id}
                                    className="p-4 hover:shadow-lg transition-all animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            {fileTypeIcons[material.fileType]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm line-clamp-1">
                                                {material.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {material.subject}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {material.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                        <span>By {material.uploaderName}</span>
                                        <span>{material.downloads || 0} downloads</span>
                                    </div>

                                    <p className="text-xs text-muted-foreground mb-3">
                                        {material.createdAt && formatDistanceToNow(material.createdAt.toDate(), { addSuffix: true })}
                                    </p>

                                    <Button
                                        className="w-full gap-2"
                                        size="sm"
                                        onClick={() => handleDownload(material)}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
