import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import eventsData from './response/events.json' assert { type: 'json' };

const events = { ...eventsData };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    const eventFormData = (await request.json()) as EventForm;
    const newEvent = {
      ...eventFormData,
      id: (events.events.length + 1).toString(),
    } as Event;
    events.events.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const updatedEvent = (await request.json()) as Event;
    events.events = events.events.map((e) => (e.id === params.id ? updatedEvent : e));
    return HttpResponse.json(updatedEvent, { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    events.events = events.events.filter((e) => e.id !== params.id);
    return HttpResponse.json({ message: 'Event deleted' }, { status: 200 });
  }),
];

export const setupHandlers = (initEvents = [] as Event[]) => {
  if (initEvents.length) {
    events.events = [...initEvents];
  } else {
    events.events = [...eventsData.events];
  }

  return handlers;
};
