import React, { useState } from 'react';

const Comments = ({ commentsList, addComment }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addComment(comment);
    setComment('');
  };

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {commentsList.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment"
          required
        />
        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
};

export default Comments;
