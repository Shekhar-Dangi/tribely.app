### Types

`types/schema.ts`

**Interfaces** :

db interfaces are defined in `convex/schema.ts`

defined :

User
IndividualProfile
GymProfile
BrandProfile
UserWithProfile extends User : `profile: IndividualProfile | GymProfile | BrandProfile | null;`
Post

interfaces defined in `utils/location.ts`
Location

**Helpers :**

isIndividualProfile(profile: any): profile is IndividualProfile
isGymProfile(profile: any): profile is isGymProfile
isBrandProfile(profile: any): profile is isBrandProfile
isUserWithProfile(profile: any): profile is isUserWithProfile

### Mutations

#### `convex/users.ts`

**todo :**

- separate logic for userwithprofile switch statement

createUser(clerkId: v.string(), email: v.string(), name: v.string(), avatarUrl: v.optional(v.string()))

getUserByClerkId(clerkId: v.string()) : User

getUserWithProfileByClerkId(clerkId: v.string()) : UserWithProfile

getUserById(userId: v.id("users")) : User

completeOnboarding(refer the file)

_:consider_ getUserWithProfile(userId: v.id("users")) : UserWithProfile

getUserByUsername(username: v.string()) : UserWithProfile
updateUser(User data)

updateUserLocation(userId: v.id("users"), location : {city, state, country, coordinates})

searchUsers(query: v.string(), userType : v.optional(v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))), limit: v.optional(v.number())) : UserWithProfile

_:consider getTrendingUsers()_

updateGymProfile()

updateBrandProfile()

#### `convex/individuals.ts`

createIndividualProfile(userId: v.id("users"), stats, experiences, certifications, affiliation, isTrainingEnabled, trainingPrice)

updateIndividualProfile(userId: v.id("users"), stats, experiences, certifications, affiliation, isTrainingEnabled, trainingPrice, activityScore)

getIndividualProfile(userId: v.id("users")) : IndividualProfile

updateActivityScore(userId: v.id("users"), scoreChange: v.number()) : {success: boolean, newScore: number}

getTopIndividuals(limit: v.optional(v.number())) : IndividualProfile[] with user data

getTrainers(limit: v.optional(v.number())) : IndividualProfile[] with user data (isTrainingEnabled = true)

#### `convex/gyms.ts`

createGymProfile(userId: v.id("users"), businessInfo, membershipPlans, stats)

updateGymProfile(userId: v.id("users"), businessInfo, membershipPlans, stats)

getGymProfile(userId: v.id("users")) : GymProfile

_:consider searchGymsByLocation(location: v.optional(v.string()), limit: v.optional(v.number())) : GymProfile[] with user data_

getAllGyms(limit: v.optional(v.number())) : GymProfile[] with user data

#### `convex/brands.ts`

**todo :**

- brand industry data type

createBrandProfile(userId: v.id("users"), businessInfo, partnerships)

updateBrandProfile(userId: v.id("users"), businessInfo, partnerships)

getBrandProfile(userId: v.id("users")) : BrandProfile

getBrandsByIndustry(industry: v.optional(v.string()), limit: v.optional(v.number())) : BrandProfile[] with user data

getAllBrands(limit: v.optional(v.number())) : BrandProfile[] with user data

addPartnership(userId: v.id("users"), partnerName: v.string(), partnerType: v.union, partnership_type: v.string(), startDate: v.number(), endDate: v.optional(v.number()))
