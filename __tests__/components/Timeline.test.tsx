import { fireEvent, render } from '@testing-library/react-native';
import { Timeline } from '../../components/timeline/Timeline';
import type { Task, TaskInstance } from '../../types/models';

function makeInstance(overrides: Partial<Task> & { completed?: boolean }): TaskInstance {
  const { completed, ...taskOverrides } = overrides;
  const task: Task = {
    id: 'task-1',
    routineId: 'routine-1',
    title: 'Task',
    startTime: '08:00',
    durationMinutes: 30,
    categoryId: null,
    icon: null,
    color: '#4F8EF7',
    notes: null,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    ...taskOverrides,
  };
  return { task, category: null, date: '2026-08-31', completed: completed ?? false, completedAt: null };
}

async function fireTimelineLayout(getByTestId: (id: string) => any, width = 400) {
  await fireEvent(getByTestId('timeline-scroll'), 'layout', {
    nativeEvent: { layout: { width, height: 800, x: 0, y: 0 } },
  });
}

describe('Timeline', () => {
  it('renders a task title and calls onToggleTask when its checkbox is pressed', async () => {
    const onToggleTask = jest.fn();
    const instances = [makeInstance({ id: 'a', title: 'Morning walk' })];

    const { getByText, getByTestId } = await render(
      <Timeline instances={instances} onToggleTask={onToggleTask} showNowIndicator={false} />,
    );
    await fireTimelineLayout(getByTestId);

    expect(getByText('Morning walk')).toBeTruthy();

    await fireEvent.press(getByTestId('task-checkbox-a'));
    expect(onToggleTask).toHaveBeenCalledWith('a');
  });

  it('renders multiple tasks without crashing', async () => {
    const instances = [
      makeInstance({ id: 'a', title: 'Breakfast', startTime: '07:00' }),
      makeInstance({ id: 'b', title: 'Standup', startTime: '09:00' }),
    ];

    const { getByText, getByTestId } = await render(
      <Timeline instances={instances} onToggleTask={jest.fn()} showNowIndicator />,
    );
    await fireTimelineLayout(getByTestId);

    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Standup')).toBeTruthy();
  });
});
