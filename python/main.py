from io import StringIO
import os
import time

from flask import Flask, jsonify, request
import numpy as np
import os
import pandas as pd
import tiktoken
from openai.embeddings_utils import get_embedding, cosine_similarity
import openai
from google.cloud import storage
import logging

app = Flask(__name__)
openai.api_key = os.environ['OPENAI_API_KEY']

def download_blob(bucket_name, source_blob_name):
    app.logger.setLevel(logging.DEBUG) 
    
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)

    if not blob.exists():
        app.logger.debug('Blob %s does not exist.', source_blob_name)
        return None
    
    start_time = time.time()
    data = blob.download_as_text()
    end_time = time.time()
    app.logger.debug('Time taken to download blob %s: %s seconds', source_blob_name, str(end_time - start_time))

    return data
    #blob.download_to_filename(destination_file_name)
    #print(f"Blob {source_blob_name} downloaded to {destination_file_name}.")

# Download embeddings into memory instead of file storage to save time. Google Cloud Run allows 512 MiB memory, with 1947 and 1948 the file is 9.6 MB
#download_blob("journal_entries_harry_howard", "journal-entries-with-embeddings.csv", "/tmp/journal-entries-with-embeddings.csv")
#datafile_path = "/tmp/journal-entries-with-embeddings.csv"
#df = pd.read_csv(datafile_path)

csv_data = download_blob("journal_entries_harry_howard", "journal-entries-with-embeddings.csv")
if csv_data is not None:
    df = pd.read_csv(StringIO(csv_data))

df["embedding"] = df.embedding.apply(eval).apply(np.array)

def get_token_count(string):
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    return len(encoding.encode(string))

def prune_string(string, max_tokens, prune_end=True):
    num_tokens = get_token_count(string)
    if num_tokens < max_tokens:
        return string
    else:
        ratio = max_tokens / num_tokens
        new_length = int(len(string) * ratio)
        return string[:new_length] if prune_end else string[(len(string) - new_length):]
    
def find_entries_related_to_message(query, n=20, similarity_threshold=0):
    app.logger.setLevel(logging.DEBUG) 
    start_time = time.time()

    query_embedding = get_embedding(
        query,
        engine="text-embedding-ada-002"
    )
    df["similarity"] = df.embedding.apply(lambda x: cosine_similarity(x, query_embedding))

    if similarity_threshold > 0:
      results = df[df["similarity"] >= similarity_threshold].sort_values("similarity", ascending=False)
    else:
      results = df.sort_values("similarity", ascending=False).head(n)

    results = results.combined   #results = results.combined.str.replace("Date: ", "").str.replace("; Text:", ": ")
    
    results_combined = ''
    for r in results:
        results_combined += r

    end_time = time.time()
    app.logger.debug('Time taken to compare embeddings: %s seconds', str(end_time - start_time))

    return results_combined

@app.route('/', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    threshold = data.get('threshold')
    results = find_entries_related_to_message(query, similarity_threshold=threshold)

    return jsonify(results)

@app.route('/chat', methods=['POST'])
def chat():
    app.logger.setLevel(logging.DEBUG) 

    response_model_name = 'gpt-3.5-turbo'
    response_model_context_length = 4000
    response_model_temperature = .2

    query_model_name = 'gpt-3.5-turbo'
    query_model_temperature = .2
    
    search_results_max_tokens = 1200
    max_response_tokens = 250
    max_msg_history_tokens = 600
    #expected_response_length_tokens = 500

    data = request.get_json()
    msg_history = data.get('msgHistory')
    app.logger.debug('message history: %s', msg_history)

    condensed_history = ''
    for msg in msg_history:
        if msg["role"] == "user":
            condensed_history += "Guest: " + msg["content"] + ' '
        elif msg["role"] == "assistant":
            condensed_history += "Harry Howard: " + msg["content"] + ' '
            
    condensed_history = prune_string(condensed_history, max_msg_history_tokens, prune_end=False)
    #use chatGPT to convert user's message into a search query that considers context
    system_msg = "You are part of a website that is centered around the personal journals of Harry Howard. Generate a search query for the Guest's most recent message that will be used to find relevant information from Harry's journal entries. Embeddings have been generated for each journal entry, and the query you generate will be turned into an embedding and compared to each journal entry to find the most similar. Try to generate a search query that will return the most relevant journal entries for Person 1's most recent message. Please don't add any explanation, just generate a short but contextual search query, as your output will be fed directly into the next step without any modifications."
    start_time = time.time()
    full_response = openai.ChatCompletion.create(
        model=query_model_name,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": condensed_history},
        ],
        temperature=query_model_temperature,
        max_tokens=max_response_tokens
    )
    end_time = time.time()
    app.logger.debug('Time taken for OpenAI to create contextual prompt: %s seconds', str(end_time - start_time))

    response = full_response["choices"][0]["message"]["content"]
    app.logger.debug('search query: %s', response)

    search_results = find_entries_related_to_message(response)
    search_results = prune_string(search_results, search_results_max_tokens)
    app.logger.debug('search results token count after pruning: %s', get_token_count(search_results))

    system_msg_stub = "You are part of a website centered around the personal journals of Harry Howard (1899-1959), a post-office employee, a member of the LDS church, a husband to Grace (sometimes referred to as 'Mama') and a father to seven children: (in order from youngest to oldest) Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty. You will be playing the role of Harry Howard. Users will interact with you and you will be provided with journal entries that are the most relevant to the user's message. You should respond in the style of Harry Howard and your responses should only reflect the contents of the journal entries provided. Don't improvise, make things up, or reference things that aren't explicitly mentioned in the entries, as users will expect authenticity above all else. If there isn't enough relevant information in the provided entries, just say you're having a hard time remembering or that you don't know. Please feel free to cite specific people, events, and dates from the journal entries. It is very important that you mention specific journal entry dates as often as possible so that users can go look up more information. Here are the most relevant journal entries:"
    system_msg = system_msg_stub + search_results
    
    system_msg_stub_tokens = get_token_count(system_msg_stub)
    msg_history_token_count = response_model_context_length - search_results_max_tokens - max_response_tokens - system_msg_stub_tokens
    if msg_history_token_count > max_msg_history_tokens:
        msg_history_token_count = max_msg_history_tokens

    remaining_tokens = msg_history_token_count
    messages = []
    # loop backwards to get most recent messages first, then reverse the list after finishing
    for msg in reversed(msg_history):
        token_count = get_token_count(msg["content"])
        if token_count > remaining_tokens:
            break
        else:
            remaining_tokens -= token_count
            messages.append(msg)

    messages.append({"role": "system", "content": system_msg}) #add system msg before reversing so it's first
    messages = list(reversed(messages))

    app.logger.debug('message history tokens: %s', (msg_history_token_count - remaining_tokens))

    start_time = time.time()
    full_response = openai.ChatCompletion.create(
        model=response_model_name,
        messages=messages,
        temperature=response_model_temperature,
    )
    end_time = time.time()
    app.logger.debug('Time taken for OpenAI to respond to user prompt: %s seconds', str(end_time - start_time))


    response = full_response["choices"][0]["message"]["content"]
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))