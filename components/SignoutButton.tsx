// components/SignOutButton.tsx
"use client";

import { signOut } from "@/lib/auth";
import { Icon } from "@/components/ui/icon";

const SignOutButton = () => {
  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <form onSubmit={handleSignOut} className="w-full">
      <button type="submit" className="w-full flex items-center gap-2">
        <Icon icon="heroicons:power" className="w-4 h-4" />
        Log out
      </button>
    </form>
  );
};

export default SignOutButton;
