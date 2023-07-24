import 'whatwg-fetch'
import { server } from "@/mocks/server";
import { SessionProvider } from "next-auth/react";
import { User } from "next-auth";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostBox from "../components/postBox";
import PostExt from "@/types/postExt";
import CommentExt from "@/types/commentExt";

type PostExtMock = Omit<PostExt, 'comments'> & {
  comments: CommentExt[]
}

const mockPost: PostExtMock = {
  id: '123',
  journalEntryId: "",
  journalEntry: {
    id: '123',
    date: new Date(1948, 0, 1),
    startPage: '1',
    endPage: '2',
    content: 'test journal entry'
  },
  creatorId: "",
  createdAt: new Date(2023, 0, 1),
  createdBy: {
    image: 'https://via.placeholder.com/150',
    name: 'Post Test User',
    id: "123",
    email: null,
    emailVerified: null,
  },
  title: 'Test Post Title',
  text: 'Test Post Text',
  comments: [{
    id: '123',
    userId: '1',
    postId: '123',
    createdAt: new Date(2023, 0, 2),
    text: 'test comment 1',
    user: {
      image: 'https://via.placeholder.com/200',
      name: 'Comment Test User 1',
      id: "123",
      email: null,
      emailVerified: null,
    }
  },
  {
    id: '123',
    userId: '2',
    postId: '123',
    createdAt: new Date(2023, 0, 2),
    text: 'test comment 2',
    user: {
      image: 'https://via.placeholder.com/200',
      name: 'Comment Test User 2',
      id: "123",
      email: null,
      emailVerified: null,
    }
  }] as CommentExt[],
};

const mockSession = {
  id: '123',
  user: {
    id: '1',
    image: 'https://via.placeholder.com/200',
  } as User,
  userId: '1',
  expires: new Date(Date.now()),
  sessionToken: '123',
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PostBox rendering", () => {
  test("renders without crashing", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
  });

  test("renders journal entry text", () => {
    const { getByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    expect(getByText(mockPost.journalEntry.content)).toBeInTheDocument();
  })

  test("displays user's avatar correctly", () => {
    const { getByText, getByAltText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    expect(getByAltText(`${mockPost.createdBy.name}'s avatar`)).toBeInTheDocument();
    expect(getByAltText(`${mockPost.createdBy.name}'s avatar`)).toHaveAttribute('src', expect.stringMatching(/via\.placeholder/));
  });

  test("displays creator's name correctly", () => {
    const { getByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(getByText(mockPost.createdBy.name as string)).toBeInTheDocument();
  });

  test("displays post text correctly", () => {
    const { getByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    expect(getByText(mockPost.text)).toBeInTheDocument();
  });

  test("renders comment input field and button iff session user exists", () => {
    const { getByText, queryByText, queryByPlaceholderText } = render(<SessionProvider session={undefined}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    expect(queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument();
    expect(queryByText('Comment')).not.toBeInTheDocument();
  });

  test("does not render comment input field and button if user is not logged in", () => {
    const { getByText, getByPlaceholderText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    expect(getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    expect(getByText('Comment')).toBeInTheDocument();
  });

  test("renders all comments correctly", () => {
    const { getByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    for (const comment of mockPost.comments) {
      expect(getByText(comment.text)).toBeInTheDocument();
      expect(getByText(comment.user.name as string)).toBeInTheDocument();
    }
  });

  test("shows edit and delete buttons iff comment's userId matches the session user's ID", () => {
    const { getByText, getAllByLabelText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const commentElements = getAllByLabelText("User comment");
    expect(commentElements.length).toEqual(mockPost.comments.length);
    mockPost.comments.forEach((comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { queryByText } = within(commentElements[index]);
        expect(queryByText('Edit')).toBeInTheDocument();
        expect(queryByText('Delete')).toBeInTheDocument();
      } else {
        const { queryByText } = within(commentElements[index]);
        expect(queryByText('Edit')).not.toBeInTheDocument();
        expect(queryByText('Delete')).not.toBeInTheDocument();
      }
    });
  });
});

describe("PostBox interaction", () => {
  test('handles new comment submission', async () => {
    const { getByText, findByText, getByLabelText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const input = getByLabelText('Comment Input');
    userEvent.type(input, 'This is a new comment');

    fireEvent.click(getByText('Comment'));

    expect(await findByText('This is a new comment')).toBeInTheDocument();
  });

  test('fills the new text area with the original comment when user clicks edit', () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'edit me' }];
    const { getByText, getAllByLabelText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const commentElements = getAllByLabelText("User comment");

    mockPost.comments.forEach(async (comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { getByLabelText, getByText } = within(commentElements[index]);
        fireEvent.click(getByLabelText('Open menu'));
        fireEvent.click(getByText('Edit'));

        const input = getByLabelText('Edit Comment Input');
        expect(input).toHaveValue('edit me');
      }
    });
  });

  test('handles comment edit', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'old comment' }];
    const { getByText, getAllByLabelText, findByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const commentElements = getAllByLabelText("User comment");

    mockPost.comments.forEach(async (comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { getByLabelText, getByText } = within(commentElements[index]);
        fireEvent.click(getByLabelText('Open menu'));
        fireEvent.click(getByText('Edit'));

        const input = getByLabelText('Edit Comment Input');

        userEvent.clear(input);
        await userEvent.type(input, 'This is an edited comment');

        fireEvent.click(getByText('Submit'));
      }
    });

    expect(await findByText('This is an edited comment')).toBeInTheDocument();
  });

  test('handles comment delete', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'delete me' }];
    const { getByText, getAllByLabelText, queryByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const commentElements = getAllByLabelText("User comment");

    mockPost.comments.forEach(async (comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { getByLabelText, getByText } = within(commentElements[index]);
        fireEvent.click(getByLabelText('Open menu'));
        fireEvent.click(getByText('Delete'));
      }
    });

    await waitFor(() => expect(queryByText('delete me')).not.toBeInTheDocument());
  });

  test('handles cancelling comment edit', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'cancel me' }];
    const { getByText, getAllByLabelText, queryByText, findByText } = render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);
    // expand post
    fireEvent.click(getByText(mockPost.title));

    const commentElements = getAllByLabelText("User comment");

    mockPost.comments.forEach(async (comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { getByLabelText, getByText } = within(commentElements[index]);
        fireEvent.click(getByLabelText('Open menu'));
        fireEvent.click(getByText('Edit'));

        const input = getByLabelText('Edit Comment Input');

        userEvent.clear(input);
        await userEvent.type(input, 'This should be cancelled');

        fireEvent.click(getByText('Cancel'));
      }
    });

    expect(queryByText('This should be cancelled')).not.toBeInTheDocument();
    expect(await findByText('cancel me')).toBeInTheDocument();
  });
})