/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar } from '../entities/Avatar';
import { User } from '../entities/User';
import {
  CreateAvatarInput,
  UpdateAvatarInput,
  ResolverContext,
} from '../types/types';
import { Types } from 'mongoose';

export const avatarResolver = {
  Query: {
    getAvatars: async (
      _: unknown,
      { userId }: { userId: string },
      _context: ResolverContext
    ) => {
      return await Avatar.find({ user: userId });
    },
    getAvatar: async (
      _: unknown,
      { id }: { id: string },
      _context: ResolverContext
    ) => {
      return await Avatar.findById(id);
    },
  },
  Mutation: {
    createAvatar: async (
      _: unknown,
      { input }: { input: CreateAvatarInput },
      _context: ResolverContext
    ) => {
      const user = await User.findById(input.userId);
      if (!user) throw new Error('User not found');

      const avatar = new Avatar({
        ...input,
        user: new Types.ObjectId(input.userId),
      });
      await avatar.save();

      user.avatars.push(avatar.id);
      await user.save();

      return avatar;
    },
    updateAvatar: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateAvatarInput },
      _context: ResolverContext
    ) => {
      return await Avatar.findByIdAndUpdate(id, input, { new: true });
    },
    deleteAvatar: async (
      _: unknown,
      { id }: { id: string },
      _context: ResolverContext
    ) => {
      await Avatar.findByIdAndDelete(id);
      return true;
    },
  },
};
