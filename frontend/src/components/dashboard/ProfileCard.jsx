import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import api from "../../utils/api";
import { toast } from "react-toastify";

const ProfileCard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Helper to get display name
  const getDisplayName = (fullName) => {
    if (!fullName) return "";
    if (typeof fullName === 'string') return fullName;
    if (typeof fullName === 'object' && (fullName.firstName || fullName.lastName)) {
      return `${fullName.firstName || ''} ${fullName.lastName || ''}`.trim();
    }
    return "";
  };
  
  const [formData, setFormData] = useState({
    fullName: getDisplayName(user?.fullName),
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || null);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    );
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: getDisplayName(user.fullName),
        username: user?.username || "",
        currentPassword: "",
        newPassword: "",
        avatar: null,
      });
      setAvatarPreview(user.profilePic || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Convert fullName string back to object format for backend
      const nameParts = formData.fullName.trim().split(' ');
      const fullNameObj = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      };
      data.append("fullName", JSON.stringify(fullNameObj));
      
      if (formData.username && formData.username !== user?.username) {
        data.append("username", formData.username);
      }
      
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters");
          setLoading(false);
          return;
        }
        data.append("currentPassword", formData.currentPassword);
        data.append("newPassword", formData.newPassword);
      }
      
      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      const response = await api.patch("/api/v1/me", data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      
      onUpdate(response.data.data?.user || response.data.user || response.data);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: getDisplayName(user?.fullName),
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      avatar: null,
    });
    setAvatarPreview(user?.profilePic || null);
    setIsEditing(false);
  };

  return (
    <div ref={cardRef}>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-300/10 via-transparent to-yellow-300/10 opacity-60" />

        {!isEditing ? (
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-6">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={getDisplayName(user?.fullName)}
                  className="size-24 rounded-full border-4 border-violet-300/30 object-cover"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-full border-4 border-violet-300/30 bg-gradient-to-br from-violet-300/20 to-blue-300/20">
                  <span className="special-font font-zentry text-4xl font-black uppercase text-violet-300">
                    {getDisplayName(user?.fullName)?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="special-font mb-1 font-zentry text-2xl font-black uppercase text-white md:text-3xl">
                {getDisplayName(user?.fullName) || "User"}
              </h3>
              {user?.username && (
                <p className="font-circular-web text-sm text-violet-300">
                  @{user.username}
                </p>
              )}
              <p className="font-circular-web text-sm text-white/60">
                {user?.email}
              </p>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditing(true)}
              title="Edit Profile"
              containerClass="mt-4 sm:mt-0 bg-violet-300/20 text-violet-300 border border-violet-300/30 hover:bg-violet-300/30"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="size-24 rounded-full border-4 border-violet-300/30 object-cover"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-violet-300 p-2 transition-transform duration-300 hover:scale-110"
                  >
                    <svg
                      className="size-4 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <label
                  htmlFor="avatar-upload"
                  className="flex size-24 cursor-pointer items-center justify-center rounded-full border-4 border-dashed border-violet-300/30 bg-gradient-to-br from-violet-300/10 to-blue-300/10 transition-all duration-300 hover:border-violet-300 hover:from-violet-300/20 hover:to-blue-300/20"
                >
                  <svg
                    className="size-8 text-violet-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
              <p className="font-circular-web text-xs text-white/60">
                Click to upload avatar
              </p>
            </div>

            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />

            {user?.provider === "email" && (
              <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="font-general text-sm uppercase tracking-wide text-violet-300">
                  Change Password (Optional)
                </h4>

                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />

                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                title={loading ? "Saving..." : "Save Changes"}
                containerClass="flex-1 bg-violet-300 text-black"
              />
              <Button
                type="button"
                onClick={handleCancel}
                title="Cancel"
                containerClass="flex-1 bg-white/10 text-white hover:bg-white/20"
              />
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ProfileCard;
