import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CalendarSection } from '../../components/calendar/CalendarSection';

describe('CalendarSection', () => {
  it('view가 month일 때 35개의 td가 렌더링된다.', () => {
    render(
      <ChakraProvider>
        <CalendarSection
          currentDate={new Date()}
          filteredEvents={[]}
          notifiedEvents={[]}
          navigate={vi.fn()}
          view="month"
          setView={vi.fn()}
          holidays={{}}
        />
      </ChakraProvider>
    );

    const tdList = screen.getAllByRole('gridcell');
    expect(tdList).toHaveLength(35);
  });

  it('월간 view에서 주간 view로 변경하면 view의 값이 week로 변경된다.', async () => {
    const mockSetView = vi.fn();

    render(
      <ChakraProvider>
        <CalendarSection
          currentDate={new Date()}
          filteredEvents={[]}
          notifiedEvents={[]}
          navigate={vi.fn()}
          view="month"
          setView={mockSetView}
          holidays={{}}
        />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();

    const selectBox = screen.getByLabelText('view');
    await user.selectOptions(selectBox, 'week');

    expect(mockSetView).toHaveBeenCalledWith('week');
  });

  it('view가 week일 때 7개의 td가 렌더링된다.', () => {
    render(
      <ChakraProvider>
        <CalendarSection
          currentDate={new Date()}
          filteredEvents={[]}
          notifiedEvents={[]}
          navigate={vi.fn()}
          view="week"
          setView={vi.fn()}
          holidays={{}}
        />
      </ChakraProvider>
    );

    const tdList = screen.getAllByRole('gridcell');
    expect(tdList).toHaveLength(7);
  });

  it('주간 view에서 월간 view로 변경하면 view의 값이 month로 변경된다.', async () => {
    const mockSetView = vi.fn();

    render(
      <ChakraProvider>
        <CalendarSection
          currentDate={new Date()}
          filteredEvents={[]}
          notifiedEvents={[]}
          navigate={vi.fn()}
          view="week"
          setView={mockSetView}
          holidays={{}}
        />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();

    const selectBox = screen.getByLabelText('view');
    await user.selectOptions(selectBox, 'month');

    expect(mockSetView).toHaveBeenCalledWith('month');
  });
});
