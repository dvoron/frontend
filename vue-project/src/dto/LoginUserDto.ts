export interface LoginUserDto {
    login: string;
    password?: string;
}

export function createEmptyLoginUserDto(): LoginUserDto {
    return {
        login: "",
        password: "",
    };
}
