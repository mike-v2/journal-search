import 'whatwg-fetch'
import { server } from "@/mocks/server";
import { SessionProvider } from "next-auth/react";
import { User } from "next-auth";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostBox from "../components/postBox";
import PostExt from "@/types/postExt";
import CommentExt from "@/types/commentExt";
import { mockDeleteComment } from '@/mocks/handlers';

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

/* describe("PostBox rendering", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("renders without crashing", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
  });

  test("renders journal entry text", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByText(mockPost.journalEntry.content)).toBeInTheDocument();
  })

  test("displays user's avatar correctly", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByAltText(`${mockPost.createdBy.name}'s avatar`)).toBeInTheDocument();
    expect(screen.getByAltText(`${mockPost.createdBy.name}'s avatar`)).toHaveAttribute('src', expect.stringMatching(/via\.placeholder/));
  });

  test("displays creator's name correctly", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByText(mockPost.createdBy.name as string)).toBeInTheDocument();
  });

  test("displays post text correctly", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByText(mockPost.text)).toBeInTheDocument();
  });

  test("renders comment input field and button iff session user exists", () => {
    render(<SessionProvider session={undefined}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument();
    expect(screen.queryByText('Comment')).not.toBeInTheDocument();

    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();

  });

  test("renders all comments correctly", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    for (const comment of mockPost.comments) {
      expect(screen.getByText(comment.text)).toBeInTheDocument();
      expect(screen.getByText(comment.user.name as string)).toBeInTheDocument();
    }
  });

  test("shows edit and delete buttons iff comment's userId matches the session user's ID", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    const commentElements = screen.getAllByLabelText("User comment");
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
}); */

describe("PostBox interaction", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('handles new comment submission', async () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    const input = screen.getByLabelText('Comment Input');
    userEvent.type(input, 'This is a new comment');

    fireEvent.click(screen.getByText('Comment'));

    expect(await screen.findByText('This is a new comment')).toBeInTheDocument();
  });

  test('handles comment edit', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'old comment' }];
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);

    const commentElements = screen.getAllByLabelText("User comment");

    mockPost.comments.forEach((comment, index) => {
      if (comment.userId === mockSession.user.id) {
        const { getByLabelText, getByText } = within(commentElements[index]);
        //fireEvent.click(getByLabelText('User comment'));
        fireEvent.click(getByText('Edit'));
      }
    });

    const input = await screen.findByLabelText('Edit Comment Input');
    userEvent.type(input, 'This is an edited comment');

    fireEvent.click(screen.getByText('Submit'));

    expect(await screen.findByText('This is an edited comment')).toBeInTheDocument();
  });

  test('handles comment delete', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'delete me' }];
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);

    fireEvent.click(screen.getByAltText('menu icon'));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(screen.queryByText('delete me')).not.toBeInTheDocument());
  });

  test('calls handleDeleteComment with correct comment', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'delete me' }];
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);

    fireEvent.click(screen.getByAltText('menu icon'));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('delete me')).not.toBeInTheDocument();
      expect(mockDeleteComment).toHaveBeenCalledTimes(1);
      expect(mockDeleteComment).toHaveBeenCalledWith(expect.objectContaining({ url: new URL('/api/comment?commentId=comment-id', window.location.origin) }));
    });
  });

  test('resets comment editing state', async () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'cancel me' }];
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);

    fireEvent.click(screen.getByAltText('menu icon'));
    fireEvent.click(screen.getByText('Edit'));

    const input = screen.getByLabelText('Edit Comment Input');
    userEvent.type(input, 'This should be cancelled');

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.findByText('This should be cancelled')).not.toBeInTheDocument();
    expect(screen.getByText('cancel me')).toBeInTheDocument();
   });

  test('displays the original comment text in the edit comment input', () => {
    const specialComments = [{ id: 'comment-id', userId: mockSession.user.id, postId: '123', createdAt: new Date(2023, 0, 2), text: 'edit me' }];
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} comments={specialComments} /></SessionProvider>);

    fireEvent.click(screen.getByAltText('menu icon'));
    fireEvent.click(screen.getByText('Edit'));

    const input = screen.getByLabelText('Edit Comment Input');
    expect(input).toHaveValue('edit me');
  });
})