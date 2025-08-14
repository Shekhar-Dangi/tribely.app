/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activityTransaction from "../activityTransaction.js";
import type * as brands from "../brands.js";
import type * as chats from "../chats.js";
import type * as cloudinary from "../cloudinary.js";
import type * as cloudinaryActions from "../cloudinaryActions.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as follows from "../follows.js";
import type * as gyms from "../gyms.js";
import type * as http from "../http.js";
import type * as individuals from "../individuals.js";
import type * as leaderboard from "../leaderboard.js";
import type * as posts from "../posts.js";
import type * as users from "../users.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activityTransaction: typeof activityTransaction;
  brands: typeof brands;
  chats: typeof chats;
  cloudinary: typeof cloudinary;
  cloudinaryActions: typeof cloudinaryActions;
  events: typeof events;
  explore: typeof explore;
  follows: typeof follows;
  gyms: typeof gyms;
  http: typeof http;
  individuals: typeof individuals;
  leaderboard: typeof leaderboard;
  posts: typeof posts;
  users: typeof users;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
