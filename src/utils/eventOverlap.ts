import { Event, EventForm } from '../types';

/**
 * 문자열 'YYYY-MM', 'HH:mm'을 Date 타입 데이터로 반환합니다.
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 주어진 Date 객체에서 이벤트 시작 일시와 종료 일시를 가진 객체를 반환합니다.
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 주어진 두 이벤트의 시간이 겹치는지 확인합니다.
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 이벤트 목록에서 새로운 이벤트가 기존 이벤트와 겹치는 시간이 있는지 확인 후 겹치는 이벤트를 배열로 반환합니다.
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
