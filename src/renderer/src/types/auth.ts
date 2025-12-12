import { UserModel } from "./user";

export interface AuthDto {
  token: string;
  user:  UserModel;
}
