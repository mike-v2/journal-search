import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

import 'whatwg-fetch';
import { fireEvent, render, waitFor } from '@testing-library/react';

import Search from '@/app/search/page';
import { server } from '@/mocks/server';

const TestWrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <SessionProvider
      session={{
        id: '123',
        user: {} as User,
        userId: '123',
        expires: new Date(Date.now()),
        sessionToken: '123',
      }}
    >
      {children}
    </SessionProvider>
  );
};

type QueryParams = {
  page: string;
  size: string;
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: jest.fn(),
}));

beforeEach(() => {
  const navigation = require('next/navigation');
  navigation.useSearchParams.mockImplementation(() => ({
    get: jest.fn((key: keyof QueryParams) => {
      return { page: '1', size: '5' }[key];
    }),
  }));
});
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Search', () => {
  test("pressing 'Enter' key performs search", async () => {
    const { getByRole, findAllByText } = render(<Search />);

    const form = getByRole('search');
    fireEvent.submit(form);

    const searchResults = await findAllByText(/first5/);
    expect(searchResults.length).toBe(5);
  });

  test('clicking search button performs search', async () => {
    const { getByLabelText, findAllByText } = render(<Search />);

    fireEvent.click(getByLabelText('Search'));

    const searchResults1 = await findAllByText(/first5/);
    expect(searchResults1.length).toBe(5);
  });

  /* test('default page and size values are used when not present in useSearchParams', async () => {
    //default values are page=1, size=5

    jest.mock('next/navigation', () => ({
      useSearchParams: () => ({
        get: jest.fn(),
      }),
    }));

    const { getByLabelText, findAllByText, queryAllByText } = render(
      <Search />,
    );

    fireEvent.click(getByLabelText('Search'));

    await waitFor(() => {
      const searchResults1 = queryAllByText(/first5/);
      expect(searchResults1.length).toBe(5);

      const searchResults2 = queryAllByText(/second5/);
      expect(searchResults2.length).toBe(0);
    });
  }); */

  test('page value from useSearchParams determines which results are displayed', async () => {
    const navigation = require('next/navigation');
    navigation.useSearchParams.mockImplementation(() => ({
      get: jest.fn((key: keyof QueryParams) => {
        return { page: '2', size: '5' }[key];
      }),
    }));

    const { getByLabelText, queryAllByText, getAllByText } = render(<Search />);

    fireEvent.click(getByLabelText('Search'));

    await waitFor(() => {
      const searchResults1 = queryAllByText(/first5/);
      expect(searchResults1.length).toBe(0);

      const searchResults2 = getAllByText(/second5/);
      expect(searchResults2.length).toBe(5);
    });
  });

  test('size value from useSearchParams determines how many results are displayed', async () => {
    const navigation = require('next/navigation');
    navigation.useSearchParams.mockImplementation(() => ({
      get: jest.fn((key: keyof QueryParams) => {
        return { page: '1', size: '10' }[key];
      }),
    }));

    const { getByLabelText, findAllByText } = render(<Search />);

    fireEvent.click(getByLabelText('Search'));

    const searchResults1 = await findAllByText(/first5/);
    expect(searchResults1.length).toBe(5);

    const searchResults2 = await findAllByText(/second5/);
    expect(searchResults2.length).toBe(5);
  });

  test('scrollIntoView is called when selectedEntry updates', async () => {
    const scrollIntoViewMock = jest.fn();
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    const { getByLabelText, findAllByText } = render(
      <TestWrapper>
        <Search />
      </TestWrapper>,
    );

    fireEvent.click(getByLabelText('Search'));
    const first5 = await findAllByText(/first5/);
    fireEvent.click(first5[0]);

    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalled());
  });
});
