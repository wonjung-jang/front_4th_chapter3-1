import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const events = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-02-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-02-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-02-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-02-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-02-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
] as Event[];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    vi.setSystemTime(new Date('2025-02-20T09:00:00'));
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    vi.setSystemTime(new Date('2025-02-20T09:30:00'));
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications).toContainEqual(
      expect.objectContaining({
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      })
    );
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    vi.setSystemTime(new Date('2025-02-20T09:30:00'));
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    vi.setSystemTime(new Date('2025-02-20T09:30:00'));
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications).toContainEqual(
      expect.objectContaining({
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      })
    );
  });
});
