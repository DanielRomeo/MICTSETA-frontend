// src/app/(App)/live/[roomId]/page.tsx
import LiveRoomPage from './liveRoomPage';


// This page component is just a wrapper to render the actual LiveRoomPage component.
export default function Page() {
    return (
        <LiveRoomPage />
    );
}