import { AxiosResponse } from 'axios';
import { JournalEntry } from '@prisma/client';

import { serverAxios } from '@/utils/axios/serverAxios';
import { JournalEntryExt } from '@/types/prismaExtensions';

export const getJournalEntry = async (
  journalDate: string,
): Promise<AxiosResponse<JournalEntry>> =>
  await serverAxios.get(`/journalEntry?date=${journalDate}`);

export const getJournalEntries = async (
  journalDates: string[],
): Promise<AxiosResponse<JournalEntry[]>> =>
  await serverAxios.get(`/journalEntry`, { params: { date: journalDates } });

export const getJournalEntriesForYear = async (
  year: string,
): Promise<AxiosResponse<JournalEntryExt[]>> =>
  await serverAxios.get(`/journalEntry?year=${year}`);
