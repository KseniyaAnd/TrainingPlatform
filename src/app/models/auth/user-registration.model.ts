export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
}
