import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Home from '../pages/index';
import { JournalEntry } from '@prisma/client';
import { journalDateToISOString } from '@/utils/convertDate';
import { rest } from 'msw';
import { handlers } from '../mocks/handlers';
import 'whatwg-fetch'
import { server } from '@/mocks/server';
import fetchJournalEntryByDate from '@/utils/fetchJournalEntryByDate';
import { SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';

const exampleTopics = [
    {
        header: 'Grace Howard',
        entryDate: '06-24-1948',
        imagePath: '/images/Harry-Grace-1.png',
        sampleText: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry",
    },
    {
        header: 'Ardie Howard',
        entryDate: '06-05-1948',
        imagePath: '/images/Ardie-1.png',
        sampleText: "Ardie and her two kiddies left last night and are now in San Francisco",
    },
    {
        header: 'Charles, Sonny, and Sharon Howard',
        entryDate: '03-04-1948',
        imagePath: '/images/Grace-Sharon-Sonny-Charles.png',
        sampleText: "Today my mother turned 65. She was born March 4th 1883 at Clarkston, Utah",
    }
];

const mockResponse = {
    id: 'clhe121xl002m7a0csw71dnfd',
    date: '1948-06-24T00:00:00.000Z',
    content: "Painting, cleaning, remodeling, etc. has interfered with recordings in the old Journal, but I can't let this important anniversary day pass without an entry. it was 19 years ago today that I took my wife and three children to the temple. Grace and I received our endowments and she was sealed to me for time and eternity and her children were seal To us by the same authority, to endure throughout all the ages of time.",
    startPage: '104',
    endPage: '104',
};

describe('Home', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    /* test("renders Home component without crashing", async () => {
        render(<Home />);

        await waitFor(() => screen.getByText(/Welcome to/i));
    }); */

    test("renders header with correct text", async () => {
        render(
            <Home />
        );

        await waitFor(() => expect(screen.getByText(/Welcome to the Harry Howard Journals:/i)).toBeInTheDocument());
    });

    test('fetchJournalEntryByDate returns correct data', async () => {
        // Invoke the function with the date that should return a valid response
        const data = await fetchJournalEntryByDate('06-24-1948')
        // assert on the response
        expect(data).toEqual(mockResponse)

        // Invoke the function with a date that should return a 404
        const data2 = await fetchJournalEntryByDate('06-25-2023')
        // assert on the response
        expect(data2).toBeUndefined()
    })


    test("renders image for Harry Howard", () => {
        render(<Home />);
        const image = screen.getByAltText("picture of Harry Howard");
        expect(image).toBeInTheDocument();
    });

    test("renders header with correct text", () => {
        render(<Home />);
        const header = screen.getByText(/Welcome to the Harry Howard Journals:/i);
        expect(header).toBeInTheDocument();
    });

    test("renders subheader with correct text", () => {
        render(<Home />);
        const subheader = screen.getByText(/A Glimpse into the 1930s Life of a Salt Lake City Family Man/i);
        expect(subheader).toBeInTheDocument();
    });

    test("renders body text correctly", () => {
        render(<Home />);
        const bodyText = screen.getByText(/Discover the fascinating world of Harry Howard/i);
        expect(bodyText).toBeInTheDocument();
    });

    test("renders an 'Image' component for each item in exampleTopics", () => {
        render(<Home />);

        exampleTopics.forEach((topic) => {
            const image = screen.getByAltText(`picture of ${topic.header}`);
            expect(image).toBeInTheDocument();
        });
    });

    /* test('renders JournalEntryBox with correct props', async () => {
        render(<Home />);

        exampleTopics.forEach((topic) => {
            expect(screen.getByText(topic.sampleText)).toBeInTheDocument();
        })
    }); */
});
