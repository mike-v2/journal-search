import 'whatwg-fetch'
import { act, fireEvent, getByLabelText, getByPlaceholderText, getByText, queryByPlaceholderText, queryByText, render, screen, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';
import JournalEntryBox from '@/components/journalEntryBox';
import Modal from 'react-modal';

const mockEntry = {
  id: 'clhe121xl002m7a0csw71dnfd',
  date: new Date('06-24-1948'),
  content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
  startPage: '104',
  endPage: '104',
};

const mockSession = {
  id: '123',
  user: {

  } as User,
  userId: '123',
  expires: new Date(Date.now()),
  sessionToken: '123',
}

const modalPlaceholderText = /What would you like to say about this journal entry?/i;

beforeAll(() => {
  server.listen();
  Modal.setAppElement(document.body);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JournalEntryBox', () => {
  test("render JournalEntryBox", () => {
    render(<SessionProvider session={mockSession}><JournalEntryBox {...mockEntry} /></SessionProvider>)
  })

  test("render JournalEntryBox text", () => {
    const { getByText } = render(<SessionProvider session={mockSession}><JournalEntryBox {...mockEntry} /></SessionProvider>)
    expect(getByText(mockEntry.content)).toBeInTheDocument();
  })

  test('hides text and displays image when image option clicked', async () => {
    const { getByText, queryByAltText, getByAltText, findByAltText, getByLabelText, queryByText } = render(<SessionProvider session={mockSession}><JournalEntryBox {...mockEntry} /></SessionProvider>)

    expect(getByText(mockEntry.content)).toBeVisible();
    expect(queryByAltText(/journal image/)).not.toBeInTheDocument();

    fireEvent.click(getByLabelText('Dropdown Menu'));
    fireEvent.click(getByAltText('display image button'));

    expect(await findByAltText(/journal image/)).toBeVisible();
    // there's a bug with checking visibility of the entry text, so just check if the class is set correctly. expect(queryByText(mockEntry.content)).not.toBeVisible();
    expect(queryByText(mockEntry.content)?.parentElement).toHaveClass('hidden');
  });

  test('modal opens and closes correctly', () => {
    const { getByLabelText, getByText, queryByText, getByPlaceholderText, queryByPlaceholderText } = render(<SessionProvider session={mockSession}><JournalEntryBox {...mockEntry} /></SessionProvider>)

    expect(queryByText(modalPlaceholderText)).toBeNull();

    fireEvent.click(getByLabelText('Dropdown Menu'));
    fireEvent.click(getByText('Create Post'));
    expect(getByPlaceholderText(modalPlaceholderText)).toBeInTheDocument();

    fireEvent.click(getByText('Cancel'));
    expect(queryByPlaceholderText(modalPlaceholderText)).toBeNull();
  });

  test('handle form submission', async () => {
    const { getByLabelText, getByText, getByPlaceholderText } = render(<SessionProvider session={mockSession}><JournalEntryBox {...mockEntry} /></SessionProvider>)

    fireEvent.click(getByLabelText('Dropdown Menu'));
    fireEvent.click(getByText('Create Post'));

    const placeholderElement = getByPlaceholderText(modalPlaceholderText);
    fireEvent.change(placeholderElement, {
      target: { value: 'Hello world!' },
    });

    fireEvent.click(getByText('Post'));
    await waitFor(() => {
      expect(placeholderElement).toHaveValue('');
    });
  });
});
