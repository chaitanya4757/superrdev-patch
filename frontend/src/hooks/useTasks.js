import { useState, useEffect } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 useEffect(() => {
    setLoading(true);
    setError(null); // also clear old errors on each new request

    fetchTasks({ query, status, page, pageSize })
      .then((data) => {
        setTasks(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false); // Bug 4: runs whether success OR error  
      });
  }, [query, status, page, pageSize]);

  return { tasks, total, loading, error };
}
