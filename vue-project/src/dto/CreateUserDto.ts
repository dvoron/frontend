export interface CreateUserDto {
    username: string;
    email: string;
    password?: string;
}

export function createEmptyCreateUserDto(): CreateUserDto {
    return {
        username: "",
        email: "",
        password: "",
    };
}
