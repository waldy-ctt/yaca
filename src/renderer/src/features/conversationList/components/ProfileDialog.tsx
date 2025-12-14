// src/renderer/src/features/conversationList/components/ProfileDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Check, X, Key } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";
import { apiPut } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { UserModel } from "@/types";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    tel: user?.tel || "",
    bio: user?.bio || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        tel: user.tel || "",
        bio: user.bio || "",
      });
    }
  }, [user, isOpen]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      tel: user?.tel || "",
      bio: user?.bio || "",
    });
    setErrors({});
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.tel.trim()) {
      newErrors.tel = "Phone number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await apiPut<UserModel>("/users/me", formData);

      updateUser({
        ...user,
        name: updatedUser.name,
        username: updatedUser.username,
        tel: updatedUser.tel,
        bio: updatedUser.bio,
      });

      setIsEditing(false);
      setErrors({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrors({ api: error.message || "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto" showCloseButton={!isEditing}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>My Profile</span>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user?.avatar || ""} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" className="hidden">
                  Change Avatar
                </Button>
              )}
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your full name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium">{user?.name || "—"}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="Your unique username"
                      className={errors.username ? "border-destructive" : ""}
                    />
                    {errors.username && (
                      <p className="text-xs text-destructive">{errors.username}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    @{user?.username || "—"}
                  </p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-sm font-medium text-muted-foreground">
                  {user?.email || "—"}
                </p>
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="tel">Phone Number</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="tel"
                      value={formData.tel}
                      onChange={(e) => handleChange("tel", e.target.value)}
                      placeholder="Your phone number"
                      className={errors.tel ? "border-destructive" : ""}
                    />
                    {errors.tel && (
                      <p className="text-xs text-destructive">{errors.tel}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    {user?.tel || "—"}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {user?.bio || "No bio yet"}
                  </p>
                )}
              </div>
            </div>

            {errors.api && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.api}
              </div>
            )}

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </>
  );
}

// Separate Password Change Dialog
interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiPut("/users/me/password", { currentPassword, newPassword });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      }, 2000);
    } catch (error: any) {
      setErrors({ api: error.message || "Failed to change password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center text-green-600">
            <Check className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">Password changed successfully!</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={errors.currentPassword ? "border-destructive" : ""}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.newPassword ? "border-destructive" : ""}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.api && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.api}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
