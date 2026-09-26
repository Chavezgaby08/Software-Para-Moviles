import { useState } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string, description: string) => {
    const newTask: Task = { id: Date.now().toString(), title, description, completed: false };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  return { tasks, addTask, updateTask, deleteTask, getTaskById };
}