import { Client } from 'pg';

export interface GitInfo {
  name: string;
  email: string;
  branch: string;
  commit: string;
}

export interface LogEntry {
  appId: string;
  zeUserId: string;
  zeBuildId: string;
  logLevel: string;
  actionType: string;
  git: GitInfo;
  message: string;
  meta: {
    isCI: boolean;
  };
  createdAt: number;
}

export async function insertNewEntry(client: Client, entry: LogEntry) {
  const {
    appId,
    zeUserId,
    zeBuildId,
    logLevel,
    actionType,
    message,
    createdAt,
    meta,
    git,
  } = entry;

  const logsQuery = `
    INSERT INTO logs (appId, zeUserId, zeBuildId, logLevel, actionType, message, createdAt, meta)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
  `;

  try {
    // Insert into logs and get the newly created ID
    const res = await client.query(logsQuery, [
      appId,
      zeUserId,
      zeBuildId,
      logLevel,
      actionType,
      message,
      createdAt,
      JSON.stringify(meta),
    ]);
    const newId = res.rows[0].id;

    // If you need to insert into the `git_info` table as well, you can do it here using `newId`
    const gitQuery = `
      INSERT INTO git_info (name, email, branch, commit, log_id)
      VALUES ($1, $2, $3, $4, $5);
    `;
    process.nextTick(() => {
      client.query(gitQuery, [
        git.name,
        git.email,
        git.branch,
        git.commit,
        newId,
      ]);
    });

    return newId;
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
}

export async function getLastTenEntries(client: Client, appId) {
  const query = `
    SELECT * FROM logs
    WHERE appId = $1
    ORDER BY id DESC
    LIMIT 10;
  `;

  try {
    const res = await client.query(query, [appId]);
    return res.rows;
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
}

export async function getEntriesAfterId(client: Client, appId, specificId) {
  const query = `
    SELECT * FROM logs
    WHERE appId = $2 AND id > $1
    ORDER BY id ASC;
  `;

  try {
    const res = await client.query(query, [specificId, appId]);
    return res.rows;
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
}

// Example usage
/*const sampleEntry = {
    appId: 'mono/sample-react-app',
    zeUserId: 'valorkin',
    zeBuildId: '1234567890',
    logLevel: 'debug',
    actionType: 'build',
    message: 'build deployed in 2ms',
    createdAt: 1697759173516,
    meta: {isCI: false}
};*/

/*
-- Create a new table based on the JSON structure
-- Create main table
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    appId TEXT NOT NULL,
    zeUserId TEXT,
    zeBuildId TEXT,
    logLevel TEXT,
    actionType TEXT,
    message TEXT,
    createdAt BIGINT,
    meta JSONB
);

-- Create git information table
CREATE TABLE IF NOT EXISTS git_info (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    branch TEXT,
    commit TEXT,
    log_id INTEGER REFERENCES logs(id)
);

CREATE INDEX idx_logs_appId_id ON logs(appId, id);

create new

INSERT INTO logs (appId, zeUserId, zeBuildId, logLevel, actionType, gitName, gitEmail, gitBranch, gitCommit, message, isCI, createdAt)
VALUES ('mono/sample-react-app', 'valorkin', '1234567890', 'debug', 'build', 'Dmitriy Shekhovtsov', 'valorkin@gmail.com', 'master', '1234567890', 'build deployed in 2ms', false, 1697759173516);


SELECT * FROM logs ORDER BY id DESC LIMIT 10;

SELECT * FROM logs WHERE id > 5;
 */
