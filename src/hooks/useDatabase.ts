import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<any>;
    SQL: any;
  }
}

export function useDatabase() {
  const [db, setDb] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsReady(false);
        return;
      }

      let SQL = window.SQL;
      
      if (!SQL && window.initSqlJs) {
        SQL = await window.initSqlJs({
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
        });
      }
      
      if (!SQL) {
        console.log('SQL.js not available, using localStorage fallback');
        setIsReady(false);
        return;
      }

      const savedDb = localStorage.getItem('whisker_db');
      let database;
      
      if (savedDb) {
        try {
          const uint8Array = new Uint8Array(JSON.parse(savedDb));
          database = new SQL.Database(uint8Array);
        } catch (e) {
          database = new SQL.Database();
          createTables(database);
        }
      } else {
        database = new SQL.Database();
        createTables(database);
      }
      
      setDb(database);
      setIsReady(true);
    } catch (error) {
      console.error('Database init error:', error);
      setIsReady(false);
    }
  };

  const createTables = (database: any) => {
    database.run(`CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT,
      bio TEXT,
      avatar TEXT,
      connection_key TEXT,
      created_at TEXT
    )`);

    database.run(`CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      name TEXT,
      avatar TEXT,
      type TEXT,
      key TEXT,
      is_online INTEGER,
      created_at TEXT,
      unread INTEGER DEFAULT 0,
      description TEXT,
      members TEXT,
      admins TEXT
    )`);

    database.run(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT,
      text TEXT,
      sender_id TEXT,
      is_sent INTEGER,
      status TEXT,
      created_at TEXT,
      type TEXT DEFAULT 'text',
      file_url TEXT
    )`);

    database.run(`CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      image TEXT,
      author_id TEXT,
      author_name TEXT,
      author_avatar TEXT,
      tags TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TEXT
    )`);

    database.run(`CREATE TABLE IF NOT EXISTS blog_likes (
      blog_id TEXT,
      user_id TEXT,
      PRIMARY KEY (blog_id, user_id)
    )`);
  };

  const saveDatabase = useCallback(() => {
    if (db) {
      try {
        const data = db.export();
        const arr = Array.from(data);
        localStorage.setItem('whisker_db', JSON.stringify(arr));
      } catch (e) {
        console.error('Error saving database:', e);
      }
    }
  }, [db]);

  const runQuery = useCallback((sql: string, params: any[] = []) => {
    if (!db) return false;
    try {
      db.run(sql, params);
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Query error:', error);
      return false;
    }
  }, [db, saveDatabase]);

  const selectQuery = useCallback((sql: string) => {
    if (!db) return [];
    try {
      const result = db.exec(sql);
      return result.length > 0 ? result[0].values : [];
    } catch (error) {
      console.error('Select error:', error);
      return [];
    }
  }, [db]);

  const selectQueryWithParams = useCallback((sql: string, params: any[] = []) => {
    if (!db) return [];
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results: any[][] = [];
      while (stmt.step()) {
        results.push(stmt.get());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('Select error:', error);
      return [];
    }
  }, [db]);

  return { db, isReady, runQuery, selectQuery, selectQueryWithParams, saveDatabase };
}
