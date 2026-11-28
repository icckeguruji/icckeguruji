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

      const fetchBroadcast = async () => {
        const r = await fetch(
          `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status,contentDetails&id=${encodeURIComponent(videoId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
        );
        const j = await r.json();
        return j?.items?.[0] || null;
      };

      const callTransition = async (targetStatus: string) => {
        const r = await fetch(
          `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=${encodeURIComponent(targetStatus)}&id=${encodeURIComponent(videoId)}&part=status`,
          { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const d = await r.json();
        return { ok: r.ok, data: d };
      };

      const current = await fetchBroadcast();
      const lifeCycle = current?.status?.lifeCycleStatus as string | undefined;
      const autoStart = Boolean(current?.contentDetails?.enableAutoStart);
      const boundStreamId = current?.contentDetails?.boundStreamId as string | undefined;

      if (status === 'live') {
        if (lifeCycle === 'live' || lifeCycle === 'liveStarting') {
          return NextResponse.json({ success: true, alreadyLive: true, broadcast: current });
        }

        if (lifeCycle === 'complete') {
          return NextResponse.json(
            { success: false, error: 'This YouTube broadcast has already ended. Please create a new Live Class.' },
            { status: 400 }
          );
        }

        // Wait briefly for RTMP stream to become active if needed
        let streamActive = false;
        if (boundStreamId) {
          for (let attempt = 0; attempt < 3; attempt++) {
            const sRes = await fetch(
              `https://www.googleapis.com/youtube/v3/liveStreams?part=status&id=${encodeURIComponent(boundStreamId)}`,
              { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
            );
            const sJson = await sRes.json();
            const streamStatus = sJson?.items?.[0]?.status?.streamStatus;
            if (streamStatus === 'active') {
              streamActive = true;
              break;
            }
            if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
          }
        }

        // Re-check broadcast status in case enableAutoStart already moved it to live/liveStarting
        const refreshed = await fetchBroadcast();
        const refreshedCycle = refreshed?.status?.lifeCycleStatus as string | undefined;
        if (refreshedCycle === 'live' || refreshedCycle === 'liveStarting') {
          return NextResponse.json({ success: true, alreadyLive: true, broadcast: refreshed });
        }

        if (!streamActive && autoStart) {
          return NextResponse.json({
            success: true,
            pendingAutoStart: true,
            message: 'RTMP stream connected. YouTube Auto-Start will mark the broadcast LIVE in a few seconds.',
            broadcast: refreshed || current,
          });
        }

        let res = await callTransition('live');
        if (!res.ok && refreshedCycle === 'ready') {
          // Some channels require ready -> testing -> live
          const testRes = await callTransition('testing');
          if (testRes.ok) {
            await new Promise((r) => setTimeout(r, 1500));
            res = await callTransition('live');
          }
        }

        if (!res.ok) {
          const afterCheck = await fetchBroadcast();
          const afterCycle = afterCheck?.status?.lifeCycleStatus;
          if (afterCycle === 'live' || afterCycle === 'liveStarting') {
            return NextResponse.json({ success: true, alreadyLive: true, broadcast: afterCheck });
          }
          if (autoStart) {
            return NextResponse.json({
              success: true,
              pendingAutoStart: true,
              message: 'YouTube Auto-Start is enabled; broadcast will go LIVE once video frames arrive.',
              broadcast: afterCheck || current,
            });
          }
          return NextResponse.json(
            { success: false, error: res.data?.error?.message || 'Failed to transition YouTube broadcast to live' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, broadcast: res.data });
      }

      if (status === 'complete') {
        if (lifeCycle === 'complete') {
          return NextResponse.json({ success: true, alreadyComplete: true, broadcast: current });
        }
        if (lifeCycle !== 'live' && lifeCycle !== 'liveStarting') {
          return NextResponse.json({
            success: true,
            skipped: true,
            note: `Broadcast was in '${lifeCycle || 'ready'}' state and not live yet.`,
            broadcast: current,
          });
        }
        const res = await callTransition('complete');
        if (!res.ok) {
          const afterCheck = await fetchBroadcast();
          if (afterCheck?.status?.lifeCycleStatus === 'complete') {
            return NextResponse.json({ success: true, alreadyComplete: true, broadcast: afterCheck });
          }
          return NextResponse.json(
            { success: false, error: res.data?.error?.message || 'Failed to end YouTube broadcast' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, broadcast: res.data });
      }

      const fallbackRes = await callTransition(status);
      if (!fallbackRes.ok) {
        return NextResponse.json(
          { success: false, error: fallbackRes.data?.error?.message || 'Failed to transition YouTube broadcast' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, broadcast: fallbackRes.data });
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
