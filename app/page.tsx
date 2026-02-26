import { Button } from "@/components/ui/button"; 
import { LogoutButton } from "@/modules/auth/components/logout-client";
import { UserButton } from "@/modules/auth/components/user-button";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <UserButton />
      <LogoutButton/>
    </div>
  );
}
