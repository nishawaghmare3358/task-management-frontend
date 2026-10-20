
import { useEffect, useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import Login from "./pages/Login";
import api from "./services/api";

// View all tasks
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function fetchTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tasks");
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load tasks. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete task."
      );
    }
  };

  if (loading) {
    return <p>Loading your tasks...</p>;
  }

  return (
    <div className="container">
      <h1>My Tasks</h1>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate("/tasks/new")}>
        Create New Task
      </button>

      {error && <p role="alert">{error}</p>}

      {!error && tasks.length === 0 && (
        <p>No tasks found. Create your first task!</p>
      )}

      {tasks.map((task) => (
        <div
          key={task._id}
          className="task-card"
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            margin: "12px 0",
            borderRadius: "8px",
          }}
        >
          <h3>{task.title}</h3>
          <p>{task.description || "No description"}</p>
          <p>
            Status: {task.completed ? "Completed" : "Pending"}
          </p>

          <button
            onClick={() => navigate(`/tasks/${task._id}/edit`)}
          >
            Edit
          </button>

          <button onClick={() => handleDelete(task._id)}>
            Delete
          </button>

          <button onClick={() => navigate(`/tasks/${task._id}`)}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

// View one task
function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.task);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load task."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  if (loading) return <p>Loading task...</p>;
  if (error) return <p>{error}</p>;
  if (!task) return <p>Task not found.</p>;

  return (
    <div className="container">
      <h1>Task Details</h1>
      <h2>{task.title}</h2>
      <p>{task.description || "No description"}</p>
      <p>Status: {task.completed ? "Completed" : "Pending"}</p>

      <button onClick={() => navigate(`/tasks/${id}/edit`)}>
        Edit Task
      </button>

      <button onClick={() => navigate("/tasks")}>
        Back to Tasks
      </button>
    </div>
  );
}

// Create or edit a task
function TaskForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return;

    async function loadTask() {
      setLoading(true);

      try {
        const response = await api.get(`/tasks/${id}`);
        const task = response.data.task;

        setTitle(task.title || "");
        setDescription(task.description || "");
        setCompleted(Boolean(task.completed));
      } catch (err) {
        setMessage(
          err.response?.data?.message || "Could not load task."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        completed,
      };

      if (isEditing) {
        await api.put(`/tasks/${id}`, taskData);
      } else {
        await api.post("/tasks", taskData);
      }

      navigate("/tasks");
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          `Could not ${isEditing ? "update" : "create"} task.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{isEditing ? "Edit Task" : "Create New Task"}</h1>

      {loading && isEditing ? (
        <p>Loading task...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Task Title</label>
            <br />
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="description">Description</label>
            <br />
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </div>

          <br />

          <label>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            {" "}Completed
          </label>

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Task"
                : "Create Task"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      )}

      {message && <p role="alert">{message}</p>}
    </div>
  );
}

// Application routes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
