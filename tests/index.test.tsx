import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

import 'whatwg-fetch';
import { render, screen } from '@testing-library/react';

import Home from '@/app/page';
import { server } from '@/mocks/server';
import useFetchJournalEntries from '@/hooks/useFetchJournalEntries';

const mockSession = {
  id: '123',
  user: {} as User,
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
];

beforeAll(() => {
  server.listen();
});
beforeEach(() => {
  (useFetchJournalEntries as jest.Mock).mockReturnValue(mockExampleEntries);
  render(
    <SessionProvider session={mockSession}>
      <Home />
    </SessionProvider>,
  );
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

jest.mock('../hooks/useFetchJournalEntries');
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

describe('Home', () => {
  test('renders body text correctly', () => {
    expect(
      screen.getByText(/Discover the fascinating world of Harry Howard/i),
    ).toBeInTheDocument();
  });
});
