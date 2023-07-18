import 'whatwg-fetch'
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';
import { server } from '@/mocks/server';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

const mockSession = {
  id: '123',
  user: {

  } as User,
  userId: '123',
  expires: new Date(Date.now()),
  sessionToken: '123',
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Home', () => {
  test("renders image for Harry Howard", () => {
    render(<SessionProvider session={mockSession}><Home /></SessionProvider>);

    expect(screen.getByAltText(/picture of Harry Howard/i)).toBeInTheDocument();
  });

  test("renders header with correct text", () => {
    render(<SessionProvider session={mockSession}><Home /></SessionProvider>);

    expect(screen.getByText(/Welcome to the Harry Howard Journals:/i)).toBeInTheDocument();
  });

  test("renders subheader with correct text", () => {
    render(<SessionProvider session={mockSession}><Home /></SessionProvider>);

    expect(screen.getByText(/A Glimpse into the 1930s Life of a Salt Lake City Family Man/i)).toBeInTheDocument();
  });

  test("renders body text correctly", () => {
    render(<SessionProvider session={mockSession}><Home /></SessionProvider>);

    expect(screen.getByText(/Discover the fascinating world of Harry Howard/i)).toBeInTheDocument();
  });

  test("renders fetched journal entry text", async () => {
    render(<SessionProvider session={mockSession}><Home /></SessionProvider>);

    const entryElement = await screen.findAllByText(/Painting, cleaning, remodeling/i);
    expect(entryElement.length).toBeGreaterThan(0);
  });
});
