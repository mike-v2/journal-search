import { AxiosResponse } from 'axios';

import { Comment } from '@prisma/client';

import { clientAxios } from '@/utils/axios/clientAxios';
import { CommentExt } from '@/types/prismaExtensions';

export const saveComment = async (
  comment: Partial<Comment>,
): Promise<AxiosResponse<CommentExt>> =>
  await clientAxios.post('/comment', comment);

export const deleteComment = async (
  id: string,
): Promise<AxiosResponse<string>> =>
  await clientAxios.delete(`/comment?id=${id}`);
