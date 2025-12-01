import React from 'react';

const Settings = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>General Settings</h2>
        <div style={styles.setting}>
          <label style={styles.label}>Application Name</label>
          <input
            type="text"
            defaultValue="Kulobal Admin"
            style={styles.input}
          />
        </div>
        <div style={styles.setting}>
          <label style={styles.label}>Email Notifications</label>
          <input type="checkbox" defaultChecked style={styles.checkbox} />
        </div>
        <div style={styles.setting}>
          <label style={styles.label}>Language</label>
          <select style={styles.select}>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <button style={styles.button}>Save Changes</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '2rem',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#333',
  },
  setting: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};

export default Settings;