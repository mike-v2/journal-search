import { AxiosResponse } from 'axios';
import { JournalEntry } from '@prisma/client';

import { serverAxios } from '@/utils/axios/serverAxios';

export const getJournalEntry = async (
  journalDate: string,
): Promise<AxiosResponse<JournalEntry>> =>
  await serverAxios.get(`/journalEntry?date=${journalDate}`);

export const getJournalEntries = async (
  journalDates: string[],
): Promise<AxiosResponse<JournalEntry[]>> =>
  await serverAxios.get(`/journalEntry`, { params: { date: journalDates } });
