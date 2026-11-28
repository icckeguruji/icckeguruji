import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { getValidYouTubeAccessToken } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const adminHeader = req.headers.get('x-icc-admin-email');
  if (!isAdminRequest(req) && adminHeader !== 'icckeguruji@gmail.com') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      action = 'create',
      title,
      description,
      scheduledAt,
      videoId,
      status,
      visibility = 'unlisted',
    } = body || {};
    const accessToken = await getValidYouTubeAccessToken(req);

    if (action === 'transition') {
      if (!videoId || !status) {
        return NextResponse.json({ success: false, error: 'videoId and status are required' }, { status: 400 });
      }
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=${encodeURIComponent(status)}&id=${encodeURIComponent(videoId)}&part=status`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data?.error?.message || 'Failed to transition YouTube broadcast' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, broadcast: data });
    }

    // Default: Create Unlisted YouTube Live Broadcast + RTMP Stream + Bind
    const startIso = scheduledAt ? new Date(scheduledAt).toISOString() : new Date(Date.now() + 60_000).toISOString();

    const bRes = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: title || 'IDEAL COACHING CENTRE — Live Class',
            description: description || 'Live Interactive Class by BADE SIR — IDEAL COACHING CENTRE',
            scheduledStartTime: startIso,
          },
          status: {
            privacyStatus: ['unlisted', 'public', 'private'].includes(visibility) ? visibility : 'unlisted',
            selfDeclaredMadeForKids: false,
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
            enableDvr: true,
            latencyPreference: 'low',
          },
        }),
      }
    );
    const broadcast = await bRes.json();
    if (!bRes.ok || !broadcast?.id) {
      return NextResponse.json(
        { success: false, error: broadcast?.error?.message || 'Failed to create YouTube Live Broadcast' },
        { status: 400 }
      );
    }

    const sRes = await fetch(
      'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,contentDetails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: { title: `ICC Stream: ${title || broadcast.id}` },
          cdn: {
            frameRate: 'variable',
            ingestionType: 'rtmp',
            resolution: 'variable',
          },
        }),
      }
    );
    const stream = await sRes.json();
    if (!sRes.ok || !stream?.id) {
      return NextResponse.json(
        { success: false, error: stream?.error?.message || 'Failed to create YouTube RTMP Stream' },
        { status: 400 }
      );
    }

    const bindRes = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${encodeURIComponent(broadcast.id)}&part=id,contentDetails&streamId=${encodeURIComponent(stream.id)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!bindRes.ok) {
      const bindErr = await bindRes.json();
      return NextResponse.json(
        { success: false, error: bindErr?.error?.message || 'Failed to bind YouTube stream to broadcast' },
        { status: 400 }
      );
    }

    const ingestion = stream?.cdn?.ingestionInfo || {};
    return NextResponse.json({
      success: true,
      videoId: broadcast.id,
      rtmpUrl: ingestion.ingestionAddress || 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: ingestion.streamName || '',
      watchUrl: `https://youtu.be/${broadcast.id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'YouTube broadcast API error' },
      { status: 500 }
    );
  }
}
