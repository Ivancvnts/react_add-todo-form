import './App.scss';
import { useState } from 'react';

import { User } from './Types/User';
import { Todo } from './Types/Todo';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';

import { TodoList } from './components/TodoList';

function getUserById(userId: number): User | undefined {
  return usersFromServer.find((user: User) => user.id === userId);
}

export const todosWithUsers: Todo[] = todosFromServer.map((todo: Todo) => {
  const user = getUserById(todo.userId);

  return {
    ...todo,
    user: user ? user : undefined,
  };
});

export const App = () => {
  const [isValid, setIsValid] = useState({ title: true, user: true });
  const [todos, setTodos] = useState<Todo[]>(todosWithUsers);
  const [newTodo, setNewTodo] = useState<Todo>({
    id: todos[todos.length - 1]?.id + 1,
    title: '',
    completed: false,
    userId: 0,
    user: undefined,
  });

  const handleChange = (field: string, value: string) => {
    setIsValid(prevState => ({
      ...prevState,
      [field]: true, // Reset validation for the field being changed
    }));
    setNewTodo(prevTodo => ({
      ...prevTodo,
      [field]: value,
    }));
  };

  const addNewUser = (userId: string) => {
    const newUser = getUserById(Number(userId));

    if (!newUser) {
      return;
    }

    setIsValid(prevState => ({
      ...prevState,
      user: true, // Reset validation for the field being changed
    }));
    setNewTodo(prevTodo => ({
      ...prevTodo,
      userId: newUser.id,
      user: newUser,
    }));
  };

  const addTodo = (todoToAdd: Todo) => {
    setTodos(prevTodos => [...prevTodos, todoToAdd]);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTodo.title || !newTodo.user) {
      setIsValid({
        title: !!newTodo.title,
        user: !!newTodo.user,
      });

      return;
    }

    addTodo(newTodo);
  }

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST" onSubmit={handleSubmit}>
        <div className="field">
          <input
            type="text"
            data-cy="titleInput"
            onChange={titleEvent =>
              handleChange('title', titleEvent.target.value)
            }
          />
          {!isValid.title && (
            <span className="error">Please enter a title</span>
          )}
        </div>

        <div className="field">
          <select
            data-cy="userSelect"
            onChange={userEvent => addNewUser(userEvent.target.value)}
          >
            <option value="" selected disabled>
              Choose a user
            </option>
            {usersFromServer.map((user: User) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {!isValid.user && <span className="error">Please choose a user</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>
      <TodoList todos={todos} />
    </div>
  );
};
