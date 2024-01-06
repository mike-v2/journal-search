'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Login() {
  const { data: session } = useSession();

  function getLoginElement() {
    if (session) {
      return (
        <div className='flex justify-end'>
          <Image
            className='object-cover'
            src={session.user?.image as string}
            width={40}
            height={40}
            alt='user profile image'
          />
          <button className='whitespace-nowrap p-2' onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      );
    } else {
      return (
        <div className='flex justify-end'>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      );
    }
  }

  return <>{getLoginElement()}</>;
}
