export interface UpdateUserDto {
    username: string;
    email: string;
    oldPassword?: string;
    newPassword?: string;
}
