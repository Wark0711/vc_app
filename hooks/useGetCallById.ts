import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useEffect, useState } from "react"

export const useGetCallById = (id: string | string[]) => {
    const [call, setCall] = useState<Call>();
    const [isCallLoading, setIsCallLoading] = useState(true);

    const client = useStreamVideoClient();

    useEffect(() => {
        if (!client) return;

        const loadCall = async () => {
            console.log('loadCall called');
            
            const { calls } = await client.queryCalls({
                filter_conditions: {
                    id
                },
                limit: 10,
            })

            if (calls.length > 0) setCall(calls[0]);

            setIsCallLoading(false)
        }

        loadCall()
    }, [client, id])

    return { isCallLoading, call }
}