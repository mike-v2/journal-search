import { useEffect, useState } from "react";
import { Topic } from "./topicType";
import { makeDatePretty } from "@/utils/convertDate";


interface TopicBoxProps extends Topic {
  handleSelectResult: (data: Topic) => void;
  isSelected: boolean;
}

export default function JournalTopicBox(props: TopicBoxProps) {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const date = makeDatePretty(props.date);
    setDate(date);

    //console.log("isSelected = " + props.isSelected);
  }, [props])

  const handleOnClick = (e: React.FormEvent<HTMLDivElement>) => {
    props.handleSelectResult(props);
  }

  return (
    <div className={"border border-slate-400 m-3 p-3 hover:cursor-pointer" + (props.isSelected ? ' border-4 bg-slate-700' : '')} onClick={handleOnClick}>
      <div className="italic">
        {date}
      </div>
      <div className="text-lg font-bold py-3">
        {props.topic}
      </div>
      <div className="pl-2">
        {props.summary}
      </div>
    </div>
  )
}