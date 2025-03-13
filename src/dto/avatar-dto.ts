export interface CreateAvatarInput {
  name: string;
  weapon: string;
  clothes: string;
  hairColor: string;
  facialHair?: string;
  gender: string;
  genre: string;
  imageUrl: string;
  userId: string;
}

export interface UpdateAvatarInput {
  name?: string;
  weapon?: string;
  clothes?: string;
  hairColor?: string;
  facialHair?: string;
  gender?: string;
  genre?: string;
  imageUrl?: string;
}
