import { rest } from 'msw';

export const mockGetJournalEntryByDate = rest.get('/api/journalEntry', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json(
      {
        id: 'clhe121xl002m7a0csw71dnfd',
        date: new Date('1948-06-24T00:00:00.000Z'),
        content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
        startPage: '104',
        endPage: '104',
      },
    )
  )
});

export const mockGetJournalEntryImage = rest.get('/api/journalEntryImage', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json(['https://via.placeholder.com/150', 'https://via.placeholder.com/200'])
  )
});

export const mockGetJournalTopics = rest.get('/api/journalTopic', (req, res, ctx) => {
  const queryEntryId = req.url.searchParams.get('journalEntryId');
  const queryTopicId = req.url.searchParams.get('topicId');

  if (queryEntryId) {
    return res(
      ctx.status(200),
      ctx.json(
        {
          id: '123',
          journalEntryId: '123',
          name: '123',
          summary: '123',
          people: [],
          places: [],
          organizations: [],
          things: [],
          emotion: 'happy',
          mood: '123',
          strength: 0,
        },
      )
    );
  } else if (queryTopicId) {
    return res(
      ctx.status(200),
      ctx.json(
        {
          id: '123',
          journalEntryId: '123',
          name: '123',
          summary: '123',
          people: [],
          places: [],
          organizations: [],
          things: [],
          emotion: 'happy',
          mood: '123',
          strength: 0,
        },
      )
    );
  } else {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '123',
          journalEntryId: '123',
          name: '123',
          summary: '123',
          people: [],
          places: [],
          organizations: [],
          things: [],
          emotion: 'happy',
          mood: '123',
          strength: 0,
        },
        {
          id: '123',
          journalEntryId: '123',
          name: '123',
          summary: '123',
          people: [],
          places: [],
          organizations: [],
          things: [],
          emotion: 'happy',
          mood: '123',
          strength: 0,
        },
      ])
    );
  }
});

export const mockGetReadEntry = rest.get('/api/readEntry', (req, res, ctx) => {
  const userId = req.url.searchParams.get('userId');
  const journalEntryId = req.url.searchParams.get('journalEntryId');

  if (journalEntryId && userId) {
    return res(
      ctx.status(200),
      ctx.json(
        {
          currentIsRead: false,
        },
      )
    )
  } else if (userId) {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'clhe121xl002m7a0csw71dnfd',
          date: new Date('1948-06-24T00:00:00.000Z'),
          content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
          startPage: '104',
          endPage: '104',
        },
        {
          id: 'clhe121xl002m7a0csw71dnfd',
          date: new Date('1948-06-24T00:00:00.000Z'),
          content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
          startPage: '104',
          endPage: '104',
        },
      ])
    )
  } else {
    return res(
      ctx.status(404),
      ctx.json({ message: 'Could not find read entry data' })
    );
  }
});

export const mockGetStarredEntry = rest.get('/api/starredEntry', (req, res, ctx) => {
  const userId = req.url.searchParams.get('userId');
  const journalEntryId = req.url.searchParams.get('journalEntryId');

  if (journalEntryId && userId) {
    return res(
      ctx.status(200),
      ctx.json(
        {
          currentIsStarred: false,
        },
      )
    )
  } else if (userId) {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'clhe121xl002m7a0csw71dnfd',
          date: new Date('1948-06-24T00:00:00.000Z'),
          content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
          startPage: '104',
          endPage: '104',
        },
        {
          id: 'clhe121xl002m7a0csw71dnfd',
          date: new Date('1948-06-24T00:00:00.000Z'),
          content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
          startPage: '104',
          endPage: '104',
        },
      ])
    )
  } else {
    return res(
      ctx.status(404),
      ctx.json({ message: 'Could not find starred entry data' })
    );
  }
});

export const mockPostCommunityPost = rest.post('/api/post', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ message: "success" })
  )
});

export const mockPostComment = rest.post('/api/comment', async (req, res, ctx) => {
  const { userId, postId, text } = await req.json();

  return res(
    ctx.status(200),
    ctx.json({ userId, postId, text })
  )
});

export const mockDeleteComment = rest.delete('/api/comment', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ message: "success" })
  )
});

export const mockPostSearch = rest.post('/api/fetchSearch', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ results: 'Date:2023-07-14; Text:first5'.repeat(5) + 'Date:2023-07-14; Text:second5'.repeat(5) })
  )
});

export const mockPostAuthSession = rest.get('/api/auth/session', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ message: 'success' })
  )
});

export const mockPostAuthLog = rest.post('/api/auth/_log', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ message: 'success' })
  )
});



export const handlers = [mockGetJournalEntryByDate, mockGetJournalEntryImage, mockGetJournalTopics, mockGetReadEntry, mockGetStarredEntry, mockPostSearch, mockPostComment, mockDeleteComment, mockPostAuthSession, mockPostAuthLog, mockPostCommunityPost]
