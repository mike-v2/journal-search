import 'whatwg-fetch'
import { act, render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { server } from '@/mocks/server';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';
import useFetchJournalEntries from '@/hooks/useFetchJournalEntries';

const mockSession = {
  id: '123',
  user: {

  } as User,
  userId: '123',
  expires: new Date(Date.now()),
  sessionToken: '123',
};

const mockExampleEntries = [
  {
    entryDate: '01-01-2023',
    entry: {
      id: '123',
      date: new Date(2023, 0, 1),
      startPage: '23',
      endPage: '24',
      content: 'Mocked journal entry 1',
    },
  },
  {
    entryDate: '02-01-2023',
    entry: {
      id: '1234',
      date: new Date(2023, 1, 1),
      startPage: '51',
      endPage: '54',
      content: 'Mocked journal entry 2',
    },
  },
]

beforeAll(() => {
  server.listen();
});
beforeEach(() => {
  (useFetchJournalEntries as jest.Mock).mockReturnValue(mockExampleEntries);
  render(<SessionProvider session={mockSession}><Home /></SessionProvider>);
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

jest.mock('../hooks/useFetchJournalEntries'); 

describe('Home', () => {
  test("renders image for Harry Howard", () => {
    expect(screen.getByAltText(/picture of Harry Howard/i)).toBeInTheDocument();
  });

  test("renders header with correct text", () => {
    expect(screen.getByText(/Welcome to the Harry Howard Journals:/i)).toBeInTheDocument();
  });

  test("renders subheader with correct text", () => {
    expect(screen.getByText(/A Glimpse into the 1930s Life of a Salt Lake City Family Man/i)).toBeInTheDocument();
  });

  test("renders body text correctly", () => {
    expect(screen.getByText(/Discover the fascinating world of Harry Howard/i)).toBeInTheDocument();
  });
});
