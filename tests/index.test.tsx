import 'whatwg-fetch'
import { act, render, screen, waitFor } from '@testing-library/react';
import Home from '../pages/index';
import { server } from '@/mocks/server';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

describe('Home', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

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

    test("renders image for Harry Howard", () => {
        render(<TestWrapper><Home /></TestWrapper>);

        expect(screen.getByAltText(/picture of Harry Howard/i)).toBeInTheDocument();
    });

    test("renders header with correct text", () => {
        render(<TestWrapper><Home /></TestWrapper>);

        expect(screen.getByText(/Welcome to the Harry Howard Journals:/i)).toBeInTheDocument();
    });

    test("renders subheader with correct text", () => {
        render(<TestWrapper><Home /></TestWrapper>);

        expect(screen.getByText(/A Glimpse into the 1930s Life of a Salt Lake City Family Man/i)).toBeInTheDocument();
    });

    test("renders body text correctly", () => {
        render(<TestWrapper><Home /></TestWrapper>);

        expect(screen.getByText(/Discover the fascinating world of Harry Howard/i)).toBeInTheDocument();
    });

    test("renders fetched journal entry text", async () => {
        render(<TestWrapper><Home /></TestWrapper>);

        await waitFor(async () => {
            expect(await screen.findByText(/Painting, cleaning, remodeling/i)).toBeInTheDocument();
        });
    });
});
