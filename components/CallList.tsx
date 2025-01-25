// @ts-nocheck
"use client"

import React, { useEffect, useState } from 'react'
import { useGetCalls } from '@/hooks/useGetCalls'
import { useRouter } from 'next/navigation'
import { Call, CallRecording } from '@stream-io/video-react-sdk'
import MeetingCard from './MeetingCard'
import Loader from './Loader'

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {

    const [recordings, setRecordings] = useState<CallRecording[]>([])
    const { endedCalls, upcomingCalls, callRecordings, isloading } = useGetCalls()
    const router = useRouter()

    const getCalls = () => {
        switch (type) {
            case 'ended':
                return endedCalls
            case 'upcoming':
                return upcomingCalls
            case 'recordings':
                return recordings

            default:
                return [];
        }
    }

    const getNoCallsMessage = () => {
        switch (type) {
            case 'ended':
                return 'No Previous Calls'
            case 'upcoming':
                return 'No Upcoming Calls'
            case 'recordings':
                return 'No Recordings'

            default:
                return '';
        }
    }

    useEffect(() => {
        const fetchRecordings = async () => {
            const callData = await Promise.all(callRecordings.map((meeting) => meeting.queryRecordings()))

            const recordings = callData
            .filter(call => call.recordings.length > 0)
            .flatMap(call => call.recordings)

            setRecordings(recordings)
        }

        if (type === 'recordings') {
            fetchRecordings()
        }
    }, [type, callRecordings])


    const calls = getCalls();
    const noCallsMessage = getNoCallsMessage();

    if (isloading) return <Loader />

    return (
        <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
            {
                calls && calls.length > 0
                    ? calls.map((meeting: Call | CallRecording) => (
                        <MeetingCard
                            key={(meeting as Call).id}
                            icon={
                                type === 'ended'
                                    ? '/icons/upcoming.svg'
                                    : type == 'recordings'
                                        ? '/icons/recordings.svg'
                                        : '/icons/upcoming.svg'
                            }
                            title={(meeting as Call).state?.custom?.description?.substring(0, 20) || "No description"}
                            date={(meeting as Call).state?.startsAt?.toLocaleString() || (meeting as Call).start_time?.toLocaleString()}
                            isPreviousMeeting={type === 'ended'}
                            buttonIcon1={
                                type === 'recordings'
                                    ? '/icons/play.svg'
                                    : undefined
                            }
                            buttonText={
                                type === 'recordings'
                                    ? 'Play'
                                    : 'Start'
                            }
                            link={type === 'recordings' ? (meeting as Call).url : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`}
                            handleClick={
                                type === 'recordings'
                                    ? () => router.push(`${(meeting as Call).url}`)
                                    : () => router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`)
                            }
                        />
                    ))
                    : <h1>{noCallsMessage}</h1>
            }
        </div>
    )
}

export default CallList