'use client';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Camera, Loader2 } from 'lucide-react';
import BadgesDisplay from '@/components/BadgesDisplay';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    full_name: '',
    gce_level: 'O Level',
    school: '',
    region: '',
    subscription_tier: 'Free',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-up-login-screen');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          gce_level: data.gce_level || 'O Level',
          school: data.school || '',
          region: data.region || '',
          subscription_tier: data.subscription_tier || 'Free',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        gce_level: profile.gce_level,
        school: profile.school,
        region: profile.region
      })
      .eq('id', user?.id);

    if (!error) {
      alert('Profile saved successfully!');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();

    const fileName = `${user?.id}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) {
      alert('Failed to upload avatar');
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user?.id);

    if (updateError) {
      alert('Failed to update avatar');
    } else {
      setProfile({ ...profile, avatar_url: publicUrl });
      alert('Avatar updated!');
    }
    setUploadingAvatar(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {/* Subscription Status Card */}
      <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${
        profile.subscription_tier === 'Premium' 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
          : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <p className="text-sm font-semibold">Current Plan</p>
            <p className="text-lg font-bold">{profile.subscription_tier}</p>
          </div>
        </div>
        {profile.subscription_tier === 'Free' && (
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Upgrade Now
          </button>
        )}
      </div>

      {/* Avatar Upload */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <img
            src={profile.avatar_url || "https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png"}
            alt="Profile avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
          />
          <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full cursor-pointer">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-gray-500">Click the camera icon to upload</p>
          {uploadingAvatar && <p className="text-xs text-primary mt-1">Uploading...</p>}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GCE Level</label>
          <select
            value={profile.gce_level}
            onChange={(e) => setProfile({ ...profile, gce_level: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="O Level">O Level</option>
            <option value="A Level">A Level</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">School</label>
          <input
            type="text"
            value={profile.school}
            onChange={(e) => setProfile({ ...profile, school: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Your school name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            value={profile.region}
            onChange={(e) => setProfile({ ...profile, region: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Region</option>
            <option value="Centre">Centre (Yaoundé)</option>
            <option value="Littoral">Littoral (Douala)</option>
            <option value="West">West (Bafoussam)</option>
            <option value="North West">North West (Bamenda)</option>
            <option value="South West">South West (Buea)</option>
            <option value="Adamawa">Adamawa (Ngaoundéré)</option>
            <option value="Far North">Far North (Maroua)</option>
            <option value="North">North (Garoua)</option>
            <option value="East">East (Bertoua)</option>
            <option value="South">South (Ebolowa)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Badges Display - Added for Step 4 */}
      <div className="mt-8">
        <BadgesDisplay />
      </div>
    </div>
  );
}