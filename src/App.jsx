import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupingOption, setGroupingOption] = useState('status');
  const [sortingOption, setSortingOption] = useState('priority');

  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        setTickets(data.tickets);
        setUsers(data.users);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    localStorage.setItem('groupingOption', groupingOption);
    localStorage.setItem('sortingOption', sortingOption);
  }, [groupingOption, sortingOption]);

  useEffect(() => {
    const savedGrouping = localStorage.getItem('groupingOption');
    const savedSorting = localStorage.getItem('sortingOption');

    if (savedGrouping) {
      setGroupingOption(savedGrouping);
    }

    if (savedSorting) {
      setSortingOption(savedSorting);
    }
  }, []);

  const groupAndSortTickets = (tickets, groupingOption, sortingOption, users) => {
    let groupedTickets = {};

    // Grouping logic
    if (groupingOption === 'status') {
      groupedTickets = tickets.reduce((groups, ticket) => {
        const status = ticket.status;
        if (!groups[status]) {
          groups[status] = [];
        }
        groups[status].push(ticket);
        return groups;
      }, {});
    } else if (groupingOption === 'userId') {
      groupedTickets = tickets.reduce((groups, ticket) => {
        const user = users.find(user => user.id === ticket.userId);
        const userName = user ? user.name : 'Unknown User';

        if (!groups[userName]) {
          groups[userName] = [];
        }
        groups[userName].push(ticket);
        return groups;
      }, {});
    } else if (groupingOption === 'priority') {
      groupedTickets = tickets.reduce((groups, ticket) => {
        const priority = ticket.priority;
        if (!groups[priority]) {
          groups[priority] = [];
        }
        groups[priority].push(ticket);
        return groups;
      }, {});
    }

    // Sorting logic
    for (const group in groupedTickets) {
      if (sortingOption === 'priority') {
        groupedTickets[group].sort((a, b) => b.priority - a.priority);
      } else if (sortingOption === 'title') {
        groupedTickets[group].sort((a, b) => a.title.localeCompare(b.title));
      }
    }

    return groupedTickets;
  };

  const groupedAndSortedTickets = groupAndSortTickets(
    tickets,
    groupingOption,
    sortingOption,
    users
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1></h1>
        <div className="controls">
          <label>
            Group by:
            <select
              value={groupingOption}
              onChange={e => setGroupingOption(e.target.value)}
            >
              <option value="status">Status</option>
              <option value="userId">User</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <label>
            Sort by:
            <select
              value={sortingOption}
              onChange={e => setSortingOption(e.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>
      </header>
      <main className="App-main">
        <div className="kanban-board">
          {Object.entries(groupedAndSortedTickets).map(([group, ticketsInGroup]) => (
            <div key={group} className="group">
              <h2>{group}</h2>
              {ticketsInGroup.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <h3>{ticket.title}</h3>
                  <p>Status: {ticket.status}</p>
                  <p>Priority: {ticket.priority}</p>
                  {groupingOption === 'userId' && <p>Assigned to: {group}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;