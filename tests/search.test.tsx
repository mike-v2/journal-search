import 'whatwg-fetch'
import Search from "@/pages/search"
import { fireEvent, getByPlaceholderText, getByText, render, screen, waitFor } from "@testing-library/react"
import { server } from '@/mocks/server';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { page: '1', size: '5' },
  }),
}));

const TestWrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <SessionProvider session={{
      id: '123',
      user: {

      } as User,
      userId: '123',
      expires: new Date(Date.now()),
      sessionToken: '123',
    }}>
      {children}
    </SessionProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Search', () => {
  test("pressing 'Enter' key performs search", async () => {
    render(<Search />);

    const inputElement = screen.getByPlaceholderText("Search..");
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    const searchResults1 = await screen.findAllByText(/first5/);
    expect(searchResults1.length).toBeGreaterThan(0);
  });

  test("clicking search button performs search", async () => {
    render(<Search />);

    const searchButton = screen.getByAltText("search-icon");
    fireEvent.click(searchButton);

    const searchResults1 = await screen.findAllByText(/first5/);
    expect(searchResults1.length).toBeGreaterThan(0);
  });

  test("default page and size values are used when not present in router.query", async () => {
    //default values are page=1, size=5

    const useRouter = jest.spyOn(require("next/router"), "useRouter");
    useRouter.mockImplementation(() => ({
      query: {},
    }));

    render(<Search />);

    const inputElement = screen.getByPlaceholderText("Search..");
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    const searchResults1 = await screen.findAllByText(/first5/);
    expect(searchResults1.length).toBe(5);

    const searchResults2 = screen.queryAllByText(/second5/);
    expect(searchResults2.length).toBe(0);
  });

  test("page value from router.query determines which results are displayed", async () => {
    const useRouter = jest.spyOn(require("next/router"), "useRouter");
    useRouter.mockImplementation(() => ({
      query: { page: '2', size: '5' },
    }));

    render(<Search />);

    const inputElement = screen.getByPlaceholderText("Search..");
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    //put the async method first. Since 'queryAllByText' is synchronous, it wouldn't find 'first5' even if they were going to be fetched
    const searchResults2 = await screen.findAllByText(/second5/);
    expect(searchResults2.length).toBe(5);

    const searchResults1 = screen.queryAllByText(/first5/);
    expect(searchResults1.length).toBe(0);
  });

  test("size value from router.query determines how many results are displayed", async () => {
    const useRouter = jest.spyOn(require("next/router"), "useRouter");
    useRouter.mockImplementation(() => ({
      query: { page: '1', size: '10' },
    }));

    render(<Search />);

    const inputElement = screen.getByPlaceholderText("Search..");
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    const searchResults1 = await screen.findAllByText(/first5/);
    expect(searchResults1.length).toBe(5);

    const searchResults2 = screen.queryAllByText(/second5/);
    expect(searchResults2.length).toBe(5);
  });

  test("scrollIntoView is called when selectedEntry updates", async () => {
    const useRouter = jest.spyOn(require("next/router"), "useRouter");

    useRouter.mockImplementation(() => ({
      query: { page: '1', size: '5' },
    }));

    render(<TestWrapper><Search /></TestWrapper>);
    const inputElement = screen.getByPlaceholderText("Search..");
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    const first5SearchResults = await screen.findAllByText(/first5/);

    const scrollIntoViewMock = jest.fn();
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoViewMock });

    fireEvent.click(first5SearchResults[0]);

    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalled());
  });
})