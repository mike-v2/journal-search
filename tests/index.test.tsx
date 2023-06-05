import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

const exampleTopics = [
    {
        header: "Grace Howard",
    },
    {
        header: "Ardie Howard",
    },
    {
        header: "Charles, Sonny, and Sharon Howard",
    },
];

describe('Home', () => {
    test("renders Home component without crashing", () => {
        render(<Home />);
    });

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
});
