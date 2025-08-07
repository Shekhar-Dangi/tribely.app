import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserWithProfile } from "@/types/schema";

export const useCurrentUser = () => {
  const { user } = useUser();

  return useQuery(api.users.getUserWithProfileByClerkId, {
    clerkId: user?.id || "",
  }) as UserWithProfile | undefined;
};
