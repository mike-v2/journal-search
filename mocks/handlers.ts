import { journalDateToISOString } from '@/utils/convertDate';
import { rest } from 'msw';

export const fetchJournalEntryByDate = rest.get('/api/journalEntry', (req, res, ctx) => {
    const queryDate = req.url.searchParams.get('date');
    /* console.log('mock handler called with date = ', queryDate); */
    const dateISO = journalDateToISOString('06-24-1948');

    if (queryDate === dateISO) {
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
    }
    return res(
        ctx.status(404),
        ctx.json({ message: 'No journal entry found for this date' })
    )
})

export const handlers = [fetchJournalEntryByDate]
