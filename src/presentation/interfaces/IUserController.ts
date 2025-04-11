interface RegisterUserDto {
    name: string;
    email: string;
    phoneNumber?: string;
    password?: string;
}

interface UserProfileDto {
    userId: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    profilePictureUrl?: string | null;
    verificationStatus: boolean;
    createdAt: Date;
}

interface UpdateUserProfileDto {
    name?: string;
    phoneNumber?: string | null;
    profilePictureUrl?: string | null;
}

export interface IUserController {
    register(userData: RegisterUserDto): Promise<UserProfileDto | any>;
    getUserProfile(userId: string): Promise<UserProfileDto | any>;
    updateUserProfile(userId: string, profileData: UpdateUserProfileDto): Promise<UserProfileDto | any>;
}