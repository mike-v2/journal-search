import 'whatwg-fetch'
import { server } from "@/mocks/server";
import { SessionProvider } from "next-auth/react";
import { User } from "next-auth";
import { render, screen, within } from "@testing-library/react";
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

describe("PostBox", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("renders without crashing", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);
  });

  test("displays user's avatar correctly", () => {
    render(<SessionProvider session={mockSession}><PostBox {...mockPost} /></SessionProvider>);

    expect(screen.getByAltText(`${mockPost.createdBy.name}'s avatar`)).toBeInTheDocument();
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

    mockPost.comments.forEach(async (comment) => {
      expect(await screen.findByText(comment.text)).toBeInTheDocument();
      expect(await screen.findByText(comment.user.name as string)).toBeInTheDocument();
    });
  });

  test("shows edit and delete buttons only if comment's userId matches the session user's ID", () => {
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
});
