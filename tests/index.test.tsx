import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

import 'whatwg-fetch';
import { render, screen } from '@testing-library/react';

import Home from '@/app/page';
import { server } from '@/mocks/server';
import useJournalEntries from '@/hooks/useJournalEntries';

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
/* beforeEach(() => {
  (useJournalEntries as jest.Mock).mockReturnValue(mockExampleEntries);
  render(
    <SessionProvider session={mockSession}>
      <Home />
    </SessionProvider>,
  );
}); */
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

jest.mock('../hooks/useFetchJournalEntries');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('Home', () => {
  test('renders body text correctly', () => {
    expect(
      screen.getByText(/Discover the fascinating world of Harry Howard/i),
    ).toBeInTheDocument();
  });
});
