export interface AchievementDto {
    id: number;
    key: string;
    label: string;
    description: string;
    icon: string | null;
}

export interface UserAchievementDto {
    unlockedAt: string | null;
    achievement: AchievementDto;
}

export interface ChatUserDto {
    id: number;
    username: string;
    avatarUrl: string | null;
}

export interface MessageDto {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
    sender: ChatUserDto;
    receiver: ChatUserDto;
}

export interface ConversationDto {
    user: ChatUserDto;
    lastMessage: string;
    sentAt: string;
}

export interface FriendUserDto {
    id: number;
    username: string;
    avatarUrl: string | null;
    status: string;
}

export interface FriendRequestDto extends FriendUserDto {
    requestedAt: string;
}

export interface RelationshipResponseDto {
    relationship: string;
}

export interface LeaderboardEntryDto {
    rank: number;
    username: string;
    avatarUrl: string | null;
    language: string;
    avgWpm: number;
    gamesPlayed: number;
    level: number;
    avgAccuracy: number;
}

export interface UserStatsDto {
    rank: number;
    avgWpm: number;
    level: number;
    gamesPlayed: number;
}

export interface UserProfileDto {
    id: number;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    status: string;
    language: string;
    createdAt: string | null;
    stats: UserStatsDto;
    achievements: UserAchievementDto[];
}

export interface AvatarResponseDto {
    avatarUrl: string;
}

export interface UserSearchDto {
    id: number;
    username: string;
    avatarUrl: string | null;
    status: string;
}

export type QuoteCreator = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type Quote = {
  id: number;
  text: string;
  type: string | null;
  active: boolean;
  createdAt: string;
  creator: QuoteCreator | null;
};
