import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
  isLeapYear,
} from '../../utils/dateUtils';

describe('isLeapYear', () => {
  it('400으로 나눠지는 연도는 윤년이다', () => {
    const isLeap = isLeapYear(2400);
    expect(isLeap).toBe(true);
  });

  it('100으로 나눠지는 연도는 윤년이 아니다', () => {
    const isLeap = isLeapYear(2100);
    expect(isLeap).toBe(false);
  });

  it('4로 나눠지는 연도는 윤년이다', () => {
    const isLeap = isLeapYear(2024);
    expect(isLeap).toBe(true);
  });

  it('위 조건을 충족하지 못하는 연도는 윤년이 아니다', () => {
    const isLeap = isLeapYear(2025);
    expect(isLeap).toBe(false);
  });
});

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const daysInJanuary = getDaysInMonth(2025, 1);
    expect(daysInJanuary).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const daysInApril = getDaysInMonth(2025, 4);
    expect(daysInApril).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const daysInFedruary = getDaysInMonth(2024, 2);
    expect(daysInFedruary).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const daysInFedruary = getDaysInMonth(2025, 2);
    expect(daysInFedruary).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(() => getDaysInMonth(2025, 15)).toThrow('유효하지 않은 월입니다.');
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-02-05'));

    const expectedDates = [
      new Date('2025-02-02'),
      new Date('2025-02-03'),
      new Date('2025-02-04'),
      new Date('2025-02-05'),
      new Date('2025-02-06'),
      new Date('2025-02-07'),
      new Date('2025-02-08'),
    ];

    expect(weekDates.length).toBe(7);
    expect(weekDates).toEqual(expectedDates);
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-02-02'));

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-02-02'));
    expect(weekDates[6]).toEqual(new Date('2025-02-08'));
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-02-08'));

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-02-02'));
    expect(weekDates[6]).toEqual(new Date('2025-02-08'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const weekDates = getWeekDates(new Date('2024-12-31'));

    const expectedDates = [
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ];

    expect(weekDates.length).toBe(7);
    expect(weekDates).toEqual(expectedDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const weekDates = getWeekDates(new Date('2025-01-01'));

    const expectedDates = [
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ];

    expect(weekDates.length).toBe(7);
    expect(weekDates).toEqual(expectedDates);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2024-02-29'));
    expect(weekDates).toContainEqual(new Date('2024-02-29'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2025-01-31'));

    expect(weekDates.length).toBe(7);
    expect(weekDates.at(-1)).toEqual(new Date('2025-02-01'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2024-07-01'));

    expect(weeksAtMonth[0]).toContain(1);
    expect(weeksAtMonth.at(-1)).toContain(31);
    expect(weeksAtMonth.flat().filter(Boolean).length).toBe(31);
  });

  it('2025년 2월의 첫째 주에는 적절한 null 값이 포함되어야 한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2025-02-01'))[0];

    expect(weeksAtMonth.length).toBe(7);
    expect(weeksAtMonth[0]).toBeNull();
    expect(weeksAtMonth[1]).toBeNull();
    expect(weeksAtMonth[2]).toBeNull();
    expect(weeksAtMonth[3]).toBeNull();
    expect(weeksAtMonth[4]).toBeNull();
    expect(weeksAtMonth[5]).toBeNull();
    expect(weeksAtMonth[6]).toBe(1);
  });

  it('2025년 2월의 마지막 주에는 적절한 null 값이 포함되어야 한다', () => {
    const weeksAtMonth = getWeeksAtMonth(new Date('2025-02-28')).slice(-1)[0];

    expect(weeksAtMonth?.length).toBe(7);
    expect(weeksAtMonth[0]).toBe(23);
    expect(weeksAtMonth[1]).toBe(24);
    expect(weeksAtMonth[2]).toBe(25);
    expect(weeksAtMonth[3]).toBe(26);
    expect(weeksAtMonth[4]).toBe(27);
    expect(weeksAtMonth[5]).toBe(28);
    expect(weeksAtMonth[6]).toBeNull();
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {});

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {});

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {});

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {});
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {});
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {});

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {});

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {});

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {});

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {});

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {});
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {});

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {});

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {});

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {});

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {});

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {});

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {});

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {});

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {});
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
