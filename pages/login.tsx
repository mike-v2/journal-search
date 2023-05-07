import { signIn, signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useState } from "react";
import useSWR from "swr";

function Login() {
  const {data: session} = useSession();
  const [isStarred, setIsStarred] = useState(false);
  
  async function handleStarClick(journalEntryId) {
    if (!session || !session.user) {
      return;
    }

    console.log("user id = " + session.user.id);

    try {
      const response = await axios.post('/api/star-entry', {
        userId: session.user.id,
        journalEntryId: journalEntryId,
      });

      if (response.status === 200) {
        console.log("Star successful");
        setIsStarred(true);
      }
    } catch (error) {
      console.error('Error starring journal entry:', error.message);
    }
  }

  function getLoginElement() {
    if (session) {
      return (
        <div>
          <p>Welcome, {session.user?.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      )
    }
  }



  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return data;
    }
  }

  const { data: entries1948, error } = useSWR('/api/entriesData', fetcher);
  if (error) {
    console.log(error);
  }

  async function handleCreatePrismaData() {
    const year = '1948';

    for (let i = 0; i<entries1948.length; i++) {
      const data = {
        id: `${year}-${String(i)}`,
        content: entries1948[i].text,
        createdAt: entries1948[i].date
      }
      const response = await axios.post(`/api/createPrismaData`, data);
    }

  }

  return (
    <div>
      <div>
        {getLoginElement()}
      </div>
      <button onClick={() => handleStarClick("1948-0001")}>
        {isStarred ? 'Unstar' : 'Star'}
      </button>

      <button onClick={() => handleCreatePrismaData()}>Create Prisma Data</button>
    </div>
  )
  
}

export default Login;