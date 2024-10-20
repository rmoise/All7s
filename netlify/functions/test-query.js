exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const { testParam } = event.queryStringParameters || {};
  console.log('Received testParam:', testParam);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: testParam || null }),
  };
};

