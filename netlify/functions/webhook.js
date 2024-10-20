const { extractAndUpdateDurations } = require('../../lib/extractDurations');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);

  // Check if the webhook is for a new or updated album
  if (body._type === 'album') {
    try {
      await extractAndUpdateDurations();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Duration extraction completed successfully' })
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'An error occurred during duration extraction' })
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'No action needed' })
    };
  }
};

