import "./styles.css";
import { useImmer } from "use-immer";

// ID generator
function* idMaker() {
  var index = -1;
  while (true) yield index++;
}
var gen = idMaker();

const TasksApp = () => {
  const [appState, updateState] = useImmer({
    filterType: "all",
    tasks: []
  });

  const Task = ({ title, completed, toggleTask }) => {
    return (
      <li
        className="task-row"
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
          <input
            className="task-input"
            ref={(r) => (taskInput = r)}
            type="text"
          />
        </label>
        <input
          className="task-button"
          type="submit"
          value="Create Task Manually"
        />
      </form>
    );
  };

  const TodoFilter = ({ filterType, setFilterType }) => (
    <span>
      <b className="filter-text">Filter Tasks: </b>
      {["all", "completed", "active"].map((status, i) => (
        <button
          className="filter-buttons"
          key={i}
          onClick={() => setFilterType(status)}
        >
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
      <h1> Zhiying's To-Do List </h1>
      <TaskForm taskAction={createTask} />
      <button className="fetch-buttons" onClick={updateFromPromise}>
        Fetch from Server (Promise)
      </button>
      <button className="fetch-buttons" onClick={updateFromAsync}>
        Fetch from Server (Async/Wait)
      </button>
      <h3> </h3>

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
