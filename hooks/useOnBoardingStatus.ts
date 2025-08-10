import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function useOnBoardingStatus() {
  const { user, isLoaded: userLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isLoadingAuth = !userLoaded;
  const isLoadingUserData = userLoaded && user?.id && convexUser === undefined;
  const isLoading = isLoadingAuth || isLoadingUserData;

  return {
    status: convexUser?.onBoardingStatus ?? false,
    isLoading,
    isAuthenticated: !!user?.id,
  };
}
