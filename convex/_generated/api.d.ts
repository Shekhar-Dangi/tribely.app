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
import type * as brands from "../brands.js";
import type * as cloudinary from "../cloudinary.js";
import type * as cloudinaryActions from "../cloudinaryActions.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as follows from "../follows.js";
import type * as gyms from "../gyms.js";
import type * as http from "../http.js";
import type * as individuals from "../individuals.js";
import type * as posts from "../posts.js";
import type * as testData from "../testData.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  brands: typeof brands;
  cloudinary: typeof cloudinary;
  cloudinaryActions: typeof cloudinaryActions;
  events: typeof events;
  explore: typeof explore;
  follows: typeof follows;
  gyms: typeof gyms;
  http: typeof http;
  individuals: typeof individuals;
  posts: typeof posts;
  testData: typeof testData;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
