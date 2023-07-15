import { journalDateToISOString } from '@/utils/convertDate';
import { rest } from 'msw';

export const fetchJournalEntryByDate = rest.get('/api/journalEntry', (req, res, ctx) => {
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

export const fetchJournalEntryImage = rest.get('/api/journalEntryImage', (req, res, ctx) => {
    const year = req.url.searchParams.get('year');
    const startPage = req.url.searchParams.get('startPage');
    const endPage = req.url.searchParams.get('endPage');

    return res(
        ctx.status(200),
        ctx.json(['https://www.imageurl.com', 'https://www.imageurl2.com'])
    )
});

export const fetchJournalTopics = rest.get('/api/journalTopic', (req, res, ctx) => {
    const queryEntryId = req.url.searchParams.get('journalEntryId');
    const queryTopicId = req.url.searchParams.get('topicId');

    if (queryEntryId) {
        //console.log('mock fetchTopics called with journalId = ', queryEntryId);
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
        //console.log('mock fetchTopics called with topicId = ', queryTopicId);
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
        //console.log('mock fetchTopics called with no params');
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

export const fetchRead = rest.get('/api/readEntry', (req, res, ctx) => {
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

export const fetchStarred = rest.get('/api/starredEntry', (req, res, ctx) => {
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

export const post = rest.post('/api/post', (req, res, ctx) => {
    const queryDate = req.url.searchParams.get('date');
    //console.log('mock journal entry handler called with date = ', queryDate);
    const dateISO = journalDateToISOString('06-24-1948');

    return res(
        ctx.status(200),
        ctx.json({ message: "success" })
    )
});

/* export const post = rest.get('/api/post', (req, res, ctx) => {
    const queryDate = req.url.searchParams.get('date');
    //console.log('mock journal entry handler called with date = ', queryDate);
    const dateISO = journalDateToISOString('06-24-1948');

    return res(
        ctx.status(200),
        ctx.json([
            {
                journalEntry: true,
                createdBy: true,
                text: true,
                comments: {
                    include: {
                        user: true,
                        post: true,
                    }
                },
                id: true,
            },
            {
                journalEntry: true,
                createdBy: true,
                text: true,
                comments: {
                    include: {
                        user: true,
                        post: true,
                    }
                },
                id: true,
            }
        ])
    )
}); */

export const fetchSearch = rest.post('/api/fetchSearch', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ results: 'Date:2023-07-14; Text:first5'.repeat(5) + 'Date:2023-07-14; Text:second5'.repeat(5) })
  )
});

export const handlers = [fetchJournalEntryByDate, fetchJournalEntryImage, fetchJournalTopics, fetchRead, fetchStarred, post, fetchSearch]
