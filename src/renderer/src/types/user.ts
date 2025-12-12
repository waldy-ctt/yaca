import { presence_status } from "./enums";

export interface UserModel {
  id: string | undefined;
  email: string | undefined;
  tel: string | undefined;
  name: string | undefined;
  bio: string | undefined;
  username: string | undefined;
  avatar: string | null;
  status: presence_status | presence_status.NONE;
}

export interface UserDto {
  data: UserModel;
  nextCursor: string;
}
