import 'whatwg-fetch'
import { act, render, screen, waitFor } from '@testing-library/react';
import Home from '../pages/index';
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
    header: 'Mocked Entry 1',
    entryDate: '01-01-2023',
    imagePath: '/mocked-image-1.png',
    journalEntry: { text: 'Mocked journal entry 1' },
  },
  {
    header: 'Mocked Entry 2',
    entryDate: '02-01-2023',
    imagePath: '/mocked-image-2.png',
    journalEntry: { text: 'Mocked journal entry 2' },
  },
]

beforeAll(() => {
  server.listen();
});
beforeEach(() => {
  (useFetchJournalEntries as jest.Mock).mockReturnValue(mockExampleEntries);
  render(<Home />);
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

jest.mock('../hooks/useFetchJournalEntries'); 

describe('Home', () => {
  test("renders Home", async () => {
    const entryElement = await screen.findAllByLabelText("Journal Entry");
    expect(entryElement.length).toBe(mockExampleEntries.length);
  });

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

  test('renders the entries returned by useFetchJournalEntries', () => {
    expect(screen.getByText('Mocked Entry 1')).toBeInTheDocument();
    expect(screen.getByText('Mocked Entry 2')).toBeInTheDocument();
  });
});
