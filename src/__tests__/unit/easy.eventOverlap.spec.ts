import { events } from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const parsedDateTime = parseDateTime('2024-07-01', '14:30');
    expect(parsedDateTime).toEqual(new Date(2024, 6, 1, 14, 30));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2024_07_01', '14:30');
    expect(parsedDateTime.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2024-07-01', '14/30');
    expect(parsedDateTime.getTime()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2024-07-01', '');
    expect(parsedDateTime.getTime()).toBeNaN();
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = events[0] as Event;
    const timeObject = convertEventToDateRange(event);
    expect(timeObject.start).toEqual(new Date('2025-02-20 10:00'));
    expect(timeObject.end).toEqual(new Date('2025-02-20 11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = { date: '2024_07_01', startTime: '14:30', endTime: '15:30' } as Event;
    const timeObject = convertEventToDateRange(event);
    expect(timeObject.start.getTime()).toBeNaN();
    expect(timeObject.end.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = { date: '2024-07-01', startTime: '14/30', endTime: '15/30' } as Event;
    const timeObject = convertEventToDateRange(event);
    expect(timeObject.start.getTime()).toBeNaN();
    expect(timeObject.end.getTime()).toBeNaN();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const eventA = { date: '2024-07-01', startTime: '14:30', endTime: '15:30' } as Event;
    const eventB = { date: '2024-07-01', startTime: '15:00', endTime: '16:00' } as Event;
    const isOverlap = isOverlapping(eventA, eventB);
    expect(isOverlap).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const eventA = { date: '2024-07-01', startTime: '14:30', endTime: '15:30' } as Event;
    const eventB = { date: '2024-07-01', startTime: '15:30', endTime: '16:30' } as Event;
    const isOverlap = isOverlapping(eventA, eventB);
    expect(isOverlap).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '123',
      title: '점심 약속',
      date: '2025-02-21',
      startTime: '12:40',
      endTime: '13:40',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    } as Event;

    const overlapEvents = findOverlappingEvents(newEvent, events as Event[]);
    expect(overlapEvents.length).toBe(1);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '123',
      title: '점심 약속',
      date: '2025-02-01',
      startTime: '12:40',
      endTime: '13:40',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    } as Event;

    const overlapEvents = findOverlappingEvents(newEvent, events as Event[]);
    expect(overlapEvents).toEqual([]);
  });
});
