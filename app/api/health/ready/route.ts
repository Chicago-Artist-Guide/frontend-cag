export const dynamic = 'force-dynamic';

export const GET = () =>
  Response.json(
    { status: 'ready' },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
