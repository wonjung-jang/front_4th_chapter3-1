import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeleting,
} from '../__mocks__/handlersUtils';
import eventsData from '../__mocks__/response/realEvents.json' assert { type: 'json' };
import App from '../App';
import { Event } from '../types';

const newEvent = {
  id: '1',
  title: '기존 회의',
  date: '2025-02-20',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
} as Event;

beforeEach(() => {
  vi.setSystemTime(new Date('2025-02-20T08:50:00'));
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const notificationTimeInput = screen.getByLabelText('알림 설정');

    const submitButton = screen.getByRole('button', { name: '일정 추가' });

    await user.type(titleInput, newEvent.title);
    await user.type(dateInput, newEvent.date);
    await user.type(startTimeInput, newEvent.startTime);
    await user.type(endTimeInput, newEvent.endTime);
    await user.type(descriptionInput, newEvent.description);
    await user.type(locationInput, newEvent.location);
    await user.selectOptions(categoryInput, newEvent.category);
    await user.type(notificationTimeInput, newEvent.notificationTime.toString());

    await user.click(submitButton);

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating([newEvent]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const updateButton = await screen.findByLabelText('Edit event');
    await user.click(updateButton);

    const titleInput = screen.getByLabelText('제목');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '09:30');

    const submitButton = screen.getByRole('button', { name: '일정 수정' });
    await user.click(submitButton);

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeleting([newEvent]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).queryByText(newEvent.title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([
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
    ]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'month');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'month');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 마감')).toBeInTheDocument();
      expect(within(eventList).getByText('생일 파티')).toBeInTheDocument();
      expect(within(eventList).getByText('운동')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01T10:00:00'));

    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '저녁 식사');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    const eventList = await screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).queryByText('점심 약속')).toBeNull();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.type(titleInput, '새로운 일정');
    await user.type(dateInput, '2025-02-20');
    await user.type(startTimeInput, '09:30');
    await user.type(endTimeInput, '10:30');

    const submitButton = screen.getByRole('button', { name: '일정 추가' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating(eventsData.events as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const editButtonList = await screen.findAllByLabelText('Edit event');
    await user.click(editButtonList[0]);

    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-02-21');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '13:30');

    const submitButton = screen.getByRole('button', { name: '일정 수정' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([newEvent]);
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });
});
