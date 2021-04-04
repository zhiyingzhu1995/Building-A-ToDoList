import "./styles.css";
import { useImmer } from "use-immer";
import styled from "styled-components";
import { render } from "react-dom";

// Styled component named StyledButton
const StyledButton = styled.button`
  background: black;
  border-radius: 3px;
  border: 2px solid white;
  color: white;
  margin: 01em;
  padding: 0.25em 1em;

  ${(props) =>
    props.primary &&
    css`
      background: palevioletred;
      color: white;
    `};
`;

function* idMaker() {
  var index = 2;
  while (true) yield index++;
}
var gen = idMaker();

const TasksApp = () => {
  const [appState, updateState] = useImmer({
    filterType: "all",
    tasks: [
      { id: 0, title: "uno", completed: true },
      { id: 1, title: "dos", completed: false }
    ]
  });

  const Task = ({ title, completed, toggleTask }) => {
    return (
      <li
        style={{
          textDecoration: completed ? "line-through" : "none"
        }}
        onClick={toggleTask}
      >
        {title}
      </li>
    );
  };

  const createTask = (title) => {
    // only update if the input is not blank
    title.length > 0
      ? updateState((state) => ({
          ...state,
          tasks: [
            ...state.tasks,
            { id: gen.next().value, title: title, completed: false }
          ]
        }))
      : alert("Please Input a Task");
  };

  const toggleTask = (id) => {
    updateState((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  // onClick of the button, then fetch and create tasks
  const url = "https://zhiying-to-do-list.herokuapp.com/tasks";

  // promise has no wait time, it throws error right away if something is wrong
  const fetchPromise = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Promise Alert: HTTP error! status: ${response.status}`);
    }
    return response.json();
  });

  const updateFromPromise = () => {
    // Get the current list of title
    var list = [];
    appState.tasks.map((value, index) => list.push(value.title.toLowerCase()));

    //Only create tasks if task does not exist,else alert
    fetchPromise.then((response) => {
      response.tasks.forEach((item) => {
        list.includes(item.title.toLowerCase())
          ? alert(`Task ${item.title} already exist`)
          : createTask(item.title);
      });
    });
  };

  //using async and wait
  async function fetchAsyncWait() {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `AsyncWait Alert: HTTP error! status: ${response.status}`
      );
    }
    const tasks = await response.json();
    return tasks;
  }

  const updateFromAsync = () => {
    // Get the current list of title
    var list = [];
    appState.tasks.map((value, index) => list.push(value.title.toLowerCase()));

    fetchAsyncWait().then((response) => {
      response.tasks.forEach((item) => {
        list.includes(item.title.toLowerCase())
          ? alert(`Task ${item.title} already exist`)
          : createTask(item.title);
      });
    });
  };

  const TaskForm = ({ taskAction }) => {
    // variable to hold a reference to the input
    let taskInput;

    const handleSubmit = (event) => {
      event.preventDefault();
      taskAction(taskInput.value);
      taskInput.value = "";
    };
    return (
      <form onSubmit={handleSubmit}>
        <label>
          <input ref={(r) => (taskInput = r)} type="text" />
        </label>
        <input type="submit" value="Create Task Manually" />
      </form>
    );
  };

  const TodoFilter = ({ filterType, setFilterType }) => (
    <span>
      <b>Filter Todos: </b>
      {["all", "completed", "active"].map((status, i) => (
        <button key={i} onClick={() => setFilterType(status)}>
          {status}
        </button>
      ))}
    </span>
  );

  const filteredTasks = () => {
    return appState.filterType === "all"
      ? appState.tasks
      : appState.tasks.filter(
          (task) => task.completed === (appState.filterType === "completed")
        );
  };

  const setFilterType = (filterType) => {
    updateState((state) => ({ ...state, filterType }));
  };

  // when you enter, the value from taskForm is being passed to createTask
  return (
    <div>
      <TaskForm taskAction={createTask} />
      <StyledButton onClick={updateFromPromise}>
        {" "}
        Fetch & Add Using Promise
      </StyledButton>
      <StyledButton onClick={updateFromAsync}>
        {" "}
        Fetch & Add Using Async/Wait{" "}
      </StyledButton>

      <h3> Zhiying's To-Do List </h3>

      <TodoFilter
        filterType={appState.filterType}
        setFilterType={setFilterType}
      />
      <ul>
        {filteredTasks().map((task) => (
          <Task
            key={task.id}
            title={task.title}
            completed={task.completed}
            toggleTask={() => toggleTask(task.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <TasksApp />
    </div>
  );
}
