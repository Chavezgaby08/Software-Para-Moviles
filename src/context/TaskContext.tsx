import React, { createContext } from 'react';
import { useTasks } from '../hooks/useTasks';

export const TaskContext = createContext<ReturnType<typeof useTasks> | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const taskState = useTasks();
  return <TaskContext.Provider value={taskState}>{children}</TaskContext.Provider>;
};