import { AnalysisEntry } from "./analysisEntryType";

interface SearchResultProps extends AnalysisEntry {
  handleSelectResult: (data: AnalysisEntry) => void;
}

export default function SearchResult(props: SearchResultProps) {
//don't destructure props so that it 
  const handleOnClick = (e: React.FormEvent<HTMLDivElement>) => {
    props.handleSelectResult(props);
  }

  return (
    <div className="border border-black m-3 p-3" onClick={handleOnClick}>
      <div>
        {props.date}
      </div>
      <div>
        {props.topic}
      </div>
      <div>
        {props.summary}
      </div>
    </div>
  )
}