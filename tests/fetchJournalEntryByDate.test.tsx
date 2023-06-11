import 'whatwg-fetch'
import { server } from "@/mocks/server";
import fetchJournalEntryByDate from "@/utils/fetchJournalEntryByDate";

const mockResponse = {
    id: 'clhe121xl002m7a0csw71dnfd',
    date: '1948-06-24T00:00:00.000Z',
    content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
    startPage: '104',
    endPage: '104',
};

describe("fetchJournalEntryByDate", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('fetchJournalEntryByDate returns correct data', async () => {
        const data = await fetchJournalEntryByDate('06-24-1948');
        expect(data).toEqual(mockResponse);
    })

    test('fetchJournalEntryByDate fails to return entry for missing date', async () => {
        const data = await fetchJournalEntryByDate('06-25-2023');
        expect(data).toBeUndefined();
    });
})