import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@elastic/elasticsearch';
import { AnalysisEntry } from '@/components/analysisEntryType';
import { SearchTerms } from '@/components/searchTermsType';

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID as string,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME as string,
    password: process.env.ELASTIC_PASSWORD as string
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let {date, text, people, places, organizations, things, emotions, mood } = req.query;

  const getFilterConditions = (searchTerms: SearchTerms) => {
    const { date, text, people, places, organizations, things, emotions, moods } = searchTerms;
    
    const conditions = [];

    if (date && date !== '') {
      let [gte, lt] = date?.split(':');
      let [month, day, year] = gte.split('-');
      gte = `${year}-${month}-${day}T`;
      
      [month, day, year] = lt.split('-');
      lt = `${year}-${month}-${day}T`;

      conditions.push({
        range: {
          '@timestamp': {
            gte: gte,
            lt: lt,
          },
        },
      });
    }
    if (text && text.length > 0) {
      conditions.push({ match: { summary: text } });
    }
    if (people && people.length > 0) {
      conditions.push({ match: { people: people } });
    }
    if (places && places.length > 0) {
      conditions.push({ match: { places: places } });
    }
    if (organizations && organizations.length > 0) {
      conditions.push({ match: { organizations: organizations } });
    }
    if (things && things.length > 0) {
      conditions.push({ match: { things: things } });
    }
    if (emotions && emotions.length > 0) {
      conditions.push({ match: { emotion: emotions } });
    }
    if (moods && moods.length > 0) {
      conditions.push({ match: { mood: moods } });
    }

    console.log("conditions:")
    console.log(conditions);

    return conditions;
  };

  const results = await client.search<AnalysisEntry>({
    index: 'entries',
    size: 10,
    query: {
      bool: {
        filter: getFilterConditions(req.query as SearchTerms),
      },
    },
  });

  res.status(200).json(results.hits.hits);
}

