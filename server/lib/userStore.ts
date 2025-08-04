// Shared user store for authentication and profile data

// Profile users map (for /api/v1/users endpoints)
export const profileUsers = new Map([
  ["550e8400-e29b-41d4-a716-446655440001", {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "demo@musiccatch.com",
    username: "demo_user",
    display_name: "Demo User",
    profile_image_url: "https://example.com/profiles/demo-user.jpg",
    bio: "Music lover and playlist curator",
    country: "United States",
    date_of_birth: "1995-06-15",
    gender: "Other",
    is_verified: true,
    is_artist: false,
    is_active: true,
    follower_count: 1250,
    following_count: 380,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    last_login: "2024-01-15T18:45:00Z"
  }],
  ["550e8400-e29b-41d4-a716-446655440002", {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "artist@musiccatch.com",
    username: "indie_artist",
    display_name: "Indie Artist",
    profile_image_url: "https://example.com/profiles/indie-artist.jpg",
    bio: "Independent musician creating unique sounds",
    country: "Canada",
    date_of_birth: "1992-03-22",
    gender: "Male",
    is_verified: true,
    is_artist: true,
    is_active: true,
    follower_count: 5670,
    following_count: 145,
    created_at: "2023-02-15T00:00:00Z",
    updated_at: "2024-01-14T15:20:00Z",
    last_login: "2024-01-14T20:15:00Z"
  }]
]);

// Auth users map (for /api/auth endpoints)
export const authUsers = new Map();

// User relationships
export const userFollows = new Map<string, Set<string>>();

// Function to sync user data between auth and profile systems
export const syncUserData = (userId: string, authData: any, profileData?: any) => {
  // Update auth user
  authUsers.set(userId, authData);
  authUsers.set(authData.email, authData);
  authUsers.set(authData.username, authData);

  // Update or create profile user
  if (profileData) {
    profileUsers.set(userId, profileData);
  } else {
    // Create profile from auth data
    const profile = {
      id: authData.id,
      email: authData.email,
      username: authData.username,
      display_name: authData.name || authData.username,
      profile_image_url: "",
      bio: "New to Music Catch! 🎵",
      country: "",
      date_of_birth: "",
      gender: "",
      is_verified: authData.is_verified || false,
      is_artist: false,
      is_active: true,
      follower_count: 0,
      following_count: 0,
      created_at: authData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    profileUsers.set(userId, profile);
  }
};

// Function to get user by any identifier
export const getUserByIdentifier = (identifier: string) => {
  return authUsers.get(identifier);
};

// Function to create new user in both systems
export const createUser = (userData: any) => {
  const userId = `user${Date.now()}`;
  const user = {
    id: userId,
    ...userData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  syncUserData(userId, user);
  return { data: user, error: null };
};
