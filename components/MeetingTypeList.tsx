"use client"

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ReactDatePicker from 'react-datepicker'

const MeetingTypeList = () => {

  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()
  const { user } = useUser();
  const client = useStreamVideoClient()
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })
  const [callDetails, setCallDetails] = useState<Call>();
  const { toast } = useToast();
  const now: Date = new Date();
  const time: string = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date: string = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  const createMeeting = async () => {
    if (!client || !user) return;

    try {

      if (!values.dateTime) {
        toast({
          title: "Please select a date and time",
          // description: "Friday, February 10, 2023 at 5:57 PM",
        })
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);

      if (!call) throw new Error("Failed to create call");

      const startsAt = values.dateTime.toISOString();
      const description = values.description;

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description
          }
        }
      })

      setCallDetails(call)
      if (!values.description) {
        router.push(`/meeting/${call.id}`)
      }
      toast({
        title: "Meeting created successfully!",
        description: `${date} at ${time}`,
      })
    }
    catch (err) {
      console.log(err);
      toast({
        title: "Failed to create meeting",
        // description: "Friday, February 10, 2023 at 5:57 PM",
      })
    }
  }

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard
        img='/icons/add-meeting.svg'
        title='New Meeting'
        description='Start an instant Meeting'
        handleClick={() => setMeetingState('isInstantMeeting')}
        className='bg-orange-1'
      />
      <HomeCard
        img='/icons/schedule.svg'
        title='Schedule Meeting'
        description='Plan your Meeting'
        handleClick={() => setMeetingState('isScheduleMeeting')}
        className='bg-blue-1'
      />
      <HomeCard
        img='/icons/recordings.svg'
        title='View Recordings'
        description='Check out your recordings'
        handleClick={() => router.push('/recordings')}
        className='bg-purple-1'
      />
      <HomeCard
        img='/icons/join-meeting.svg'
        title='Join Meeting'
        description='Via invitation link'
        handleClick={() => setMeetingState('isJoiningMeeting')}
        className='bg-yellow-1'
      />
      {
        !callDetails
          ? <MeetingModal
            isOpen={meetingState === 'isScheduleMeeting'}
            onClose={() => setMeetingState(undefined)}
            title={'Create Meeting'}
            handleClick={createMeeting}
          >
            <div className='flex w-full flex-col gap-2.5'>
              <label className='text-sky-2 text-normal leading-[22px] text-base'>Add a description</label>
              <Textarea
                className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                onChange={e => setValues({ ...values, description: e.target.value })}
              />
            </div>
            <div className='flex w-full flex-col gap-2.5'>
              <label className='text-base text-normal leading-[22px] text-sky-2'>Select Date and Time</label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={date => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                timeCaption='time'
                dateFormat={'MMMM d, yyyy h:mm aa'}
                className='w-full rounded bg-dark-3 p-2 focus:outline-none'
              />
            </div>
          </MeetingModal>
          : <MeetingModal
            isOpen={meetingState === 'isScheduleMeeting'}
            onClose={() => setMeetingState(undefined)}
            title={'Meeting Created'}
            className='text-center'
            handleClick={() => {
              navigator.clipboard.writeText(meetingLink)
              toast({ title: 'Link copied' })
            }}
            image='/icons/checked.svg'
            buttonIcon='/icons/copy.svg'
            buttonText={'Copy Meeting Link'}
          />
      }
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title={'Start an Instant Meeting'}
        buttonText={'Start Meeting'}
        handleClick={createMeeting}
        className='text-center'
      />

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title={'Type the link here'}
        className='text-center'
        buttonText={'Join Meeting'}
        handleClick={() => {
          router.push(values.link)
        }}
      >
        <Input
          placeholder='Meeting Link'
          className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
          onChange={e => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>

    </section>
  )
}

export default MeetingTypeList