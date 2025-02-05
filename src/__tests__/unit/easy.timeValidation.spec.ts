import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const error = getTimeErrorMessage('10:25', '09:00');
    expect(error.startTimeError).not.toBeNull();
    expect(error.endTimeError).not.toBeNull();
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const error = getTimeErrorMessage('10:25', '10:25');
    expect(error.startTimeError).not.toBeNull();
    expect(error.endTimeError).not.toBeNull();
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const error = getTimeErrorMessage('10:00', '10:25');
    expect(error.startTimeError).toBeNull();
    expect(error.endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const error = getTimeErrorMessage('', '10:25');
    expect(error.startTimeError).toBeNull();
    expect(error.endTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const error = getTimeErrorMessage('10:25', '');
    expect(error.startTimeError).toBeNull();
    expect(error.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const error = getTimeErrorMessage('', '');
    expect(error.startTimeError).toBeNull();
    expect(error.endTimeError).toBeNull();
  });
});
