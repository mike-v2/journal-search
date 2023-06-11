import 'whatwg-fetch'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';
import JournalEntryBox from '@/components/journalEntryBox';
import Modal from 'react-modal';

//'1948-06-24T00:00:00.000Z'
const mockEntry = {
    id: 'clhe121xl002m7a0csw71dnfd',
    date: new Date('06-24-1948'),
    content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
    startPage: '104',
    endPage: '104',
};

const modalPlaceholderText = /What would you like to say about this journal entry?/i;

describe('JournalEntryBox', () => {
    beforeAll(() => {
        server.listen();
        Modal.setAppElement(document.body);
    });
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

    test("render JournalEntryBox", async () => {
        render(<TestWrapper><JournalEntryBox {...mockEntry} /></TestWrapper>)
    })

    test('modal opens and closes correctly', async () => {
        render(<TestWrapper><JournalEntryBox {...mockEntry} /></TestWrapper>)

        expect(screen.queryByText(modalPlaceholderText)).toBeNull();

        fireEvent.click(screen.getByText('Create Post'));
        expect(screen.getByPlaceholderText(modalPlaceholderText)).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByPlaceholderText(modalPlaceholderText)).toBeNull();
    });

    test('handle form submission', async () => {
        render(<TestWrapper><JournalEntryBox {...mockEntry} /></TestWrapper>)

        fireEvent.click(screen.getByText('Create Post'));

        const placeholderElement = screen.getByPlaceholderText(modalPlaceholderText);
        fireEvent.change(placeholderElement, {
            target: { value: 'Hello world!' },
        });

        fireEvent.click(screen.getByText('Post'));
        await waitFor(() => {
            expect(placeholderElement).toHaveValue('');
        });
    });
});
