import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { deepseek } from '@/config/deepseek';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pc.index({
  name: process.env.PINECONE_INDEX as string,
  host: process.env.PINECONE_HOST as string,
});

const queryModel = 'deepseek-chat';
const queryModelTemperature = 0.7;

const responseModel = 'deepseek-chat';
const responseModelTemperature = 0.7;
const responseModelContextLength = 8000;

const searchResultsMaxTokens = 1200;
const maxChatHistoryTokens = 600;

export async function POST(req: Request) {
  const { chatHistory } = await req.json();
  console.log('received chat history: ', chatHistory);

  function getTokenCount(str: string) {
    /* const enc = tiktoken.encodingForModel(responseModel);
    return enc.encode(str).length; */
    const words = str.split(' ');
    return words.length * 1.5; // roughly 75 words per 100 tokens. Give overestimate to be safe
  }

  function pruneString(str: string, maxTokens: number, pruneEnd = true) {
    const numTokens = getTokenCount(str);

    if (numTokens < maxTokens) {
      return str;
    } else {
      const ratio = maxTokens / numTokens;
      const newLength = Math.floor(str.length * ratio);
      return pruneEnd
        ? str.substring(0, newLength)
        : str.substring(str.length - newLength);
    }
  }

  async function findEntriesRelatedToMessage(query: string, n = 10) {
    const queryResponse = await index.searchRecords({
      query: {
        topK: n,
        inputs: { text: query },
      },
    });

    const resultsCombined = queryResponse.result.hits
      .map((hit) => {
        const metadata = hit.fields as { date: string; text: string };
        return `${metadata.date}: ${metadata.text}\n\n`;
      })
      .join('');

    return resultsCombined;
  }

  try {
    let condensedHistory = '';
    for (const msg of chatHistory) {
      if (msg.role == 'user') {
        condensedHistory += 'Guest: ' + msg['content'] + ' ';
      } else if (msg.role == 'assistant') {
        condensedHistory += 'Harry Howard: ' + msg['content'] + ' ';
      }
    }
    condensedHistory = pruneString(
      condensedHistory,
      maxChatHistoryTokens,
      false,
    );
    // use chatGPT to convert user's message into a search query that considers context
    const querySystemMsg =
      "You are part of a website that is centered around the personal journals of Harry Howard. Generate a search query for the Guest's most recent message that will be used to find relevant information from Harry's journal entries. Embeddings have been generated for each journal entry, and the query you generate will be turned into an embedding and compared to each journal entry to find the most similar. Try to generate a search query that will return the most relevant journal entries for Guest's most recent message. Please don't add any explanation, just generate a short but contextual search query, as your output will be fed directly into the next step without any modifications.";
    const fullResponse = await deepseek.chat.completions.create({
      model: queryModel,
      messages: [
        { role: 'system', content: querySystemMsg },
        { role: 'user', content: condensedHistory },
      ],
      temperature: queryModelTemperature,
    });
    const response: string = fullResponse['choices'][0]['message'][
      'content'
    ] as string;
    const queryResponseTokenCount = getTokenCount(response);
    console.log('contextual query: ' + response);

    let searchResults = await findEntriesRelatedToMessage(response);
    searchResults = pruneString(searchResults, searchResultsMaxTokens);
    console.log('journal search results length: ' + searchResults.length);

    const systemMsgStub =
      "You are part of a website centered around the personal journals of Harry Howard (1899-1959), a post-office employee, a member of the LDS church, a husband to Grace (sometimes referred to as 'Mama') and a father to seven children: (in order from youngest to oldest) Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty. You will be playing the role of Harry Howard. Users will interact with you and you will be provided with journal entries that are the most relevant to the user's message. You should respond in the style of Harry Howard and your responses should only reflect the contents of the journal entries provided. Don't improvise, make things up, or reference things that aren't explicitly mentioned in the entries, as users will expect authenticity above all else. If there isn't enough relevant information in the provided entries, just say you're having a hard time remembering or that you don't know. Please feel free to cite specific people, events, and dates from the journal entries. It is very important that you mention specific journal entry dates as often as possible so that users can go look up more information. Here are the most relevant journal entries:";
    const responseSystemMsg = systemMsgStub + searchResults;

    const systemMsgStubTokens = getTokenCount(systemMsgStub);
    let msgHistoryTokenCount =
      responseModelContextLength -
      searchResultsMaxTokens -
      queryResponseTokenCount -
      systemMsgStubTokens;
    if (msgHistoryTokenCount > maxChatHistoryTokens)
      msgHistoryTokenCount = maxChatHistoryTokens;

    let remainingTokens = msgHistoryTokenCount;
    let messages = [];
    // loop backwards to get most recent messages first, then reverse the list after finishing
    for (const msg of chatHistory.reverse()) {
      const tokenCount = getTokenCount(msg.content);
      if (tokenCount > remainingTokens) break;
      else {
        remainingTokens -= tokenCount;
        messages.push(msg);
      }
    }
    messages.push({ role: 'system', content: responseSystemMsg }); // add system msg before reversing so it's first
    messages = messages.reverse();
    console.log(
      'message history length (including system message): ' + messages.length,
    );

    const stream = await deepseek.chat.completions.create({
      model: responseModel,
      messages: messages,
      temperature: responseModelTemperature,
      stream: true,
    });

    const responseStream = OpenAIStream(stream);
    return new StreamingTextResponse(responseStream);
  } catch (error) {
    console.error('An error occurred during LLM request', error);
  }
}
