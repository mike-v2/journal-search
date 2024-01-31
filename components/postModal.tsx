import { useState } from 'react';
import Modal from 'react-modal';

type PostModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  journalEntryId: string;
  userId: string | undefined;
};

export default function PostModal({
  isOpen,
  closeModal,
  journalEntryId,
  userId,
}: PostModalProps) {
  const [postTitle, setPostTitle] = useState<string>('');
  const [postText, setPostText] = useState<string>('');

  async function handleCreatePost(e: React.MouseEvent<HTMLFormElement>) {
    e.preventDefault();

    if (userId) {
      try {
        const res = await fetch('/api/communityPost', {
          method: 'POST',
          body: JSON.stringify({
            journalEntryId,
            userId,
            title: postTitle,
            text: postText,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    sendCloseModal();
  }

  function sendCloseModal() {
    setPostTitle('');
    setPostText('');
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={sendCloseModal}
      className='m-auto max-w-md rounded-md border bg-slate-800 p-5'
      overlayClassName='fixed inset-0 bg-black bg-opacity-50 flex'
      contentLabel='Create Post Modal'
    >
      <form onSubmit={handleCreatePost}>
        <h2 className='mb-3 text-xl text-slate-200'>Create Post</h2>
        <textarea
          className='mb-3 w-full rounded-md border p-2'
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder='Title'
          required
          aria-label='Post Title'
        />
        <textarea
          className='mb-3 w-full rounded-md border p-2'
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder='What would you like to say about this journal entry?'
          required
          aria-label='Post Text'
        />
        <div className='flex justify-end'>
          <button
            className='mr-2 rounded-md bg-gray-300 px-3 py-1 text-black'
            onClick={sendCloseModal}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='rounded-md bg-blue-600 px-3 py-1 text-white'
          >
            Post
          </button>
        </div>
      </form>
    </Modal>
  );
}
