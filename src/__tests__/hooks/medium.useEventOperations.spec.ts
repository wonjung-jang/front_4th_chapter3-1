import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('정상적인 상황', () => {
  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    await waitFor(() => {
      expect(result.current.events).toEqual([
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();
    const { result } = renderHook(() => useEventOperations(false));

    const newEvent = {
      title: '새로운 회의',
      date: '2024-10-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as EventForm;

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(
        expect.objectContaining({
          title: newEvent.title,
          date: newEvent.date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          description: newEvent.description,
        })
      );
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent = {
      id: '1',
      title: '업데이트된 회의',
      date: '2024-10-16',
      startTime: '10:00',
      endTime: '12:00',
      description: '업데이트된 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(updatedEvent);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toEqual([]);
    });
  });
});

describe('에러 상황', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );
    renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );
    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent = {
      id: '2',
      title: '업데이트된 회의',
      date: '2024-10-16',
      startTime: '10:00',
      endTime: '12:00',
      description: '업데이트된 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 저장 실패',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      );
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: '일정 삭제 실패' }));
    });
  });
});
