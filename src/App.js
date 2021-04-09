import "./styles.css";
import { useImmer } from "use-immer";

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

  // this create tasks from the server
  const createTaskServer = (title, id, completed) => {
    // only update if the input is not blank
    title.length > 0
      ? updateState((state) => ({
          ...state,
          tasks: [
            ...state.tasks,
            { id: id, title: title, completed: completed }
          ]
        }))
      : alert("Please Input a Task");
  };

  // this creates a task locally by manually inputing
  const createTask = (title) => {
    // only update if the input is not blank
    title.length > 0
      ? updateState((state) => ({
          ...state,
          tasks: [
            ...state.tasks,
            { id: appState.tasks.length + 1, title: title, completed: false }
          ]
        }))
      : alert("Please Input a Task");
    // only save to the server if confirmed, else create it locally
    if (
      window.confirm(
        "Are you sure you want to save this new task into the database?"
      )
    ) {
      // save it to the server
      PostTaksPromise(title, appState.tasks.length + 1);
      console.log("This is saved to database");
    } else {
      console.log("This is not saved to database but created locally");
    }
  };

  // when you create a new tasks, pass the new task to the server
  const PostTaksPromise = (title, id) => {
    // id on server is the next list item id + 1
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        id: `${id}`,
        title: `${title}`,
        completed: false
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => response.json())
      .then((json) => console.log(json));
  };

  // when you toggle the tasks, reflect the change to the server by patching
  // fetch for the current state of the id
  // if for that id, if it's complete, change to incomplete, vice versa
  const togglePromise = (id) => {
    // reverse the current state if toggle
    let reverse_status = appState.tasks[id - 1].completed ? false : true;
    fetch(url + `/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed: reverse_status
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => console.log(json));
  };

  const toggleTask = (id) => {
    updateState((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
    // console.log(id);
    // console.log(appState.tasks);
    // console.log(appState.tasks[id - 1]);
    togglePromise(id);
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
          : createTaskServer(item.title, item.id, item.completed);
      });
      console.log(response.tasks);
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
          : createTaskServer(item.title, item.id, item.completed);
      });
    });
  };

  const TaskForm = ({ taskAction }) => {
    // variable to hold a reference to the input
    let taskInput;

    const handleSubmit = (event) => {
      if (appState.tasks.length === 0) {
        alert("Please Synchronize with Server Before Creating Task Manually");
        event.preventDefault();
      } else {
        event.preventDefault();
        taskAction(taskInput.value);
        taskInput.value = "";
      }
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
      <h1> Zhiying's To-Do List</h1>
      <TaskForm taskAction={createTask} />
      <button className="fetch-buttons" onClick={updateFromPromise}>
        Synchronize with Server (Promise)
      </button>
      <button className="fetch-buttons" onClick={updateFromAsync}>
        Synchronize with Server (Async/Wait)
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
