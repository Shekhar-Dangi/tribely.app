import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useCurrentUser = () => {
  const { user } = useUser();

  return useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
};
