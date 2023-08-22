import OpenAI from 'openai';
/* import tiktoken from 'tiktoken-node'; */
import { Storage } from '@google-cloud/storage';
import Papa from 'papaparse';
import { OpenAIStream, StreamingTextResponse } from 'ai';

/* export const runtime = 'edge' */
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  fetch: globalThis.fetch,
});

const base64Key = process.env.GCLOUD_KEYFILE_CONTENTS_BASE64;
const jsonString = Buffer.from(base64Key as string, 'base64').toString();
const gCloudCredentials = JSON.parse(jsonString);

const queryModel = 'gpt-3.5-turbo'
const queryModelTemperature = .2

const responseModel = 'gpt-3.5-turbo';
const responseModelTemperature = .2;
const responseModelContextLength = 4000;

const searchResultsMaxTokens = 1200;
const maxChatHistoryTokens = 600;

type EmbeddingEntry = {
  date: string;
  text: string;
  combined: string;
  n_tokens: number;
  embedding: string | number[];
  similarity: number;
}

export async function POST(req: Request) {
  const { chatHistory } = await req.json();
  console.log("received chat history: ", chatHistory);

  function dot(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must be of the same dimension");
    }

    let result = 0;
    for (let i = 0; i < vecA.length; i++) {
      result += vecA[i] * vecB[i];
    }

    return result;
  }

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
      return pruneEnd ? str.substring(0, newLength) : str.substring(str.length - newLength);
    }
  }

  // embedding vectors are normalized. just use dot product
  /* function cosineSimilarity(a: [], b: []) {
    let dotProduct = dot(a, b);
    let magnitudeA = Math.sqrt(dot(a, a));
    let magnitudeB = Math.sqrt(dot(b, b));

    return dotProduct / (magnitudeA * magnitudeB);
  } */

  async function downloadBlob(bucketName: string, sourceBlobName: string) {
    console.debug("Starting blob download");

    const storage = new Storage({ credentials: gCloudCredentials });
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(sourceBlobName);

    const exists = await blob.exists();
    if (!exists[0]) {
      console.debug(`Blob ${sourceBlobName} does not exist.`);
      return null;
    }

    const [data] = await blob.download();

    return data.toString('utf-8');
  }

  async function downloadEmbeddings() {
    const csvData = await downloadBlob("journal_entries_harry_howard", "journal-entries-with-embeddings.csv");
    if (csvData) {
      const parsedData = Papa.parse(csvData, { header: true, dynamicTyping: true });
      let entries: EmbeddingEntry[] = parsedData.data as EmbeddingEntry[];
      entries = entries.filter(entry => entry.embedding !== null && entry.embedding !== undefined)

      // Convert string embeddings to actual arrays
      for (const entry of entries) {
        if (!entry.embedding) continue;
        entry.embedding = JSON.parse(entry.embedding as string);
      }

      return entries;
    }
    return [];
  }

  async function findEntriesRelatedToMessage(query: string, n = 20, similarityThreshold = 0) {
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    for (const entry of embeddings) {
      entry.similarity = dot(entry.embedding as number[], queryEmbedding.data[0].embedding as number[]);
    }

    // Filter and sort the entries based on similarity
    let results;
    if (similarityThreshold > 0) {
      results = embeddings.filter(entry => entry.similarity >= similarityThreshold)
        .sort((a, b) => b.similarity - a.similarity);
    } else {
      results = embeddings.sort((a, b) => b.similarity - a.similarity).slice(0, n);
    }

    const resultsCombined = results.map(entry => entry.combined).join('');

    return resultsCombined;
  }

  const embeddings = await downloadEmbeddings();
  console.log(`downloaded ${embeddings.length} embeddings. first entry date: ${embeddings[0].date}`);

  try {
    let condensedHistory = ''
    for (const msg of chatHistory) {
      if (msg.role == "user") {
        condensedHistory += "Guest: " + msg["content"] + ' '
      } else if (msg.role == "assistant") {
        condensedHistory += "Harry Howard: " + msg["content"] + ' '
      }
    }
    condensedHistory = pruneString(condensedHistory, maxChatHistoryTokens, false)
    // use chatGPT to convert user's message into a search query that considers context
    const querySystemMsg = "You are part of a website that is centered around the personal journals of Harry Howard. Generate a search query for the Guest's most recent message that will be used to find relevant information from Harry's journal entries. Embeddings have been generated for each journal entry, and the query you generate will be turned into an embedding and compared to each journal entry to find the most similar. Try to generate a search query that will return the most relevant journal entries for Guest's most recent message. Please don't add any explanation, just generate a short but contextual search query, as your output will be fed directly into the next step without any modifications."
    const fullResponse = await openai.chat.completions.create({
      model: queryModel,
      messages: [
        { "role": "system", "content": querySystemMsg },
        { "role": "user", "content": condensedHistory },
      ],
      temperature: queryModelTemperature,
    });
    const response: string = fullResponse["choices"][0]["message"]["content"] as string;
    const queryResponseTokenCount = getTokenCount(response);
    console.log("received contextual query from OpenAI: " + response);

    let searchResults = await findEntriesRelatedToMessage(response);
    searchResults = pruneString(searchResults, searchResultsMaxTokens);
    console.log('journal search results length: ' + searchResults.length);

    const systemMsgStub = "You are part of a website centered around the personal journals of Harry Howard (1899-1959), a post-office employee, a member of the LDS church, a husband to Grace (sometimes referred to as 'Mama') and a father to seven children: (in order from youngest to oldest) Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty. You will be playing the role of Harry Howard. Users will interact with you and you will be provided with journal entries that are the most relevant to the user's message. You should respond in the style of Harry Howard and your responses should only reflect the contents of the journal entries provided. Don't improvise, make things up, or reference things that aren't explicitly mentioned in the entries, as users will expect authenticity above all else. If there isn't enough relevant information in the provided entries, just say you're having a hard time remembering or that you don't know. Please feel free to cite specific people, events, and dates from the journal entries. It is very important that you mention specific journal entry dates as often as possible so that users can go look up more information. Here are the most relevant journal entries:";
    const responseSystemMsg = systemMsgStub + searchResults;

    const systemMsgStubTokens = getTokenCount(systemMsgStub);
    let msgHistoryTokenCount = responseModelContextLength - searchResultsMaxTokens - queryResponseTokenCount - systemMsgStubTokens
    if (msgHistoryTokenCount > maxChatHistoryTokens) msgHistoryTokenCount = maxChatHistoryTokens;

    let remainingTokens = msgHistoryTokenCount;
    let messages = []
    // loop backwards to get most recent messages first, then reverse the list after finishing
    for (const msg of chatHistory.reverse()) {
      const tokenCount = getTokenCount(msg.content)
      if (tokenCount > remainingTokens) break;
      else {
        remainingTokens -= tokenCount
        messages.push(msg)
      }
    }
    messages.push({ "role": "system", "content": responseSystemMsg }) // add system msg before reversing so it's first
    messages = messages.reverse();
    console.log("message history length (including system message): " + messages.length);

    const stream = await openai.chat.completions.create({
      model: responseModel,
      messages: messages,
      temperature: responseModelTemperature,
      stream: true,
    });

    const responseStream = OpenAIStream(stream);
    return new StreamingTextResponse(responseStream);
  } catch (error) {
    console.error('An error occurred during OpenAI request', error);
  }
}