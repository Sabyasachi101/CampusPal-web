import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../FirebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface EditProfileModalProps {
  userData: any;
  onClose: () => void;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

export default function EditProfileModal({
  userData,
  onClose,
  setUserData,
}: EditProfileModalProps) {
  const [bio, setBio] = useState(userData.bio || "");
  const [department, setDepartment] = useState(userData.department || "");
  const [year, setYear] = useState(userData.year || "");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      let updates: any = { bio, department, year };

      // ✅ Upload new profile picture if selected
      if (newImage) {
        const imageRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(imageRef, newImage);
        const downloadURL = await getDownloadURL(imageRef);
        updates.profilePic = downloadURL;
      }

      // ✅ Update Firestore document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updates);

      // ✅ Update local state immediately
      setUserData((prev: any) => ({ ...prev, ...updates }));
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-2xl w-[90%] max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-white">Edit Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Profile Picture
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewImage(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Department</label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter your department"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Year</label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter your year (e.g. Junior)"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full mt-4"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
